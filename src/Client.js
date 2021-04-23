const { Association } = require('./Association');
const Network = require('./Network');
const { Request } = require('./Command');

//#region Client
class Client {
  /**
   * Creates an instance of Client.
   *
   * @memberof Client
   */
  constructor() {
    this.requests = [];
  }

  /**
   * Adds a request.
   *
   * @param {Object} request - DICOM request.
   * @memberof Client
   */
  addRequest(request) {
    // Check if request is actually a request!
    if (!(request instanceof Request)) {
      throw new Error(`${request.toString()} is not a request.`);
    }
    // Prevent duplicates
    if (this.requests.includes(request)) {
      return;
    }
    this.requests.push(request);
  }

  /**
   * Clears all requests.
   *
   * @memberof Client
   */
  clearRequests() {
    this.requests.length = 0;
  }

  /**
   * Sends requests to the remote host.
   *
   * @param {String} host - Remote host.
   * @param {Number} port - Remote port.
   * @param {String} callingAeTitle - Local AE title.
   * @param {String} calledAeTitle - Remote AE title.
   * @memberof Client
   */
  send(host, port, callingAeTitle, calledAeTitle) {
    // Check for requests
    if (this.requests.length === 0) {
      throw new Error('There are no requests to perform.');
    }

    // Create association object
    const association = new Association(callingAeTitle, calledAeTitle);
    this.requests.forEach(request => {
      association.addPresentationContextFromRequest(request);
    });

    // Initialize network
    const network = new Network();
    network.on('connect', () => {
      network.associate(association);
    });
    // eslint-disable-next-line no-unused-vars
    network.on('associationAccepted', association => {
      network.sendRequests(this.requests);
    });
    network.on('done', () => {
      network.release();
    });
    network.on('associationReleaseResponse', () => {
      network.close();
    });
    network.on('associationRejected', (result, source, reason) => {
      throw new Error(`Association rejected. Result: ${result}, source: ${source}, reason: ${reason}`);
    });
    network.on('error', err => {
      throw err;
    });

    // Connect
    network.connect(host, port);
  }
}
//#endregion

//#region Exports
module.exports = Client;
//#endregion
