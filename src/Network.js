const { Association } = require('./Association');
const {
  AAbort,
  AAssociateAC,
  AAssociateRJ,
  AAssociateRQ,
  AReleaseRP,
  AReleaseRQ,
  PDataTF,
  Pdv,
  RawPdu,
} = require('./Pdu');
const { CommandFieldType, Status, TranscodableTransferSyntaxes } = require('./Constants');
const {
  CCancelRequest,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CGetRequest,
  CGetResponse,
  CMoveRequest,
  CMoveResponse,
  Command,
  CStoreRequest,
  CStoreResponse,
  NActionRequest,
  NActionResponse,
  NCreateRequest,
  NCreateResponse,
  NDeleteRequest,
  NDeleteResponse,
  NEventReportRequest,
  NEventReportResponse,
  NGetRequest,
  NGetResponse,
  NSetRequest,
  NSetResponse,
  Response,
} = require('./Command');
const Dataset = require('./Dataset');
const Implementation = require('./Implementation');
const Statistics = require('./Statistics');
const log = require('./log');

const { SmartBuffer } = require('smart-buffer');
const { EOL } = require('os');
const AsyncEventEmitter = require('async-eventemitter');
const MemoryStream = require('memorystream');

//#region Network
class Network extends AsyncEventEmitter {
  /**
   * Creates an instance of Network.
   * @constructor
   * @param {Socket} socket - Network socket.
   * @param {Object} [opts] - Network options.
   * @param {number} [opts.connectTimeout] - Connection timeout in milliseconds.
   * @param {number} [opts.associationTimeout] - Association timeout in milliseconds.
   * @param {number} [opts.pduTimeout] - PDU timeout in milliseconds.
   * @param {boolean} [opts.logCommandDatasets] - Log DIMSE command datasets.
   * @param {boolean} [opts.logDatasets] - Log DIMSE datasets.
   * @param {Object} [opts.datasetReadOptions] - The read options to pass through to `DicomMessage._read()`.
   * @param {Object} [opts.datasetWriteOptions] - The write options to pass through to `DicomMessage.write()`.
   * @param {Object} [opts.datasetNameMap] - Additional DICOM tags to recognize when denaturalizing the dataset.
   */
  constructor(socket, opts) {
    super();
    this.messageId = 0;
    this.socket = socket;
    this.requests = [];
    this.pending = [];

    this.dimseStream = undefined;
    this.dimseStoreStream = undefined;
    this.dimse = undefined;

    opts = opts || {};
    this.connectTimeout = opts.connectTimeout || 3 * 60 * 1000;
    this.associationTimeout = opts.associationTimeout || 1 * 60 * 1000;
    this.pduTimeout = opts.pduTimeout || 1 * 60 * 1000;
    this.logCommandDatasets = opts.logCommandDatasets || false;
    this.logDatasets = opts.logDatasets || false;
    this.datasetReadOptions = opts.datasetReadOptions || {};
    this.datasetWriteOptions = opts.datasetWriteOptions || {};
    this.datasetNameMap = opts.datasetNameMap || {};
    this.logId = '';
    this.connected = false;
    this.connectedTime = undefined;
    this.lastPduTime = undefined;
    this.timeoutIntervalId = undefined;
    this.statistics = new Statistics();

    this._wrapSocket();
  }

