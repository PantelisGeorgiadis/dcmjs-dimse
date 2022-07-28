export class Server {
    /**
     * Creates an instance of Server.
     * @constructor
     * @param {Scp} scpClass - The SCP class to receive network events.
     */
    constructor(scpClass: Scp);
    scp: {
        class: Scp;
    };
    server: any;
    clients: any[];
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
    listen(port: number, opts?: {
        connectTimeout?: number;
        associationTimeout?: number;
        pduTimeout?: number;
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
    /**
     * Closes server.
     * @method
     */
    close(): void;
}
export class Scp extends Network {
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
    constructor(socket: Socket, opts?: {
        connectTimeout?: number;
        associationTimeout?: number;
        pduTimeout?: number;
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
    });
    /**
     * Association request received.
     * @method
     * @param {Association} association - Association.
     */
    associationRequested(association: Association): void;
    /**
     * Association release request received.
     * @method
     * @param {Association} association - Association.
     */
    associationReleaseRequested(): void;
    /**
     * C-ECHO request received.
     * @method
     * @param {CEchoRequest} request - C-ECHO request.
     * @param {function(CEchoResponse)} callback - C-ECHO response callback function.
     */
    cEchoRequest(request: CEchoRequest, callback: (arg0: CEchoResponse) => any): void;
    /**
     * C-FIND request received.
     * @method
     * @param {CFindRequest} request - C-FIND request.
     * @param {function(Array<CFindResponse>)} callback - C-FIND response callback function.
     */
    cFindRequest(request: CFindRequest, callback: (arg0: Array<CFindResponse>) => any): void;
    /**
     * C-STORE request received.
     * @method
     * @param {CStoreRequest} request - C-STORE request.
     * @param {function(CStoreResponse)} callback - C-STORE response callback function.
     */
    cStoreRequest(request: CStoreRequest, callback: (arg0: CStoreResponse) => any): void;
    /**
     * C-MOVE request received.
     * @method
     * @param {CMoveRequest} request - C-MOVE request.
     * @param {function(Array<CMoveResponse>)} callback - C-MOVE response callback function.
     */
    cMoveRequest(request: CMoveRequest, callback: (arg0: Array<CMoveResponse>) => any): void;
    /**
     * C-GET request received.
     * @method
     * @param {CGetRequest} request - C-GET request.
     * @param {function(Array<CGetResponse>)} callback - C-GET response callback function.
     */
    cGetRequest(request: CGetRequest, callback: (arg0: Array<CGetResponse>) => any): void;
    /**
     * N-CREATE request received.
     * @method
     * @param {NCreateRequest} request - N-CREATE request.
     * @param {function(NCreateResponse)} callback - N-CREATE response callback function.
     */
    nCreateRequest(request: NCreateRequest, callback: (arg0: NCreateResponse) => any): void;
    /**
     * N-ACTION request received.
     * @method
     * @param {NActionRequest} request - N-ACTION request.
     * @param {function(NActionResponse)} callback - N-ACTION response callback function.
     */
    nActionRequest(request: NActionRequest, callback: (arg0: NActionResponse) => any): void;
    /**
     * N-DELETE request received.
     * @method
     * @param {NDeleteRequest} request - N-DELETE request.
     * @param {function(NDeleteResponse)} callback - N-DELETE response callback function.
     */
    nDeleteRequest(request: NDeleteRequest, callback: (arg0: NDeleteResponse) => any): void;
    /**
     * N-EVENT-REPORT request received.
     * @method
     * @param {NEventReportRequest} request - N-EVENT-REPORT request.
     * @param {function(NEventReportResponse)} callback - N-EVENT-REPORT response callback function.
     */
    nEventReportRequest(request: NEventReportRequest, callback: (arg0: NEventReportResponse) => any): void;
    /**
     * N-GET request received.
     * @method
     * @param {NGetRequest} request - N-GET request.
     * @param {function(NGetResponse)} callback - N-GET response callback function.
     */
    nGetRequest(request: NGetRequest, callback: (arg0: NGetResponse) => any): void;
    /**
     * N-SET request received.
     * @method
     * @param {NSetRequest} request - N-SET request.
     * @param {function(NSetResponse)} callback - N-SET response callback function.
     */
    nSetRequest(request: NSetRequest, callback: (arg0: NSetResponse) => any): void;
}
import Network = require("./Network");
import { CEchoResponse } from "./Command";
import { CFindResponse } from "./Command";
import { CStoreResponse } from "./Command";
import { CMoveResponse } from "./Command";
import { CGetResponse } from "./Command";
import { NCreateResponse } from "./Command";
import { NActionResponse } from "./Command";
import { NDeleteResponse } from "./Command";
import { NEventReportResponse } from "./Command";
import { NGetResponse } from "./Command";
import { NSetResponse } from "./Command";
