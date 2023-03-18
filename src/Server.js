const {
  CEchoResponse,
  CFindResponse,
  CGetResponse,
  CMoveResponse,
  CStoreResponse,
  NActionResponse,
  NCreateResponse,
  NDeleteResponse,
  NEventReportResponse,
  NGetResponse,
  NSetResponse,
} = require('./Command');
const Network = require('./Network');
const Statistics = require('./Statistics');
const log = require('./log');

const AsyncEventEmitter = require('async-eventemitter');
const net = require('net');
const tls = require('tls');

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
   * @param {Object} [opts.datasetReadOptions] - The read options to pass through to `DicomMessage._read()`.
   * @param {Object} [opts.datasetWriteOptions] - The write options to pass through to `DicomMessage.write()`.
   * @param {Object} [opts.datasetNameMap] - Additional DICOM tags to recognize when denaturalizing the dataset.
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.key] - Server private key in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.cert] - Server public certificate in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted client certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from clients that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * is not authorized with the list of supplied trusted client certificates.
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.ciphers] - Cipher suite specification, replacing the default.
   * @param {function} [opts.securityOptions.SNICallback] - A function that will be called if the client supports SNI TLS extension.
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
    this.on('cCancelRequest', (request) => {
      this.cCancelRequest(request);
    });
    this.on('abort', ({ source, reason }) => {
      this.abort(source, reason);
    });
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
    return super.createStoreWritableStream();
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
    return super.createDatasetFromStoreWritableStream(
      writable,
      acceptedPresentationContext,
      callback
    );
  }

  /**
   * Association request received.
   * @method
   * @param {Association} association - Association.
   */
  // eslint-disable-next-line no-unused-vars
  associationRequested(association) {
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
  cEchoRequest(request, callback) {
    log.error('cEchoRequest method must be implemented');
    callback(CEchoResponse.fromRequest(request));
  }

  /**
   * C-FIND request received.
   * @method
   * @param {CFindRequest} request - C-FIND request.
   * @param {function(Array<CFindResponse>)} callback - C-FIND response callback function.
   */
  cFindRequest(request, callback) {
    log.error('cFindRequest method must be implemented');
    callback(CFindResponse.fromRequest(request));
  }

  /**
   * C-STORE request received.
   * @method
   * @param {CStoreRequest} request - C-STORE request.
   * @param {function(CStoreResponse)} callback - C-STORE response callback function.
   */
  cStoreRequest(request, callback) {
    log.error('cStoreRequest method must be implemented');
    callback(CStoreResponse.fromRequest(request));
  }

  /**
   * C-MOVE request received.
   * @method
   * @param {CMoveRequest} request - C-MOVE request.
   * @param {function(Array<CMoveResponse>)} callback - C-MOVE response callback function.
   */
  // eslint-disable-next-line no-unused-vars
  cMoveRequest(request, callback) {
    log.error('cMoveRequest method must be implemented');
    callback(CMoveResponse.fromRequest(request));
  }

  /**
   * C-GET request received.
   * @method
   * @param {CGetRequest} request - C-GET request.
   * @param {function(Array<CGetResponse>)} callback - C-GET response callback function.
   */
  cGetRequest(request, callback) {
    log.error('cGetRequest method must be implemented');
    callback(CGetResponse.fromRequest(request));
  }

  /**
   * N-CREATE request received.
   * @method
   * @param {NCreateRequest} request - N-CREATE request.
   * @param {function(NCreateResponse)} callback - N-CREATE response callback function.
   */
  nCreateRequest(request, callback) {
    log.error('nCreateRequest method must be implemented');
    callback(NCreateResponse.fromRequest(request));
  }

  /**
   * N-ACTION request received.
   * @method
   * @param {NActionRequest} request - N-ACTION request.
   * @param {function(NActionResponse)} callback - N-ACTION response callback function.
   */
  nActionRequest(request, callback) {
    log.error('nActionRequest method must be implemented');
    callback(NActionResponse.fromRequest(request));
  }

  /**
   * N-DELETE request received.
   * @method
   * @param {NDeleteRequest} request - N-DELETE request.
   * @param {function(NDeleteResponse)} callback - N-DELETE response callback function.
   */
  nDeleteRequest(request, callback) {
    log.error('nDeleteRequest method must be implemented');
    callback(NDeleteResponse.fromRequest(request));
  }

  /**
   * N-EVENT-REPORT request received.
   * @method
   * @param {NEventReportRequest} request - N-EVENT-REPORT request.
   * @param {function(NEventReportResponse)} callback - N-EVENT-REPORT response callback function.
   */
  nEventReportRequest(request, callback) {
    log.error('nEventReportRequest method must be implemented');
    callback(NEventReportResponse.fromRequest(request));
  }

  /**
   * N-GET request received.
   * @method
   * @param {NGetRequest} request - N-GET request.
   * @param {function(NGetResponse)} callback - N-GET response callback function.
   */
  nGetRequest(request, callback) {
    log.error('nGetRequest method must be implemented');
    callback(NGetResponse.fromRequest(request));
  }

  /**
   * N-SET request received.
   * @method
   * @param {NSetRequest} request - N-SET request.
   * @param {function(NSetResponse)} callback - N-SET response callback function.
   */
  nSetRequest(request, callback) {
    log.error('nSetRequest method must be implemented');
    callback(NSetResponse.fromRequest(request));
  }

  /**
   * C-CANCEL request received.
   * @method
   * @param {CCancelRequest} request - C-CANCEL request.
   */
  // eslint-disable-next-line no-unused-vars
  cCancelRequest(request) {
    log.error('cCancelRequest method must be implemented');
  }

  /**
   * A-ABORT received.
   * @method
   * @param {AbortSource} source - Abortion source.
   * @param {AbortReason} reason - Abortion reason.
   */
  // eslint-disable-next-line no-unused-vars
  abort(source, reason) {
    log.error('abort method must be implemented');
  }
}
/* c8 ignore stop */
//#endregion

