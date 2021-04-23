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
const { CommandFieldType, Status, TransferSyntax } = require('./Constants');
const {
  Command,
  Response,
  CEchoResponse,
  CFindResponse,
  CStoreRequest,
  CStoreResponse,
  CMoveResponse,
  CGetResponse
} = require('./Command');
const Dataset = require('./Dataset');
const log = require('./log');

const { EventEmitter } = require('events');
const { SmartBuffer } = require('smart-buffer');
const chunks = require('buffer-chunks');
const net = require('net');

//#region PduAccumulator
class PduAccumulator extends EventEmitter {
  /**
   * Creates an instance of PduAccumulator.
   *
   * @memberof PduAccumulator
   */
  constructor() {
    super();
  }

  /**
   * Accumulates the received data from the network.
   *
   * @param {Buffer} data - The received data.
   * @memberof PduReceiver
   */
  accumulate(data) {
    do {
      data = this._process(data);
    } while (data !== undefined);
  }

  //#region Private Methods
  /**
   * Processes the received data until a full PDU is received.
   *
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

      const buffer = SmartBuffer.fromBuffer(data);
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

//#region Network
class Network extends EventEmitter {
  /**
   * Creates an instance of Network.
   *
   * @param {Object} opts - Network options.
   * @param {Number} opts.connectTimeout - Connection timeout in milliseconds.
   * @param {Number} opts.associationTimeout - Association timeout in milliseconds.
   * @param {Number} opts.pduTimeout - PDU timeout in milliseconds.
   * @memberof Network
   */
  constructor(opts) {
    super();
    this.messageId = 0;
    this.socket = {};
    this.requests = [];

    this.dimseBuffer = undefined;
    this.dimse = undefined;

    opts = opts || {};
    this.connectTimeout = opts.connectTimeout || 10000;
    this.associationTimeout = opts.associationTimeout || 10000;
    this.pduTimeout = opts.pduTimeout || 5000;
    this.connected = false;
    this.connectedTime = undefined;
    this.lastPduTime = undefined;
    this.timeoutIntervalId = undefined;
  }

  /**
   * Connects to specified host.
   *
   * @param {String} host - Remote host.
   * @param {Number} port - Remote port.
   * @memberof Network
   */
  connect(host, port) {
    const network = new net.Socket();
    network.setTimeout(this.connectTimeout);
    log.info(`Connecting to ${host}:${port}`);

    this.socket = network.connect({ host, port });
    this.socket.on('connect', () => {
      this.connected = true;
      this.connectedTime = Date.now();
      this.emit('connect');

      this.timeoutIntervalId = setInterval(() => {
        const current = Date.now();
        let timedOut = false;
        let error = undefined;
        if (!this.lastPduTime && current - this.connectedTime >= this.associationTimeout) {
          error = `Exceeded association timeout (${this.associationTimeout}), closing connection...`;
          timedOut = true;
        } else if (this.lastPduTime && current - this.lastPduTime >= this.pduTimeout) {
          error = `Exceeded PDU timeout (${this.pduTimeout}), closing connection...`;
          timedOut = true;
        }
        if (timedOut) {
          log.error(error);
          this.release();
          this.close();
          this.emit('error', new Error(`Connection error: ${error}`));
        }
      }, 1000);
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
      this.connected = false;
      log.error('Connection error');
      this.emit('error', new Error(`Connection error: ${err.message}`));
    });
    this.socket.on('timeout', () => {
      this.connected = false;
      log.error('Connection timeout');
      this.emit('error', new Error(`Connection timeout`));
    });
    this.socket.on('close', () => {
      this.connected = false;
      this.lastPduTime = undefined;
      this.connectedTime = undefined;
      if (this.timeoutIntervalId) {
        clearInterval(this.timeoutIntervalId);
        this.timeoutIntervalId = undefined;
      }
      log.info('Connection closed');
      this.emit('close');
    });
  }

  /**
   * Sends association request.
   *
   * @param {Object} association - Association.
   * @memberof Network
   */
  associate(association) {
    if (this.connected === false) {
      return;
    }

    this.association = association;
    log.info(`Association request:\n${this.association.toString()}`);
    const rq = new AAssociateRQ(this.association);
    const rqPdu = rq.write();
    this._sendPdu(rqPdu);
  }

