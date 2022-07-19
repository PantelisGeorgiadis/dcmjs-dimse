import Network from './Network';
import log from './log';
import {
  CEchoResponse,
  CFindResponse,
  CStoreResponse,
  CMoveResponse,
  CGetResponse,
  NCreateResponse,
  NActionResponse,
  NDeleteResponse,
  NEventReportResponse,
  NGetResponse,
  NSetResponse,
  NGetRequest,
  NSetRequest,
  CStoreRequest,
  CFindRequest,
  CEchoRequest,
  CMoveRequest,
  CGetRequest,
  NCreateRequest,
  NActionRequest,
  NDeleteRequest,
  NEventReportRequest,
} from './Command';

import AsyncEventEmitter, { EventMap } from 'async-eventemitter';
import net from 'net';
import tls from 'tls';
import { Association } from './Association';

//#region Scp
/* c8 ignore start */
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
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {Buffer} [opts.securityOptions.key] - Server private key in PEM format.
   * @param {Buffer} [opts.securityOptions.cert] - Server public certificate in PEM format.
   * @param {Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted client certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from clients that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * is not authorized with the list of supplied trusted client certificates.
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   */
  constructor(socket, opts) {
    super(socket, opts);

    this.on('associationRequested', (association) => {
      this.associationRequested(association);
    });
    this.on('associationReleaseRequested', () => {
      this.associationReleaseRequested();
    });
    this.on('cEchoRequest', (request, callback) => {
      this.cEchoRequest(request, callback);
    });
    this.on('cFindRequest', (request, callback) => {
      this.cFindRequest(request, callback);
    });
    this.on('cStoreRequest', (request, callback) => {
      this.cStoreRequest(request, callback);
    });
    this.on('cMoveRequest', (request, callback) => {
      this.cMoveRequest(request, callback);
    });
    this.on('cGetRequest', (request, callback) => {
      this.cGetRequest(request, callback);
    });
    this.on('nCreateRequest', (request, callback) => {
      this.nCreateRequest(request, callback);
    });
    this.on('nActionRequest', (request, callback) => {
      this.nActionRequest(request, callback);
    });
    this.on('nDeleteRequest', (request, callback) => {
      this.nDeleteRequest(request, callback);
    });
    this.on('nEventReportRequest', (request, callback) => {
      this.nEventReportRequest(request, callback);
    });
    this.on('nGetRequest', (request, callback) => {
      this.nGetRequest(request, callback);
    });
    this.on('nSetRequest', (request, callback) => {
      this.nSetRequest(request, callback);
    });
  }

  /**
   * Association request received.
   * @method
   * @param {Association} association - Association.
   */
  // eslint-disable-next-line no-unused-vars
  associationRequested(association: Association) {
    log.error('associationRequested method must be implemented');
    this.sendAssociationReject();
  }

  /**
   * Association release request received.
   * @method
   * @param {Association} association - Association.
   */
  associationReleaseRequested() {
    log.error('associationReleaseRequested method must be implemented');
    this.sendAssociationReleaseResponse();
  }

  /**
   * C-ECHO request received.
   * @method
   * @param {CEchoRequest} request - C-ECHO request.
   * @param {function(CEchoResponse)} callback - C-ECHO response callback function.
   */
  cEchoRequest(request: CEchoRequest, callback: (arg0: CEchoResponse) => any) {
    log.error('cEchoRequest method must be implemented');
    callback(CEchoResponse.fromRequest(request));
  }

  /**
   * C-FIND request received.
   * @method
   * @param {CFindRequest} request - C-FIND request.
   * @param {function(CFindResponse)} callback - C-FIND response callback function.
   */
  cFindRequest(request: CFindRequest, callback: (arg0: CFindResponse) => any) {
    log.error('cFindRequest method must be implemented');
    callback(CFindResponse.fromRequest(request));
  }

  /**
   * C-STORE request received.
   * @method
   * @param {CStoreRequest} request - C-STORE request.
   * @param {function(CStoreResponse)} callback - C-STORE response callback function.
   */
  cStoreRequest(request: CStoreRequest, callback: (arg0: CStoreResponse) => any) {
    log.error('cStoreRequest method must be implemented');
    callback(CStoreResponse.fromRequest(request));
  }

  /**
   * C-MOVE request received.
   * @method
   * @param {CMoveRequest} request - C-MOVE request.
   * @param {function(CMoveResponse)} callback - C-MOVE response callback function.
   */
  // eslint-disable-next-line no-unused-vars
  cMoveRequest(request: CMoveRequest, callback: (arg0: CMoveResponse) => any) {
    log.error('cMoveRequest method must be implemented');
    callback(CMoveResponse.fromRequest(request));
  }

  /**
   * C-GET request received.
   * @method
   * @param {CGetRequest} request - C-GET request.
   * @param {function(CGetResponse)} callback - C-GET response callback function.
   */
  cGetRequest(request: CGetRequest, callback: (arg0: CGetResponse) => any) {
    log.error('cGetRequest method must be implemented');
    callback(CGetResponse.fromRequest(request));
  }

  /**
   * N-CREATE request received.
   * @method
   * @param {NCreateRequest} request - N-CREATE request.
   * @param {function(NCreateResponse)} callback - N-CREATE response callback function.
   */
  nCreateRequest(request: NCreateRequest, callback: (arg0: NCreateResponse) => any) {
    log.error('nCreateRequest method must be implemented');
    callback(NCreateResponse.fromRequest(request));
  }

  /**
   * N-ACTION request received.
   * @method
   * @param {NActionRequest} request - N-ACTION request.
   * @param {function(NActionResponse)} callback - N-ACTION response callback function.
   */
  nActionRequest(request: NActionRequest, callback: (arg0: NActionResponse) => any) {
    log.error('nActionRequest method must be implemented');
    callback(NActionResponse.fromRequest(request));
  }

  /**
   * N-DELETE request received.
   * @method
   * @param {NDeleteRequest} request - N-DELETE request.
   * @param {function(NDeleteResponse)} callback - N-DELETE response callback function.
   */
  nDeleteRequest(request: NDeleteRequest, callback: (arg0: NDeleteResponse) => any) {
    log.error('nDeleteRequest method must be implemented');
    callback(NDeleteResponse.fromRequest(request));
  }

  /**
   * N-EVENT-REPORT request received.
   * @method
   * @param {NEventReportRequest} request - N-EVENT-REPORT request.
   * @param {function(NEventReportResponse)} callback - N-EVENT-REPORT response callback function.
   */
  nEventReportRequest(request: NEventReportRequest, callback: (arg0: NEventReportResponse) => any) {
    log.error('nEventReportRequest method must be implemented');
    callback(NEventReportResponse.fromRequest(request));
  }

  /**
   * N-GET request received.
   * @method
   * @param {NGetRequest} request - N-GET request.
   * @param {function(NGetResponse)} callback - N-GET response callback function.
   */
  nGetRequest(request: NGetRequest, callback: (arg0: NGetResponse) => any) {
    log.error('nGetRequest method must be implemented');
    callback(NGetResponse.fromRequest(request));
  }

  /**
   * N-SET request received.
   * @method
   * @param {NSetRequest} request - N-SET request.
   * @param {function(NSetResponse)} callback - N-SET response callback function.
   */
  nSetRequest(request: NSetRequest, callback: (arg0: NSetResponse) => any) {
    log.error('nSetRequest method must be implemented');
    callback(NSetResponse.fromRequest(request));
  }
}
/* c8 ignore stop */
//#endregion