//#region Server
class Server extends AsyncEventEmitter {
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
    this.statistics = new Statistics();
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
   * @param {Object} [opts.datasetReadOptions] - The read options to pass through to `DicomMessage._read()`.
   * @param {Object} [opts.datasetWriteOptions] - The write options to pass through to `DicomMessage.write()`.
   * @param {Object} [opts.datasetNameMap] - Additional DICOM tags to recognize when denaturalizing the dataset.
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.key] - Server private key in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.cert] - Server public certificate in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted client certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from clients that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * is not authorized with the list of supplied trusted client certificates.
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.ciphers] - Cipher suite specification, replacing the default.
   * @param {function} [opts.securityOptions.SNICallback] - A function that will be called if the client supports SNI TLS extension.
   */
  listen(port, opts) {
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
        ciphers: opts.securityOptions.ciphers,
        SNICallback: opts.securityOptions.SNICallback,
      };
    }

    // Initialize network
    const netImpl = opts.securityOptions ? tls : net;
    this.server = netImpl.createServer(options, (socket) => {
      log.info(
        `Client connecting from ${socket.remoteAddress}:${socket.remotePort} ${
          opts.securityOptions ? (socket.authorized ? '(Authorized)' : '(Unauthorized)') : ''
        }`
      );
      const client = new this.scp.class(socket, opts);
      client.connected = true;
      client.on('close', () => {
        this.statistics.addFromOtherStatistics(client.getStatistics());
      });
      this.clients.push(client);

      this.clients = this.clients.filter((item) => item.connected);
    });
    this.server.on('listening', () => {
      log.info(`DICOM server listening on port ${port} ${opts.securityOptions ? '(TLS)' : ''}`);
      this.emit('listening');
    });
    this.server.on('error', (err) => {
      const error = `Server error: ${err.message}`;
      log.error(error);
      this.emit('networkError', err);
    });
    this.server.listen(port);
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
}
//#endregion

//#region Exports
module.exports = { Scp, Server };
//#endregion
