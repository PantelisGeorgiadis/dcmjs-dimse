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

    this.on('associationRequested', association => {
      this.associationRequested(association);
    });
    this.on('associationReleaseRequested', () => {
      this.associationReleaseRequested();
    });
    this.on('cEchoRequest', e => {
      e.response = this.cEchoRequest(e.request);
    });
    this.on('cFindRequest', e => {
      e.responses = this.cFindRequest(e.request);
    });
    this.on('cStoreRequest', e => {
      e.response = this.cStoreRequest(e.request);
    });
    this.on('cMoveRequest', e => {
      e.responses = this.cMoveRequest(e.request);
    });
    this.on('cGetRequest', e => {
      e.responses = this.cGetRequest(e.request);
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
   * Echo request received.
   * @method
   * @param {CEchoRequest} request - Echo request.
   * @returns {CEchoResponse} Echo response.
   * @throws Error if derived class does not implement the cEchoRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cEchoRequest(request) {
    throw new Error('cEchoRequest method must be implemented');
  }

  /**
   * Find request received.
   * @method
   * @param {CFindRequest} request - Find request.
   * @returns {CFindResponse|Array<CFindResponse>} Find response(s).
   * @throws Error if derived class does not implement the cFindRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cFindRequest(request) {
    throw new Error('cFindRequest method must be implemented');
  }

  /**
   * Store request received.
   * @method
   * @param {CStoreRequest} request - Store request.
   * @returns {CStoreResponse} Store response.
   * @throws Error if derived class does not implement the cStoreRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cStoreRequest(request) {
    throw new Error('cStoreRequest method must be implemented');
  }

  /**
   * Move request received.
   * @method
   * @param {CMoveRequest} request - Move request.
   * @returns {CMoveResponse|Array<CMoveResponse>} Move response(s).
   * @throws Error if derived class does not implement the cMoveRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cMoveRequest(request) {
    throw new Error('cMoveRequest method must be implemented');
  }

  /**
   * Get request received.
   * @method
   * @param {CGetRequest} request - Get request.
   * @returns {CGetResponse|Array<CGetResponse>} Get response(s).
   * @throws Error if derived class does not implement the cGetRequest method.
   */
  // eslint-disable-next-line no-unused-vars
  cGetRequest(request) {
    throw new Error('cGetRequest method must be implemented');
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

    const handleServerError = err => {
      throw err;
    };

    this.server.on('listening', () => {
      log.info(`DICOM server listening on port ${port}`);
    });
    this.server.on('connection', socket => {
      log.info(`Client connecting from ${socket.remoteAddress}:${socket.remotePort}`);
      const client = new this.scp.class(socket, opts);
      client.connected = true;
      this.clients.push(client);

      this.clients = this.clients.filter(item => item.connected);
    });
    this.server.on('error', err => {
      const error = `Server error: ${err.message}`;
      log.error(error);
      handleServerError(new Error(error));
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
      this.clients.forEach(client => client.socket.destroy());
      this.clients = [];
    }
  }
}
//#endregion

//#region Exports
module.exports = { Server, Scp };
//#endregion