  /**
   * Sends requests.
   *
   * @param {Array} requests - Requests to perform.
   * @memberof Network
   */
  sendRequests(requests) {
    if (this.connected === false) {
      return;
    }
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
   * Sends release request.
   *
   * @memberof Network
   */
  release() {
    if (this.connected === false) {
      return;
    }

    log.info('Association release request');
    const rq = new AReleaseRQ();
    const rqPdu = rq.write();
    this._sendPdu(rqPdu);
  }

  /**
   * Closes the connection.
   *
   * @memberof Network
   */
  close() {
    if (this.connected === false) {
      return;
    }

    this.socket.end();
  }

  //#region Requests/Responses Methods

  //#endregion

  //#region Private Methods
  /**
   * Advances the message ID.
   *
   */
  _getNextMessageId() {
    return ++this.messageId % 65536;
  }

  /**
   * Sends PDU over the network.
   *
   * @param {Buffer} pdu - PDU.
   */
  _sendPdu(pdu) {
    const buffer = pdu.writePdu();
    this.socket.write(buffer);
  }

  /**
   * Sends DIMSE over the network.
   *
   * @param {Object} dimse - DIMSE information.
   */
  _sendDimse(dimse) {
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
  }

  /**
   * Sends PDataTF over the network.
   *
   * @param {Object} command - The requesting command.
   * @param {Number} pcId - Presentation context ID.
   * @param {Number} maxPduLength - Maximum PDU length.
   */
  _sendPDataTF(command, pcId, maxPduLength) {
    const max = 4 * 1024 * 1024;
    maxPduLength = maxPduLength === 0 ? max : Math.min(maxPduLength, max);

    const commandDataset = command.getCommandDataset();
    const commandBuffer = commandDataset.getDenaturalizedDataset();
    const pdv = new Pdv(pcId, commandBuffer, true, true);
    const pDataTf = new PDataTF();
    pDataTf.addPdv(pdv);

    log.info(`${command.toString()} [pc: ${pdv.getPresentationContextId()}]`);

    const pdu = pDataTf.write();
    const pduBuffer = pdu.writePdu();
    this.socket.write(pduBuffer);

    const dataset = command.getDataset();
    if (dataset) {
      const datasetBuffer = dataset.getDenaturalizedDataset();
      const datasetBufferChunks = chunks(datasetBuffer, maxPduLength - 6);
      for (let i = 0; i < datasetBufferChunks.length; i++) {
        const pdv = new Pdv(
          pcId,
          datasetBufferChunks[i],
          false,
          datasetBufferChunks.length === i + 1
        );

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
   *
   * @param {Buffer} data - Accumulated PDU data.
   */
  _processPdu(data) {
    const raw = new RawPdu(data);
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
        this.emit('associationReleaseRequest');
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
  }

  /**
   * Process P-DATA-TF.
   *
   * @param {Object} pdu - PDU.
   */
  _processPDataTf(pdu) {
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
            case CommandFieldType.CEchoResponse:
              this.dimse = Object.assign(new CEchoResponse(), command);
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
            case CommandFieldType.CMoveResponse:
              this.dimse = Object.assign(new CMoveResponse(), command);
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
            this._performDimse(this.dimse, presentationContext);
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
          this._performDimse(this.dimse, presentationContext);
          this.dimseBuffer = undefined;
          this.dimse = undefined;
        }
      }
    });
  }

  /**
   * Perform DIMSE operation.
   *
   * @param {Object} dimse - DIMSE.
   * @param {Object} presentationContext - Accepted presentation context.
   */
  _performDimse(dimse, presentationContext) {
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

    if (dimse.getCommandFieldType() == CommandFieldType.CStoreRequest) {
      const response = new CStoreResponse(Status.ProcessingFailure);
      response.setMessageIdBeingRespondedTo(dimse.getMessageId());
      response.setAffectedSopClassUid(dimse.getAffectedSopClassUid());
      response.setAffectedSopInstanceUid(dimse.getAffectedSopInstanceUid());
      this.emit('onCStoreRequest', dimse, response);
      this._sendDimse({ context: presentationContext, command: response });
    }
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Network;
//#endregion
