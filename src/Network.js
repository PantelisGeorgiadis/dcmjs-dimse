const { Association } = require('./Association');
const {
  RawPdu,
  AAssociateRQ,
  AAssociateAC,
  AAssociateRJ,
  AReleaseRQ,
  AReleaseRP,
  AAbort,
  Pdv,
  PDataTF,
} = require('./Pdu');
const {
  CommandFieldType,
  Status,
  TranscodableTransferSyntax,
  Implementation,
} = require('./Constants');
const {
  Command,
  Response,
  CEchoRequest,
  CEchoResponse,
  CFindRequest,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
  CMoveRequest,
  CMoveResponse,
  CGetRequest,
  CGetResponse,
  NCreateRequest,
  NCreateResponse,
  NActionRequest,
  NActionResponse,
  NDeleteRequest,
  NDeleteResponse,
  NEventReportRequest,
  NEventReportResponse,
  NGetRequest,
  NGetResponse,
  NSetRequest,
  NSetResponse,
} = require('./Command');
const Dataset = require('./Dataset');
const log = require('./log');

const AsyncEventEmitter = require('async-eventemitter');
const { SmartBuffer } = require('smart-buffer');

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
   */
  constructor(socket, opts) {
    super();
    this.messageId = 0;
    this.socket = socket;
    this.requests = [];
    this.pending = [];

    this.dimseBuffer = undefined;
    this.dimse = undefined;

    opts = opts || {};
    this.connectTimeout = opts.connectTimeout || 3 * 60 * 1000;
    this.associationTimeout = opts.associationTimeout || 1 * 60 * 1000;
    this.pduTimeout = opts.pduTimeout || 1 * 60 * 1000;
    this.logCommandDatasets = opts.logCommandDatasets || false;
    this.logDatasets = opts.logDatasets || false;
    this.logId = '';
    this.connected = false;
    this.connectedTime = undefined;
    this.lastPduTime = undefined;
    this.timeoutIntervalId = undefined;

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
    log.info(`${this.logId} -> Association request:\n${this.association.toString()}`);
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association accept.
   * @method
   */
  sendAssociationAccept() {
    this.association.setImplementationClassUid(Implementation.ImplementationClassUid);
    this.association.setImplementationVersion(Implementation.ImplementationVersion);
    this.association.setMaxPduLength(
      Math.min(this.association.getMaxPduLength(), Implementation.MaxPduLength)
    );

    const rq = new AAssociateAC(this.association);
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Association accept:\n${this.association.toString()}`);
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

    log.info(
      `${
        this.logId
      } -> Association reject [result: ${rq.getResult()}; source: ${rq.getSource()}; reason: ${rq.getReason()}]`
    );
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
   * Sends abort request.
   * @method
   * @param {number} [source] - Rejection source.
   * @param {number} [reason] - Rejection reason.
   */
  sendAbort(source, reason) {
    const rq = new AAbort(source, reason);
    const rqPdu = rq.write();

    log.info(`${this.logId} -> Abort [source: ${rq.getSource()}; reason: ${rq.getReason()}]`);
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
      const supportedTransferSyntaxes = Object.values(TranscodableTransferSyntax);
      const acceptedTransferSyntaxUid = presentationContext.getAcceptedTransferSyntaxUid();
      if (dataset && acceptedTransferSyntaxUid !== dataset.getTransferSyntaxUid()) {
        if (
          supportedTransferSyntaxes.includes(acceptedTransferSyntaxUid) &&
          supportedTransferSyntaxes.includes(dataset.getTransferSyntaxUid())
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

    const dataset = command.getDataset();
    if (dataset) {
      const datasetBuffer = dataset.getDenaturalizedDataset();

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
      }
    }
  }

  /**
   * Process received PDU from the network.
   * @method
   * @private
   * @param {Buffer} data - Accumulated PDU data.
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
          log.info(`${this.logId} <- Association request:\n${this.association.toString()}`);
          this.emit('associationRequested', this.association);
          break;
        }
        case 0x02: {
          const pdu = new AAssociateAC(this.association);
          pdu.read(raw);
          this.logId = this.association.getCalledAeTitle();
          log.info(`${this.logId} <- Association accept:\n${this.association.toString()}`);
          this.emit('associationAccepted', this.association);
          break;
        }
        case 0x03: {
          const pdu = new AAssociateRJ();
          pdu.read(raw);
          log.info(
            `${
              this.logId
            } <- Association reject [result: ${pdu.getResult()}, source: ${pdu.getSource()}, reason: ${pdu.getReason()}]`
          );
          this.emit('associationRejected', pdu.getResult(), pdu.getSource(), pdu.getReason());
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
          log.info(
            `${
              this.logId
            } <- Association abort [source: ${pdu.getSource()}, reason: ${pdu.getReason()}]`
          );
          this.emit('abort');
          break;
        }
        case 0xff: {
          // NoOp
          break;
        }
        default:
          throw new Error('Unknown PDU type');
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
        if (!this.dimseBuffer) {
          this.dimseBuffer = SmartBuffer.fromOptions({
            encoding: 'ascii',
          });
        }
        this.dimseBuffer.writeBuffer(pdv.getValue());
        const presentationContext = this.association.getPresentationContext(
          pdv.getPresentationContextId()
        );
        if (pdv.isLastFragment()) {
          if (pdv.isCommand()) {
            const command = new Command(new Dataset(this.dimseBuffer.toBuffer()));
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
            this.dimseBuffer = undefined;
          } else {
            const dataset = new Dataset(
              this.dimseBuffer.toBuffer(),
              presentationContext.getAcceptedTransferSyntaxUid()
            );
            this.dimse.setDataset(dataset);
            this._performDimse(presentationContext, this.dimse);
            this.dimseBuffer = undefined;
            this.dimse = undefined;
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

    if (dimse.getCommandFieldType() == CommandFieldType.CEchoRequest) {
      this.emit('cEchoRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CFindRequest) {
      this.emit('cFindRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CStoreRequest) {
      this.emit('cStoreRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CMoveRequest) {
      this.emit('cMoveRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CGetRequest) {
      this.emit('cGetRequest', dimse, (rsp) => {
        const responses = !Array.isArray(rsp) ? [rsp] : rsp;
        responses.forEach((response) => {
          this._sendDimse({ context: presentationContext, command: response });
        });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NCreateRequest) {
      this.emit('nCreateRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NActionRequest) {
      this.emit('nActionRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NDeleteRequest) {
      this.emit('nDeleteRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NEventReportRequest) {
      this.emit('nEventReportRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NGetRequest) {
      this.emit('nGetRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.NSetRequest) {
      this.emit('nSetRequest', dimse, (rsp) => {
        this._sendDimse({ context: presentationContext, command: rsp });
      });
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
   * @returns {Number|undefined} The remaining bytes for a full PDU or undefined.
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

//#region Exports
module.exports = Network;
//#endregion
