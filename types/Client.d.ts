export = Client;
declare class Client {
    requests: any[];
    additionalPresentationContexts: any[];
    /**
     * Adds a request.
     * @method
     * @param {Request} request - DICOM request.
     * @throws Error if request is not an instance of the Request class.
     */
    addRequest(request: Request): void;
    /**
     * Clears all requests.
     * @method
     */
    clearRequests(): void;
    /**
     * Adds an additional presentation context.
     * @method
     * @param {PresentationContext} context - Presentation context.
     * @throws Error if request is not an instance of the Request class.
     */
    addAdditionalPresentationContext(context: PresentationContext): void;
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
    send(host: string, port: number, callingAeTitle: string, calledAeTitle: string, opts?: {
        connectTimeout?: number;
        associationTimeout?: number;
        pduTimeout?: number;
        associationLingerTimeout?: number;
        logCommandDatasets?: boolean;
        logDatasets?: boolean;
        securityOptions?: {
            key?: Buffer;
            cert?: Buffer;
            ca?: Buffer | Array<Buffer>;
            requestCert?: boolean;
            rejectUnauthorized?: boolean;
            minVersion?: string;
            maxVersion?: string;
        };
    }): void;
    associationLingerTimeout: number;
}
import { Request } from "./Command";
import { PresentationContext } from "./Association";
