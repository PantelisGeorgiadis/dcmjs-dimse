const Network = require('./Network');
const log = require('./log');

const { EventEmitter } = require('events');
const { createServer } = require('net');

//#region Scp
class Scp extends Network {
  /**
   * Creates an instance of Scp.
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
    super(socket, opts);

    this.on('associationRequested', (association) => {
      this.associationRequested(association);
    });
    this.on('associationReleaseRequested', () => {
      this.associationReleaseRequested();
    });
    this.on('cEchoRequest', (e) => {
      e.response = this.cEchoRequest(e.request);
    });
    this.on('cFindRequest', (e) => {
      e.responses = this.cFindRequest(e.request);
    });
    this.on('cStoreRequest', (e) => {
      e.response = this.cStoreRequest(e.request);
    });
    this.on('cMoveRequest', (e) => {
      e.responses = this.cMoveRequest(e.request);
    });
    this.on('cGetRequest', (e) => {
      e.responses = this.cGetRequest(e.request);
    });
    this.on('nCreateRequest', (e) => {
      e.response = this.nCreateRequest(e.request);
    });
    this.on('nActionRequest', (e) => {
      e.response = this.nActionRequest(e.request);
    });
    this.on('nDeleteRequest', (e) => {
      e.response = this.nDeleteRequest(e.request);
    });
    this.on('nEventReportRequest', (e) => {
      e.response = this.nEventReportRequest(e.request);
    });
    this.on('nGetRequest', (e) => {
      e.response = this.nGetRequest(e.request);
    });
    this.on('nSetRequest', (e) => {
      e.response = this.nSetRequest(e.request);
    });
  }

  /**
   * Association request received.
   * @method
   * @param {Association} association - Association.
   * @throws Error if derived class does not implement the associationRequested method.
   */
  // eslint-disable-next-line no-unused-vars
  associationRequested(association) {
    throw new Error('associationRequested method must be implemented');
  }

  /**
   * Association release request received.
   * @method
   * @param {Association} association - Association.
   * @throws Error if derived class does not implement the associationReleaseRequested method.
   */
  associationReleaseRequested() {
    throw new Error('associationReleaseRequested method must be implemented');
  }

  /**
   * C-ECHO request received.
   * @method
   * @param {CEchoRequest} request - C-ECHO request.
   * @returns {CEchoResponse} C-ECHO response.
   * @throws Error if derived class does not implement the cEchoRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cEchoRequest(request) {
    throw new Error('cEchoRequest method must be implemented');
  }

  /**
   * C-FIND request received.
   * @method
   * @param {CFindRequest} request - C-FIND request.
   * @returns {CFindResponse|Array<CFindResponse>} C-FIND response(s).
   * @throws Error if derived class does not implement the cFindRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cFindRequest(request) {
    throw new Error('cFindRequest method must be implemented');
  }

  /**
   * C-STORE request received.
   * @method
   * @param {CStoreRequest} request - C-STORE request.
   * @returns {CStoreResponse} C-STORE response.
   * @throws Error if derived class does not implement the cStoreRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cStoreRequest(request) {
    throw new Error('cStoreRequest method must be implemented');
  }

  /**
   * C-MOVE request received.
   * @method
   * @param {CMoveRequest} request - C-MOVE request.
   * @returns {CMoveResponse|Array<CMoveResponse>} C-MOVE response(s).
   * @throws Error if derived class does not implement the cMoveRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cMoveRequest(request) {
    throw new Error('cMoveRequest method must be implemented');
  }

  /**
   * C-GET request received.
   * @method
   * @param {CGetRequest} request - C-GET request.
   * @returns {CGetResponse|Array<CGetResponse>} C-GET response(s).
   * @throws Error if derived class does not implement the cGetRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cGetRequest(request) {
    throw new Error('cGetRequest method must be implemented');
  }

  /**
   * N-CREATE request received.
   * @method
   * @param {NCreateRequest} request - N-CREATE request.
   * @returns {NCreateResponse} N-CREATE response.
   * @throws Error if derived class does not implement the nCreateRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nCreateRequest(request) {
    throw new Error('nCreateRequest method must be implemented');
  }

  /**
   * N-ACTION request received.
   * @method
   * @param {NActionRequest} request - N-ACTION request.
   * @returns {NActionResponse} N-ACTION response.
   * @throws Error if derived class does not implement the nActionRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nActionRequest(request) {
    throw new Error('nActionRequest method must be implemented');
  }

  /**
   * N-DELETE request received.
   * @method
   * @param {NDeleteRequest} request - N-DELETE request.
   * @returns {NDeleteResponse} N-DELETE response.
   * @throws Error if derived class does not implement the nDeleteRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nDeleteRequest(request) {
    throw new Error('nDeleteRequest method must be implemented');
  }

  /**
   * N-EVENT-REPORT request received.
   * @method
   * @param {NEventReportRequest} request - N-EVENT-REPORT request.
   * @returns {NEventReportResponse} N-EVENT-REPORT response.
   * @throws Error if derived class does not implement the nEventReportRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nEventReportRequest(request) {
    throw new Error('nEventReportRequest method must be implemented');
  }

  /**
   * N-GET request received.
   * @method
   * @param {NGetRequest} request - N-GET request.
   * @returns {NGetResponse} N-GET response.
   * @throws Error if derived class does not implement the nGetRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nGetRequest(request) {
    throw new Error('nGetRequest method must be implemented');
  }

  /**
   * N-SET request received.
   * @method
   * @param {NSetRequest} request - N-SET request.
   * @returns {NSetResponse} N-SET response.
   * @throws Error if derived class does not implement the nSetRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  nSetRequest(request) {
    throw new Error('nSetRequest method must be implemented');
  }
}
//#endregion

//#region Server
class Server extends EventEmitter {
  /**
   * Creates an instance of Server.
   * @constructor
   * @param {Scp} scpClass - The SCP class to receive network events.
   */
  constructor(scpClass) {
    super();
    this.scp = { class: scpClass };
    this.server = undefined;
    this.clients = [];
  }

  /**
   * Listens for incoming connections.
   * @method
   * @param {number} port - Remote port.
   * @param {Object} [opts] - Network options.
   * @param {number} [opts.connectTimeout] - Connection timeout in milliseconds.
   * @param {number} [opts.associationTimeout] - Association timeout in milliseconds.
   * @param {number} [opts.pduTimeout] - PDU timeout in milliseconds.
   * @param {boolean} [opts.logCommandDatasets] - Log DIMSE command datasets.
   * @param {boolean} [opts.logDatasets] - Log DIMSE datasets.
   */
  listen(port, opts) {
    // Initialize network
    this.server = createServer();
    this.server.listen(port);

    this.server.on('listening', () => {
      log.info(`DICOM server listening on port ${port}`);
    });
    this.server.on('connection', (socket) => {
      log.info(`Client connecting from ${socket.remoteAddress}:${socket.remotePort}`);
      const client = new this.scp.class(socket, opts);
      client.connected = true;
      this.clients.push(client);

      this.clients = this.clients.filter((item) => item.connected);
    });
    this.server.on('error', (err) => {
      const error = `Server error: ${err.message}`;
      log.error(error);
      this.emit('networkError', err);
    });
  }

  /**
   * Closes server.
   * @method
   */
  close() {
    if (this.server && this.server.listening) {
      this.server.close();

      // Close all live sockets
      this.clients.forEach((client) => client.socket.destroy());
      this.clients = [];
    }
  }
}
//#endregion

//#region Exports
module.exports = { Server, Scp };
//#endregion
