import Network from './Network';
import { Association, PresentationContext } from './Association';
import { TransferSyntax } from './Constants';
import { Request } from './Command';
import log from './log';

import AsyncEventEmitter, { AsyncListener, EventMap } from 'async-eventemitter';
import { connect as netConnect } from 'net';
import { connect as tlsConnect } from 'tls';

//#region Client
interface ClientEventMap extends EventMap {
  connected: undefined;
  closed: AsyncListener<any, any> | any;
  associationReleased: undefined;
}

class Client extends AsyncEventEmitter<ClientEventMap> {
  requests: Request[];
  additionalPresentationContexts: PresentationContext[];
  associationLingerTimeout: number;

  /**
   * Creates an instance of Client.
   * @constructor
   */
  constructor() {
    super();
    this.requests = [];
    this.additionalPresentationContexts = [];
  }

  /**
   * Adds a request.
   * @method
   * @param {Request} request - DICOM request.
   * @throws Error if request is not an instance of the Request class.
   */
  addRequest(request: Request) {
    // Check if request is actually a request!
    if (!(request instanceof Request)) {
      throw new Error(`${request} is not a request`);
    }
    // Prevent duplicates
    if (this.requests.includes(request)) {
      return;
    }
    this.requests.push(request);
  }

  /**
   * Clears all requests.
   * @method
   */
  clearRequests() {
    this.requests.length = 0;
  }

  /**
   * Adds an additional presentation context.
   * @method
   * @param {PresentationContext} context - Presentation context.
   * @throws Error if request is not an instance of the Request class.
   */
  addAdditionalPresentationContext(context: PresentationContext) {
    // Check if request is actually a context!
    if (!(context instanceof PresentationContext)) {
      throw new Error(`${context} is not a presentation context`);
    }
    // Prevent duplicates
    if (this.additionalPresentationContexts.includes(context)) {
      return;
    }
    this.additionalPresentationContexts.push(context);
  }

  /**
   * Sends requests to the remote host.
   * @method
   * @param {string} host - Remote host.
   * @param {number} port - Remote port.
   * @param {string} callingAeTitle - Local AE title.
   * @param {string} calledAeTitle - Remote AE title.
   * @param {Object} [opts] - Network options.
   * @param {number} [opts.connectTimeout] - Connection timeout in milliseconds.
   * @param {number} [opts.associationTimeout] - Association timeout in milliseconds.
   * @param {number} [opts.pduTimeout] - PDU timeout in milliseconds.
   * @param {number} [opts.associationLingerTimeout] - Association linger timeout in milliseconds.
   * @param {boolean} [opts.logCommandDatasets] - Log DIMSE command datasets.
   * @param {boolean} [opts.logDatasets] - Log DIMSE datasets.
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {Buffer} [opts.securityOptions.key] - Client private key in PEM format.
   * @param {Buffer} [opts.securityOptions.cert] - Client public certificate in PEM format.
   * @param {Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted server certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from server that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * is not authorized with the list of supplied trusted server certificates.
   * @throws Error if there are zero requests to perform.
   */
  send(host: string, port: number, callingAeTitle: string, calledAeTitle: string, opts?: any) {
    opts = opts || {};
    this.associationLingerTimeout = opts.associationLingerTimeout || 0;

    // Check for requests
    if (this.requests.length === 0) {
      throw new Error('There are no requests to perform');
    }

    // Create association object
    const association = new Association(callingAeTitle, calledAeTitle);
    this.requests.forEach((request) => {
      association.addPresentationContextFromRequest(request, [
        TransferSyntax.ImplicitVRLittleEndian,
        TransferSyntax.ExplicitVRLittleEndian,
      ]);
    });

    // Add additional presentation contexts
    this.additionalPresentationContexts.forEach((context) => {
      const pcId = association.addOrGetPresentationContext(context.getAbstractSyntaxUid());
      const transferSyntaxes = context.getTransferSyntaxUids();
      transferSyntaxes.forEach((transferSyntax) => {
        association.addTransferSyntaxToPresentationContext(pcId, transferSyntax);
      });
    });

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

    // Connect
    log.info(`Connecting to ${host}:${port} ${opts.securityOptions ? '(TLS)' : ''}`);
    const socket = opts.securityOptions
      ? tlsConnect({ host, port, ...options })
      : netConnect({ host, port, ...options });
    const network = new Network(socket, opts);

    network.on('connect', () => {
      this.emit('connected');
      network.sendAssociationRequest(association);
    });
    network.on('associationAccepted', (association) => {
      this.emit('associationAccepted', association, this._cb);
      network.sendRequests(this.requests);
    });
    network.on('associationReleaseResponse', () => {
      this.emit('associationReleased');
      socket.end();
    });
    network.on('associationRejected', (reject) => {
      this.emit('associationRejected', reject, this._cb);
      socket.end();
    });
    network.on('done', () => {
      setTimeout(() => network.sendAssociationReleaseRequest(), this.associationLingerTimeout);
    });
    network.on('cStoreRequest', (request, callback) => {
      this.emit('cStoreRequest', request, callback);
    });
    network.on('nEventReportRequest', (request, callback) => {
      this.emit('nEventReportRequest', request, callback);
    });
    network.on('networkError', (err) => {
      socket.end();
      this.emit('networkError', err, this._cb);
    });
    network.on('close', () => {
      this.emit('closed');
    });
  }

  _cb() {
    return;
  }
}
//#endregion

//#region Exports
export default Client;
//#endregion
