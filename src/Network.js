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
  PDataTF
} = require('./Pdu');
const { CommandFieldType, Status, TransferSyntax, Implementation } = require('./Constants');
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
  CGetResponse
} = require('./Command');
const Dataset = require('./Dataset');
const log = require('./log');

const { EventEmitter } = require('events');
const { SmartBuffer } = require('smart-buffer');
const chunks = require('buffer-chunks');

//#region Network
class Network extends EventEmitter {
  /**
   * Creates an instance of Network.
   * @constructor
   * @param {Socket} socket - Network socket.
   * @param {Object} [opts] - Network options.
   * @param {number} [opts.connectTimeout] - Connection timeout in milliseconds.
   * @param {number} [opts.associationTimeout] - Association timeout in milliseconds.
   * @param {number} [opts.pduTimeout] - PDU timeout in milliseconds.
   */
  constructor(socket, opts) {
    super();
    this.messageId = 0;
    this.socket = socket;
    this.requests = [];

    this.dimseBuffer = undefined;
    this.dimse = undefined;

    opts = opts || {};
    this.connectTimeout = opts.connectTimeout || 3 * 60 * 1000;
    this.associationTimeout = opts.associationTimeout || 1 * 60 * 1000;
    this.pduTimeout = opts.pduTimeout || 1 * 60 * 1000;
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

    log.info(`Association request:\n${this.association.toString()}`);
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

    log.info(`Association accept:\n${this.association.toString()}`);
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
      `Association reject [result: ${rq.getResult()}; source: ${rq.getSource()}; reason: ${rq.getReason()}]`
    );
    this._sendPdu(rqPdu);
  }

  /**
   * Sends requests.
   * @method
   * @param {Array<Request>} requests - Requests to perform.
   */
  sendRequests(requests) {
    this.requests = requests;
    const requestsWithAcceptedContext = [];
    requests.forEach(request => {
      const context = this.association.getAcceptedPresentationContextFromRequest(request);
      if (context) {
        request.setMessageId(this._getNextMessageId());
        requestsWithAcceptedContext.push({ context, command: request });
      }
    });

    const processNextDimse = () => {
      const dimse = requestsWithAcceptedContext.shift();
      if (!dimse) {
        // Done with requests
        this.emit('done');
        return;
      }
      dimse.command.on('done', () => {
        // Request is done (there are no more pending responses)
        processNextDimse();
      });
      this._sendDimse(dimse);
    };
    processNextDimse();
  }

  /**
   * Sends association release request.
   * @method
   */
  sendAssociationReleaseRequest() {
    const rq = new AReleaseRQ();
    const rqPdu = rq.write();

    log.info('Association release request');
    this._sendPdu(rqPdu);
  }

  /**
   * Sends association release response.
   * @method
   */
  sendAssociationReleaseResponse() {
    const rq = new AReleaseRP();
    const rqPdu = rq.write();

    log.info('Association release response');
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

    log.info(`Abort [source: ${rq.getSource()}; reason: ${rq.getReason()}]`);
    this._sendPdu(rqPdu);
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
      log.error(`Error sending PDU [type: ${pdu.getType()}]: ${err.message}`);
      this.emit('networkError', err);
    }
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
      const supportedTransferSyntaxes = Object.values(TransferSyntax);
      const acceptedTransferSyntaxUid = presentationContext.getAcceptedTransferSyntaxUid();
      if (dataset && acceptedTransferSyntaxUid !== dataset.getTransferSyntaxUid()) {
        if (
          supportedTransferSyntaxes.includes(acceptedTransferSyntaxUid) &&
          supportedTransferSyntaxes.includes(dataset.getTransferSyntaxUid())
        ) {
          dataset.setTransferSyntaxUid(acceptedTransferSyntaxUid);
        } else {
          log.error(
            `A transfer syntax transcoding from ${dataset.getTransferSyntaxUid()} to ${acceptedTransferSyntaxUid} which is currently not supported. Skipping...`
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
      log.error(`Error sending DIMSE: ${err.message}`);
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
    const commandBuffer = commandDataset.getDenaturalizedDataset();

    log.info(`${command.toString()} [pc: ${pcId}]`);

    const pDataTf = new PDataTF();
    const pdv = new Pdv(pcId, commandBuffer, true, true);
    pDataTf.addPdv(pdv);
    const pdu = pDataTf.write();
    const pduBuffer = pdu.writePdu();
    this.socket.write(pduBuffer);

    const dataset = command.getDataset();
    if (dataset) {
      const datasetBuffer = dataset.getDenaturalizedDataset();
      const datasetBufferChunks = chunks(datasetBuffer, maxPduLength - 6);
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
          log.info(`Association request:\n${this.association.toString()}`);
          this.emit('associationRequested', this.association);
          break;
        }
        case 0x02: {
          const pdu = new AAssociateAC(this.association);
          pdu.read(raw);
          log.info(`Association accept:\n${this.association.toString()}`);
          this.emit('associationAccepted', this.association);
          break;
        }
        case 0x03: {
          const pdu = new AAssociateRJ();
          pdu.read(raw);
          log.info(
            `Association reject [result: ${pdu.getResult()}, source: ${pdu.getSource()}, reason: ${pdu.getReason()}]`
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
          log.info('Association release request');
          this.emit('associationReleaseRequested');
          break;
        }
        case 0x06: {
          const pdu = new AReleaseRP();
          pdu.read(raw);
          log.info('Association release response');
          this.emit('associationReleaseResponse');
          break;
        }
        case 0x07: {
          const pdu = new AAbort();
          pdu.read(raw);
          log.info(`Association abort [source: ${pdu.getSource()}, reason: ${pdu.getReason()}]`);
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
      log.error(`Error reading PDU [type: ${raw.getType()}]: ${err.message}`);
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
      pdvs.forEach(pdv => {
        if (!this.dimseBuffer) {
          this.dimseBuffer = SmartBuffer.fromOptions({
            encoding: 'ascii'
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
              default:
                this.dimse = command;
                break;
            }

            log.info(`${this.dimse.toString()} [pc: ${pdv.getPresentationContextId()}]`);

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
      log.error(`Error reading DIMSE: ${err.message}`);
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
      const request = this.requests.find(
        r => r.getMessageId() === dimse.getMessageIdBeingRespondedTo()
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
      const e = { request: dimse, response: undefined };
      this.emit('cEchoRequest', e);
      if (!e.response) {
        throw new Error('cEchoRequest handler should provide a response');
      }
      this._sendDimse({ context: presentationContext, command: e.response });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CFindRequest) {
      const e = { request: dimse, responses: undefined };
      this.emit('cFindRequest', e);
      if (!e.responses) {
        throw new Error('cFindRequest handler should provide response(s)');
      }
      const responses = !Array.isArray(e.responses) ? [e.responses] : e.responses;
      responses.forEach(response => {
        this._sendDimse({ context: presentationContext, command: response });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CStoreRequest) {
      const e = { request: dimse, response: undefined };
      this.emit('cStoreRequest', e);
      if (!e.response) {
        throw new Error('cStoreRequest handler should provide a response');
      }
      this._sendDimse({ context: presentationContext, command: e.response });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CMoveRequest) {
      const e = { request: dimse, responses: undefined };
      this.emit('cMoveRequest', e);
      if (!e.responses) {
        throw new Error('cMoveRequest handler should provide response(s)');
      }
      const responses = !Array.isArray(e.responses) ? [e.responses] : e.responses;
      responses.forEach(response => {
        this._sendDimse({ context: presentationContext, command: response });
      });
    } else if (dimse.getCommandFieldType() == CommandFieldType.CGetRequest) {
      const e = { request: dimse, responses: undefined };
      this.emit('cGetRequest', e);
      if (!e.responses) {
        throw new Error('cGetRequest handler should provide response(s)');
      }
      const responses = !Array.isArray(e.responses) ? [e.responses] : e.responses;
      responses.forEach(response => {
        this._sendDimse({ context: presentationContext, command: response });
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
    pduAccumulator.on('pdu', data => {
      this.lastPduTime = Date.now();
      this._processPdu(data);
    });
    this.socket.on('data', data => {
      pduAccumulator.accumulate(data);
    });
    this.socket.on('error', err => {
      this._reset();
      const error = `Connection error: ${err.message}`;
      log.error(error);
      this.emit('networkError', new Error(error));
    });
    this.socket.on('timeout', () => {
      this._reset();
      const error = 'Connection timeout';
      log.error(error);
      this.emit('networkError', new Error(error));
    });
    this.socket.on('close', () => {
      this._reset();
      log.info('Connection closed');
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
        error = `Exceeded association timeout (${this.associationTimeout}), closing connection...`;
        timedOut = true;
      } else if (
        this.connected &&
        this.lastPduTime &&
        current - this.lastPduTime >= this.pduTimeout
      ) {
        error = `Exceeded PDU timeout (${this.pduTimeout}), closing connection...`;
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
class PduAccumulator extends EventEmitter {
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
