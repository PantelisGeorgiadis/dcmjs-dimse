const { Association, PresentationContext } = require('./Association');
const { TransferSyntax, UserIdentityType } = require('./Constants');
const { Request } = require('./Command');
const Network = require('./Network');
const Statistics = require('./Statistics');
const log = require('./log');

const AsyncEventEmitter2 = require('async-event-emitter2');
const net = require('net');
const tls = require('tls');

//#region Client
class Client extends AsyncEventEmitter2 {
  /**
   * Creates an instance of Client.
   * @constructor
   */
  constructor() {
    super();
    this.requests = [];
    this.additionalPresentationContexts = [];
    this.network = undefined;
    this.statistics = new Statistics();
  }

  /**
   * Adds a request.
   * @method
   * @param {Request} request - DICOM request.
   * @throws {Error} If request is not an instance of the Request class.
   */
  addRequest(request) {
    // Check if request is actually a request!
    if (!(request instanceof Request)) {
      throw new Error(`${request.toString()} is not a request`);
    }
    // Prevent duplicates
    if (this.requests.includes(request)) {
      log.warn(`${request.toString()} request has already been added. Ignoring...`);
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
   * @param {boolean} [addAsNew] - Flag to indicate whether to add the provided context
   * as a new one, irrespectively if the respected SOP class already exists in the association.
   * @throws {Error} If request is not an instance of the Request class.
   */
  addAdditionalPresentationContext(context, addAsNew) {
    addAsNew = addAsNew || false;
    // Check if request is actually a context!
    if (!(context instanceof PresentationContext)) {
      throw new Error(`${context.toString()} is not a presentation context`);
    }
    // Prevent duplicates
    if (this.additionalPresentationContexts.some((i) => i.context === context)) {
      log.warn(`${context.toString()} context has already been added. Ignoring...`);
      return;
    }
    this.additionalPresentationContexts.push({ context, addAsNew });
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
   * @param {Object} [opts.datasetReadOptions] - The read options to pass through to `DicomMessage._read()`.
   * @param {Object} [opts.datasetWriteOptions] - The write options to pass through to `DicomMessage.write()`.
   * @param {Object} [opts.datasetNameMap] - Additional DICOM tags to recognize when denaturalizing the dataset.
   * @param {Object} [opts.datasetTranscodeOptions] - Additional transcoding option to pass to `Transcoder`.
   * @param {Object} [opts.asyncOps] - Asynchronous operations options.
   * @param {number} [opts.asyncOps.maxAsyncOpsInvoked] - Supported maximum number of asynchronous operations invoked.
   * @param {number} [opts.asyncOps.maxAsyncOpsPerformed] - Supported maximum number of asynchronous operations performed.
   * @param {Object} [opts.userIdentity] - User identity negotiation options.
   * @param {UserIdentityType} [opts.userIdentity.type] - User identity type.
   * @param {boolean} [opts.userIdentity.positiveResponseRequested] - Expect positive response.
   * @param {string} [opts.userIdentity.primaryField] - User identity primary field.
   * @param {string} [opts.userIdentity.secondaryField] - User identity secondary field.
   * @param {Object} [opts.securityOptions] - Security options.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.key] - Client private key in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.cert] - Client public certificate in PEM format.
   * @param {string|Array<string>|Buffer|Array<Buffer>} [opts.securityOptions.ca] - Trusted server certificates in PEM format.
   * @param {boolean} [opts.securityOptions.requestCert] - Flag indicating whether to request a
   * certificate from server that connect and attempt to verify it.
   * @param {boolean} [opts.securityOptions.rejectUnauthorized] - Reject any connection which
   * is not authorized with the list of supplied trusted server certificates.
   * @param {string} [opts.securityOptions.minVersion] - The minimum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.maxVersion] - The maximum TLS version to allow. One of
   * 'TLSv1.3', 'TLSv1.2', 'TLSv1.1', or 'TLSv1'.
   * @param {string} [opts.securityOptions.ciphers] - Cipher suite specification, replacing the default.
   * @throws {Error} If there are zero requests to perform.
   */
  send(host, port, callingAeTitle, calledAeTitle, opts) {
    opts = opts || {};
    this.associationLingerTimeout = opts.associationLingerTimeout || 0;

    // Check for requests
    if (this.requests.length === 0) {
      throw new Error('There are no requests to perform');
    }

    // Create association object
    const association = new Association(callingAeTitle, calledAeTitle);
    if (opts.asyncOps) {
      association.setMaxAsyncOpsInvoked(opts.asyncOps.maxAsyncOpsInvoked || 1);
      association.setMaxAsyncOpsPerformed(opts.asyncOps.maxAsyncOpsPerformed || 1);
      association.setNegotiateAsyncOps(
        association.getMaxAsyncOpsInvoked() !== 1 || association.getMaxAsyncOpsPerformed() !== 1
      );
    }
    if (opts.userIdentity) {
      association.setUserIdentityType(opts.userIdentity.type || UserIdentityType.Username);
      association.setUserIdentityPositiveResponseRequested(
        opts.userIdentity.positiveResponseRequested || false
      );
      association.setUserIdentityPrimaryField(opts.userIdentity.primaryField || '');
      association.setUserIdentitySecondaryField(opts.userIdentity.secondaryField || '');
      association.setNegotiateUserIdentity(true);
    }

    // Add requests
    this.requests.forEach((request) => {
      association.addPresentationContextFromRequest(request, [
        TransferSyntax.ImplicitVRLittleEndian,
        TransferSyntax.ExplicitVRLittleEndian,
      ]);
    });

    // Add additional presentation contexts
    this.additionalPresentationContexts.forEach((item) => {
      const pcId = item.addAsNew
        ? association.addPresentationContext(item.context.getAbstractSyntaxUid())
        : association.addOrGetPresentationContext(item.context.getAbstractSyntaxUid());
      const transferSyntaxes = item.context.getTransferSyntaxUids();
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
        ciphers: opts.securityOptions.ciphers,
      };
    }

    // Connect
    log.info(`Connecting to ${host}:${port} ${opts.securityOptions ? '(TLS)' : ''}`);
    const netImpl = opts.securityOptions ? tls : net;
    const socket = netImpl.connect({ host, port, ...options });

    const network = new Network(socket, opts);
    network.on('connect', () => {
      this.emit('connected');
      network.sendAssociationRequest(association);
    });
    network.on('associationAccepted', (association) => {
      this.emit('associationAccepted', association);
      network.sendRequests(this.requests);
    });
    network.on('associationReleaseResponse', () => {
      this.emit('associationReleased');
      socket.end();
    });
    network.on('associationRejected', (reject) => {
      this.emit('associationRejected', reject);
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
      this.emit('networkError', err);
    });
    network.on('close', () => {
      this.statistics.addFromOtherStatistics(network.getStatistics());
      this.network = undefined;
      this.emit('closed');
    });
    this.network = network;
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
   * Aborts the established association.
   * @method
   * @param {AbortSource} [source] - Abortion source.
   * @param {AbortReason} [reason] - Abortion reason.
   * @throws {Error} If the network has not been initialized.
   */
  abort(source, reason) {
    if (!this.network) {
      throw new Error('Network has not been initialized');
    }

    this.network.sendAbort(source, reason);
  }

  /**
   * Cancels a C-FIND, C-MOVE or C-GET request.
   * @method
   * @param {CFindRequest|CMoveRequest|CGetRequest} request - C-FIND, C-MOVE or C-GET request.
   * @throws {Error} If request is not an instance of CFindRequest, CMoveRequest or CGetRequest
   * or the network has not been initialized.
   */
  cancel(request) {
    if (!this.network) {
      throw new Error('Network has not been initialized');
    }

    this.network.sendCancel(request);
  }
}
//#endregion

//#region Exports
module.exports = Client;
//#endregion