  /**
   * Sends association request.
   * @method
   * @param {Association} association - Association.
   */
  sendAssociationRequest(association) {
    this.association = association;
    const rq = new AAssociateRQ(this.association);
    const rqPdu = rq.write();

    this.logId = this.association.getCalledAeTitle();
    log.info(`${this.logId} -> Association request:${EOL}${this.association.toString()}`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association accept.
   * @method
   */
  sendAssociationAccept() {
    this.association.setImplementationClassUid(Implementation.getImplementationClassUid());
    this.association.setImplementationVersion(Implementation.getImplementationVersion());
    this.association.setMaxPduLength(
      Math.min(this.association.getMaxPduLength(), Implementation.getMaxPduLength())
    );

    const rq = new AAssociateAC(this.association);
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Association accept:${EOL}${this.association.toString()}`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association reject.
   * @method
   * @param {number} [result] - Rejection result.
   * @param {number} [source] - Rejection source.
   * @param {number} [reason] - Rejection reason.
   */
  sendAssociationReject(result, source, reason) {
    const rq = new AAssociateRJ(result, source, reason);
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Association reject ${rq.toString()}`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association release request.
   * @method
   */
  sendAssociationReleaseRequest() {
    const rq = new AReleaseRQ();
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Association release request`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association release response.
   * @method
   */
  sendAssociationReleaseResponse() {
    const rq = new AReleaseRP();
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Association release response`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends requests.
   * @method
   * @param {Array<Request>|Request} requests - Requests to perform.
   */
  sendRequests(requests) {
    const rqs = Array.isArray(requests) ? requests : [requests];
    this.requests.push(...rqs);
    this._sendNextRequests();
  }

  /**
   * Sends cancel request.
   * @method
   * @param {CFindRequest|CMoveRequest|CGetRequest} request - C-FIND, C-MOVE or C-GET request.
   * @throws Error if request is not an instance of CFindRequest, CMoveRequest or CGetRequest.
   */
  sendCancel(request) {
    if (!this.association) {
      log.error(
        `There is no association in which to cancel request ${request.toString()}. Skipping...`
      );
      return;
    }

    const cancelRequest = CCancelRequest.fromRequest(request);
    const context = this.association.getAcceptedPresentationContextFromRequest(cancelRequest);
    if (!context) {
      log.error(
        `Could not find an accepted presentation context to cancel request ${request.toString()}. Skipping...`
      );
      return;
    }
    const dimse = { context, command: cancelRequest };
    this._sendDimse(dimse);
  }

  /**
   * Sends abort request.
   * @method
   * @param {number} [source] - Abortion source.
   * @param {number} [reason] - Abortion reason.
   */
  sendAbort(source, reason) {
    if (!this.association) {
      log.error(`There is no association to perform abort. Skipping...`);
      return;
    }

    const rq = new AAbort(source, reason);
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Abort ${rq.toString()}`);
    this._sendPdu(rqPdu);
  }

  /**
   * Gets network statistics.
   * @method
   * @returns {Statistics} Network statistics.
   */
  getStatistics() {
    return this.statistics;
  }

  /**
   * Allows the caller to create a Writable stream to accumulate the C-STORE dataset.
   * The default implementation creates a memory Writable stream that for, big instances,
   * could cause out of memory situations.
   * @method
   * @param {PresentationContext} acceptedPresentationContext - The accepted presentation context.
   * @returns {Writable} The created store writable stream.
   */
  // eslint-disable-next-line no-unused-vars
  createStoreWritableStream(acceptedPresentationContext) {
    return MemoryStream.createWriteStream();
  }

  /**
   * Allows the caller to create a Dataset from the Writable stream used to
   * accumulate the C-STORE dataset. The created Dataset is passed to the
   * Scp.cStoreRequest method for processing.
   * @method
   * @param {Writable} writable - The store writable stream.
   * @param {PresentationContext} acceptedPresentationContext - The accepted presentation context.
   * @param {function(Dataset)} callback - Created dataset callback function.
   */
  createDatasetFromStoreWritableStream(writable, acceptedPresentationContext, callback) {
    const dataset = new Dataset(
      writable.toBuffer(),
      acceptedPresentationContext.getAcceptedTransferSyntaxUid()
    );
    callback(dataset);
  }

  //#region Private Methods
  /**
   * Advances the message ID.
   * @method
   * @private
   */
  _getNextMessageId() {
    return ++this.messageId % 65536;
  }

  /**
   * Sends PDU over the network.
   * @method
   * @private
   * @param {Buffer} pdu - PDU.
   */
  _sendPdu(pdu) {
    try {
      const buffer = pdu.writePdu();
      this.socket.write(buffer);
      this.statistics.addBytesSent(buffer.length);
    } catch (err) {
      log.error(`${this.logId} -> Error sending PDU [type: ${pdu.getType()}]: ${err.message}`);
      this.emit('networkError', err);
    }
  }

  /**
   * Sends requests over the network.
   * @method
   * @private
   */
  _sendNextRequests() {
    const processNextRequest = () => {
      const request = this.requests.shift();
      if (!request) {
        // Done with requests
        this.emit('done');
        return;
      }
      const context = this.association.getAcceptedPresentationContextFromRequest(request);
      if (context) {
        // Lazy load the datasets to store
        if (request instanceof CStoreRequest) {
          request.loadFullDatasetIfNeeded();
        }
        request.setMessageId(this._getNextMessageId());
        this.pending.push(request);
        const dimse = { context, command: request };
        dimse.command.on('done', () => {
          // Request is done (there are no more pending responses)
          processNextRequest();
        });
        this._sendDimse(dimse);
      } else {
        log.error(
          `Could not find an accepted presentation context for request ${request.toString()}. Skipping...`
        );
        processNextRequest();
      }
    };
    processNextRequest();
  }

  /**
   * Sends DIMSE over the network.
   * @method
   * @private
   * @param {Object} dimse - DIMSE information.
   * @param {Command} dimse.command - Command.
   * @param {PresentationContext} dimse.context - Presentation context.
   */
  _sendDimse(dimse) {
    try {
      const dataset = dimse.command.getDataset();
      const presentationContext = this.association.getPresentationContext(
        dimse.context.getPresentationContextId()
      );
      const acceptedTransferSyntaxUid = presentationContext.getAcceptedTransferSyntaxUid();
      if (dataset && acceptedTransferSyntaxUid !== dataset.getTransferSyntaxUid()) {
        if (
          TranscodableTransferSyntaxes.includes(acceptedTransferSyntaxUid) &&
          TranscodableTransferSyntaxes.includes(dataset.getTransferSyntaxUid())
        ) {
          dataset.setTransferSyntaxUid(acceptedTransferSyntaxUid);
        } else {
          log.error(
            `A transfer syntax transcoding from ${dataset.getTransferSyntaxUid()} to ${acceptedTransferSyntaxUid} is currently not supported. Skipping...`
          );
          dimse.command.raiseDoneEvent();
          return;
        }
      }
      this._sendPDataTF(
        dimse.command,
        dimse.context.getPresentationContextId(),
        this.association.getMaxPduLength()
      );
    } catch (err) {
      log.error(`${this.logId} -> Error sending DIMSE: ${err.message}`);
      this.emit('networkError', err);
    }
  }

  /**
   * Sends PDataTF over the network.
   * @method
   * @private
   * @param {Command} command - The requesting command.
   * @param {number} pcId - Presentation context ID.
   * @param {number} maxPduLength - Maximum PDU length.
   */
  _sendPDataTF(command, pcId, maxPduLength) {
    const max = 4 * 1024 * 1024;
    maxPduLength = maxPduLength === 0 ? max : Math.min(maxPduLength, max);

    const commandDataset = command.getCommandDataset();
    const commandBuffer = commandDataset.getDenaturalizedCommandDataset();

    log.info(
      `${this.logId} -> ${command.toString({
        includeCommandDataset: this.logCommandDatasets,
        includeDataset: this.logDatasets,
      })} [pc: ${pcId}]`
    );

    const pDataTf = new PDataTF();
    const pdv = new Pdv(pcId, commandBuffer, true, true);
    pDataTf.addPdv(pdv);
    const pdu = pDataTf.write();
    const pduBuffer = pdu.writePdu();
    this.socket.write(pduBuffer);
    this.statistics.addBytesSent(pduBuffer.length);

    const dataset = command.getDataset();
    if (dataset) {
      const datasetBuffer = dataset.getDenaturalizedDataset(
        this.datasetWriteOptions,
        this.datasetNameMap
      );

      const datasetBufferChunks = [];
      const datasetBufferLength = datasetBuffer.length;
      const chunkSize = maxPduLength - 6;
      let i = 0;
      while (i < datasetBufferLength) {
        datasetBufferChunks.push(datasetBuffer.slice(i, (i += chunkSize)));
      }

      for (let i = 0; i < datasetBufferChunks.length; i++) {
        const last = datasetBufferChunks.length === i + 1;
        const pdv = new Pdv(pcId, datasetBufferChunks[i], false, last);

        const pDataTf = new PDataTF();
        pDataTf.addPdv(pdv);
        const pdu = pDataTf.write();
        const pduBuffer = pdu.writePdu();
        this.socket.write(pduBuffer);
        this.statistics.addBytesSent(pduBuffer.length);
      }
    }
  }

  /**
   * Process received PDU from the network.
   * @method
   * @private
   * @param {Buffer} data - Accumulated PDU data.
   * @throws Error in case of an unknown PDU type.
   */
  _processPdu(data) {
    const raw = new RawPdu(data);

    try {
      raw.readPdu();

      switch (raw.getType()) {
        case 0x01: {
          this.association = new Association();
          const pdu = new AAssociateRQ(this.association);
          pdu.read(raw);
          this.logId = this.association.getCallingAeTitle();
          log.info(`${this.logId} <- Association request:${EOL}${this.association.toString()}`);
          this.emit('associationRequested', this.association);
          break;
        }
        case 0x02: {
          const pdu = new AAssociateAC(this.association);
          pdu.read(raw);
          this.logId = this.association.getCalledAeTitle();
          log.info(`${this.logId} <- Association accept:${EOL}${this.association.toString()}`);
          this.emit('associationAccepted', this.association);
          break;
        }
        case 0x03: {
          const pdu = new AAssociateRJ();
          pdu.read(raw);
          log.info(`${this.logId} <- Association reject ${pdu.toString()}`);
          this.emit('associationRejected', {
            result: pdu.getResult(),
            source: pdu.getSource(),
            reason: pdu.getReason(),
          });
          break;
        }
        case 0x04: {
          const pdu = new PDataTF();
          pdu.read(raw);
          this._processPDataTf(pdu);
          break;
        }
        case 0x05: {
          const pdu = new AReleaseRQ();
          pdu.read(raw);
          log.info(`${this.logId} <- Association release request`);
          this.emit('associationReleaseRequested');
          break;
        }
        case 0x06: {
          const pdu = new AReleaseRP();
          pdu.read(raw);
          log.info(`${this.logId} <- Association release response`);
          this.emit('associationReleaseResponse');
          break;
        }
        case 0x07: {
          const pdu = new AAbort();
          pdu.read(raw);
          log.info(`${this.logId} <- Association abort ${pdu.toString()}`);
          this.emit('abort', {
            source: pdu.getSource(),
            reason: pdu.getReason(),
          });
          break;
        }
        case 0xff: {
          // NoOp
          break;
        }
        default:
          throw new Error(`Unknown PDU type: ${raw.getType()}`);
      }
    } catch (err) {
      log.error(`${this.logId} -> Error reading PDU [type: ${raw.getType()}]: ${err.message}`);
      this.emit('networkError', err);
    }
  }

  /**
   * Process P-DATA-TF.
   * @method
   * @private
   * @param {PDataTF} pdu - PDU.
   */
  _processPDataTf(pdu) {
    try {
      const pdvs = pdu.getPdvs();
      pdvs.forEach((pdv) => {
        const presentationContext = this.association.getPresentationContext(
          pdv.getPresentationContextId()
        );

        if (!this.dimse) {
          // Create stream to receive command
          if (!this.dimseStream) {
            this.dimseStream = MemoryStream.createWriteStream();
            this.dimseStoreStream = undefined;
          }
        } else {
          // Create stream to receive dataset
          if (this.dimse.getCommandFieldType() === CommandFieldType.CStoreRequest) {
            if (!this.dimseStoreStream) {
              this.dimseStream = undefined;
              this.dimseStoreStream = this.createStoreWritableStream(
                presentationContext,
                this.dimse
              );
            }
          } else {
            if (!this.dimseStream) {
              this.dimseStream = MemoryStream.createWriteStream();
              this.dimseStoreStream = undefined;
            }
          }
        }

        const stream = this.dimseStream || this.dimseStoreStream;

        // TODO: Add stream backpressure event handling
        stream.write(pdv.getValue());

        if (pdv.isLastFragment()) {
          if (pdv.isCommand()) {
            const command = new Command(new Dataset(this.dimseStream.toBuffer()));
            const type = command.getCommandFieldType();
            switch (type) {
              case CommandFieldType.CEchoRequest:
                this.dimse = Object.assign(new CEchoRequest(), command);
                break;
              case CommandFieldType.CEchoResponse:
                this.dimse = Object.assign(new CEchoResponse(), command);
                break;
              case CommandFieldType.CFindRequest:
                this.dimse = Object.assign(new CFindRequest(), command);
                break;
              case CommandFieldType.CFindResponse:
                this.dimse = Object.assign(new CFindResponse(), command);
                break;
              case CommandFieldType.CStoreRequest:
                this.dimse = Object.assign(new CStoreRequest(), command);
                break;
              case CommandFieldType.CStoreResponse:
                this.dimse = Object.assign(new CStoreResponse(), command);
                break;
              case CommandFieldType.CMoveRequest:
                this.dimse = Object.assign(new CMoveRequest(), command);
                break;
              case CommandFieldType.CMoveResponse:
                this.dimse = Object.assign(new CMoveResponse(), command);
                break;
              case CommandFieldType.CGetRequest:
                this.dimse = Object.assign(new CGetRequest(), command);
                break;
              case CommandFieldType.CGetResponse:
                this.dimse = Object.assign(new CGetResponse(), command);
                break;
              case CommandFieldType.NCreateRequest:
                this.dimse = Object.assign(new NCreateRequest(), command);
                break;
              case CommandFieldType.NCreateResponse:
                this.dimse = Object.assign(new NCreateResponse(), command);
                break;
              case CommandFieldType.NActionRequest:
                this.dimse = Object.assign(new NActionRequest(), command);
                break;
              case CommandFieldType.NActionResponse:
                this.dimse = Object.assign(new NActionResponse(), command);
                break;
              case CommandFieldType.NDeleteRequest:
                this.dimse = Object.assign(new NDeleteRequest(), command);
                break;
              case CommandFieldType.NDeleteResponse:
                this.dimse = Object.assign(new NDeleteResponse(), command);
                break;
              case CommandFieldType.NEventReportRequest:
                this.dimse = Object.assign(new NEventReportRequest(), command);
                break;
              case CommandFieldType.NEventReportResponse:
                this.dimse = Object.assign(new NEventReportResponse(), command);
                break;
              case CommandFieldType.NGetRequest:
                this.dimse = Object.assign(new NGetRequest(), command);
                break;
              case CommandFieldType.NGetResponse:
                this.dimse = Object.assign(new NGetResponse(), command);
                break;
              case CommandFieldType.NSetRequest:
                this.dimse = Object.assign(new NSetRequest(), command);
                break;
              case CommandFieldType.NSetResponse:
                this.dimse = Object.assign(new NSetResponse(), command);
                break;
              case CommandFieldType.CCancelRequest:
                this.dimse = Object.assign(new CCancelRequest(), command);
                break;
              default:
                this.dimse = command;
                break;
            }

            log.info(
              `${this.logId} <- ${this.dimse.toString({
                includeCommandDataset: this.logCommandDatasets,
                includeDataset: this.logDatasets,
              })} [pc: ${pdv.getPresentationContextId()}]`
            );

            if (!this.dimse.hasDataset()) {
              this._performDimse(presentationContext, this.dimse);
              this.dimse = undefined;
              return;
            }
            this.dimseStream = undefined;
            this.dimseStoreStream = undefined;
          } else {
            if (this.dimse.getCommandFieldType() === CommandFieldType.CStoreRequest) {
              this.dimseStoreStream.end();
              this.createDatasetFromStoreWritableStream(
                this.dimseStoreStream,
                presentationContext,
                (dataset) => {
                  this.dimse.setDataset(dataset);
                  this._performDimse(presentationContext, this.dimse);
                  this.dimseStream = undefined;
                  this.dimseStoreStream = undefined;
                  this.dimse = undefined;
                }
              );
            } else {
              this.dimseStream.end();
              const dataset = new Dataset(
                this.dimseStream.toBuffer(),
                presentationContext.getAcceptedTransferSyntaxUid(),
                this.datasetReadOptions
              );
              this.dimse.setDataset(dataset);
              this._performDimse(presentationContext, this.dimse);
              this.dimseStream = undefined;
              this.dimseStoreStream = undefined;
              this.dimse = undefined;
            }
          }
        }
      });
    } catch (err) {
      log.error(`${this.logId} -> Error reading DIMSE: ${err.message}`);
      this.emit('networkError', err);
    }
  }

  /**
   * Perform DIMSE operation.
   * @method
   * @private
   * @param {PresentationContext} presentationContext - Accepted presentation context.
   * @param {Request|Response} dimse - DIMSE.
   */
  _performDimse(presentationContext, dimse) {
    if (dimse instanceof Response) {
      const response = Object.assign(Object.create(Object.getPrototypeOf(dimse)), dimse);
      const request = this.pending.find(
        (r) => r.getMessageId() === dimse.getMessageIdBeingRespondedTo()
      );
      if (request) {
        request.raiseResponseEvent(response);
        if (response.getStatus() !== Status.Pending) {
          request.raiseDoneEvent();
        }
      }
      return;
    }

    if (dimse.getCommandFieldType() === CommandFieldType.CEchoRequest) {
      this.emit('cEchoRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.CFindRequest) {
      this.emit('cFindRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.CStoreRequest) {
      this.emit('cStoreRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.CMoveRequest) {
      this.emit('cMoveRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.CGetRequest) {
      this.emit('cGetRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NCreateRequest) {
      this.emit('nCreateRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NActionRequest) {
      this.emit('nActionRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NDeleteRequest) {
      this.emit('nDeleteRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NEventReportRequest) {
      this.emit('nEventReportRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NGetRequest) {
      this.emit('nGetRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.NSetRequest) {
      this.emit('nSetRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() === CommandFieldType.CCancelRequest) {
      this.emit('cCancelRequest', dimse);
    }
  }

  /**
   * Wraps socket operations.
   * @method
   * @private
   */
  _wrapSocket() {
    this.socket.setTimeout(this.connectTimeout);
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectedTime = Date.now();
      this.emit('connect');
    });
    const pduAccumulator = new PduAccumulator();
    pduAccumulator.on('pdu', (data) => {
      this.lastPduTime = Date.now();
      this._processPdu(data);
    });
    this.socket.on('data', (data) => {
      pduAccumulator.accumulate(data);
      this.statistics.addBytesReceived(data.length);
    });
    this.socket.on('error', (err) => {
      this._reset();
      const error = `${this.logId} -> Connection error: ${err.message}`;
      log.error(error);
      this.emit('networkError', new Error(error));
    });
    this.socket.on('timeout', () => {
      this._reset();
      const error = `${this.logId} -> Connection timeout`;
      log.error(error);
      this.emit('networkError', new Error(error));
    });
    this.socket.on('close', () => {
      this._reset();
      log.info(`${this.logId} -> Connection closed`);
      this.emit('close');
    });

    this.timeoutIntervalId = setInterval(() => {
      const current = Date.now();
      let timedOut = false;
      let error = undefined;
      if (
        this.connected &&
        !this.lastPduTime &&
        current - this.connectedTime >= this.associationTimeout
      ) {
        error = `${this.logId} -> Exceeded association timeout (${this.associationTimeout}), closing connection...`;
        timedOut = true;
      } else if (
        this.connected &&
        this.lastPduTime &&
        current - this.lastPduTime >= this.pduTimeout
      ) {
        error = `${this.logId} -> Exceeded PDU timeout (${this.pduTimeout}), closing connection...`;
        timedOut = true;
      }
      if (timedOut) {
        this.sendAbort();
        this._reset();
        log.error(error);
        this.emit('networkError', new Error(`Connection timeout: ${error}`));
      }
    }, 1000);
  }

  /**
   * Resets connection stats.
   * @method
   * @private
   */
  _reset() {
    this.connected = false;
    this.lastPduTime = undefined;
    this.connectedTime = undefined;
    if (this.timeoutIntervalId) {
      clearInterval(this.timeoutIntervalId);
      this.timeoutIntervalId = undefined;
    }
  }
  //#endregion
}
//#endregion

//#region PduAccumulator
class PduAccumulator extends AsyncEventEmitter {
  /**
   * Creates an instance of PduAccumulator.
   * @constructor
   */
  constructor() {
    super();
  }

  /**
   * Accumulates the received data from the network.
   * @method
   * @param {Buffer} data - The received data.
   */
  accumulate(data) {
    do {
      data = this._process(data);
    } while (data !== undefined);
  }

  //#region Private Methods
  /**
   * Processes the received data until a full PDU is received.
   * @method
   * @private
   * @param {Buffer} data - The received data from the network.
   * @returns {number|undefined} The remaining bytes for a full PDU or undefined.
   */
  _process(data) {
    if (this.receiving === undefined) {
      if (this.minimumReceived) {
        data = Buffer.concat(
          [this.minimumReceived, data],
          this.minimumReceived.length + data.length
        );
        this.minimumReceived = undefined;
      }
      if (data.length < 6) {
        this.minimumReceived = data;
        return undefined;
      }

      const buffer = SmartBuffer.fromBuffer(data, 'ascii');
      buffer.readUInt8();
      buffer.readUInt8();
      const pduLength = buffer.readUInt32BE();
      let dataNeeded = data.length - 6;

      if (pduLength > dataNeeded) {
        this.receiving = data;
        this.receivedLength = pduLength;
      } else {
        let pduData = data;
        let remaining = undefined;

        if (pduLength < dataNeeded) {
          pduData = data.slice(0, pduLength + 6);
          remaining = data.slice(pduLength + 6, dataNeeded + 6);
        }

        this.receiving = undefined;
        this.receivedLength = undefined;
        this.emit('pdu', pduData);

        if (remaining) {
          return remaining;
        }
      }
    } else {
      let newPduData = Buffer.concat([this.receiving, data], this.receiving.length + data.length);
      const pduLength = newPduData.length - 6;

      if (pduLength < this.receivedLength) {
        this.receiving = newPduData;
      } else {
        let remaining = undefined;
        if (pduLength > this.receivedLength) {
          remaining = newPduData.slice(this.receivedLength + 6, pduLength + 6);
          newPduData = newPduData.slice(0, this.receivedLength + 6);
        }

        this.receiving = undefined;
        this.receivedLength = undefined;
        this.emit('pdu', newPduData);

        if (remaining) {
          return remaining;
        }
      }
    }

    return undefined;
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Network;
//#endregion