//#region Server
class Server extends AsyncEventEmitter<EventMap> {
  scp: { class: typeof Scp };
  server: net.Server | tls.Server;
  clients: any[];

  /**
   * Creates an instance of Server.
   * @constructor
   * @param {Scp} scpClass - The SCP class to receive network events.
   */
  constructor(scpClass: typeof Scp) {
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
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {Buffer} [opts.securityOptions.key] - Server private key in PEM format.
   * @param {Buffer} [opts.securityOptions.cert] - Server public certificate in PEM format.
   * @param {Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted client certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from clients that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * is not authorized with the list of supplied trusted client certificates.
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   */
  listen(port: number, opts?: any) {
    opts = opts || {};

    let options = {};
    if (opts.securityOptions) {
      options = {
        key: opts.securityOptions.key,
        cert: opts.securityOptions.cert,
        ca: opts.securityOptions.ca,
        requestCert: opts.securityOptions.requestCert,
        rejectUnauthorized: opts.securityOptions.rejectUnauthorized,
        minVersion: opts.securityOptions.minVersion,
        maxVersion: opts.securityOptions.maxVersion,
      };
    }

    // Initialize network
    const serverCallback = (socket: net.Socket | tls.TLSSocket) => {
      log.info(
        `Client connecting from ${socket.remoteAddress}:${socket.remotePort} ${
          opts.securityOptions && socket instanceof tls.TLSSocket
            ? socket.authorized
              ? '(Authorized)'
              : '(Unauthorized)'
            : ''
        }`
      );
      const client = new this.scp.class(socket, opts);
      client.connected = true;
      this.clients.push(client);

      this.clients = this.clients.filter((item) => item.connected);
    };

    this.server = opts.securityOptions
      ? tls.createServer(options, serverCallback)
      : net.createServer(options, serverCallback);

    this.server.on('listening', () => {
      log.info(`DICOM server listening on port ${port} ${opts.securityOptions ? '(TLS)' : ''}`);
    });
    this.server.on('error', (err) => {
      const error = `Server error: ${err.message}`;
      log.error(error);
      this.emit('networkError', err, this._cb);
    });
    this.server.listen(port);
  }

  /**
   * Closes server.
   * @method
   */
  close() {
    if (this.server && this.server.listening) {
      this.server.close();
    }

    // Close all live sockets
    this.clients.forEach((client) => client.socket.destroy());
    this.clients = [];
  }

  _cb() {
    return;
  }
}
//#endregion

//#region Exports
export { Server, Scp };
//#endregion
