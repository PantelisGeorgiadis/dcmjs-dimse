export = Network;
declare class Network {
    /**
     * Creates an instance of Network.
     * @constructor
     * @param {Socket} socket - Network socket.
     * @param {Object} [opts] - Network options.
     * @param {number} [opts.connectTimeout] - Connection timeout in milliseconds.
     * @param {number} [opts.associationTimeout] - Association timeout in milliseconds.
     * @param {number} [opts.pduTimeout] - PDU timeout in milliseconds.
     * @param {boolean} [opts.logCommandDatasets] - Log DIMSE command datasets.
     * @param {boolean} [opts.logDatasets] - Log DIMSE datasets.
     */
    constructor(socket: Socket, opts?: {
        connectTimeout?: number;
        associationTimeout?: number;
        pduTimeout?: number;
        logCommandDatasets?: boolean;
        logDatasets?: boolean;
    });
    messageId: number;
    socket: Socket;
    requests: any[];
    pending: any[];
    dimseBuffer: SmartBuffer;
    dimse: Command | (CEchoRequest & Command) | (CEchoResponse & Command) | (CFindRequest & Command) | (CFindResponse & Command) | (CStoreRequest & Command) | (CStoreResponse & Command) | (CMoveRequest & Command) | (CMoveResponse & Command) | (CGetRequest & Command) | (CGetResponse & Command) | (NCreateRequest & Command) | (NCreateResponse & Command) | (NActionRequest & Command) | (NActionResponse & Command) | (NDeleteRequest & Command) | (NDeleteResponse & Command) | (NEventReportRequest & Command) | (NEventReportResponse & Command) | (NGetRequest & Command) | (NGetResponse & Command) | (NSetRequest & Command) | (NSetResponse & Command);
    connectTimeout: number;
    associationTimeout: number;
    pduTimeout: number;
    logCommandDatasets: boolean;
    logDatasets: boolean;
    logId: string;
    connected: boolean;
    connectedTime: number;
    lastPduTime: number;
    timeoutIntervalId: NodeJS.Timer;
    /**
     * Sends association request.
     * @method
     * @param {Association} association - Association.
     */
    sendAssociationRequest(association: Association): void;
    association: Association;
    /**
     * Sends association accept.
     * @method
     */
    sendAssociationAccept(): void;
    /**
     * Sends association reject.
     * @method
     * @param {number} [result] - Rejection result.
     * @param {number} [source] - Rejection source.
     * @param {number} [reason] - Rejection reason.
     */
    sendAssociationReject(result?: number, source?: number, reason?: number): void;
    /**
     * Sends association release request.
     * @method
     */
    sendAssociationReleaseRequest(): void;
    /**
     * Sends association release response.
     * @method
     */
    sendAssociationReleaseResponse(): void;
    /**
     * Sends abort request.
     * @method
     * @param {number} [source] - Rejection source.
     * @param {number} [reason] - Rejection reason.
     */
    sendAbort(source?: number, reason?: number): void;
    /**
     * Sends requests.
     * @method
     * @param {Array<Request>|Request} requests - Requests to perform.
     */
    sendRequests(requests: Array<Request> | Request): void;
    /**
     * Advances the message ID.
     * @method
     * @private
     */
    private _getNextMessageId;
    /**
     * Sends PDU over the network.
     * @method
     * @private
     * @param {Buffer} pdu - PDU.
     */
    private _sendPdu;
    /**
     * Sends requests over the network.
     * @method
     * @private
     */
    private _sendNextRequests;
    /**
     * Sends DIMSE over the network.
     * @method
     * @private
     * @param {Object} dimse - DIMSE information.
     * @param {Command} dimse.command - Command.
     * @param {PresentationContext} dimse.context - Presentation context.
     */
    private _sendDimse;
    /**
     * Sends PDataTF over the network.
     * @method
     * @private
     * @param {Command} command - The requesting command.
     * @param {number} pcId - Presentation context ID.
     * @param {number} maxPduLength - Maximum PDU length.
     */
    private _sendPDataTF;
    /**
     * Process received PDU from the network.
     * @method
     * @private
     * @param {Buffer} data - Accumulated PDU data.
     */
    private _processPdu;
    /**
     * Process P-DATA-TF.
     * @method
     * @private
     * @param {PDataTF} pdu - PDU.
     */
    private _processPDataTf;
    /**
     * Perform DIMSE operation.
     * @method
     * @private
     * @param {PresentationContext} presentationContext - Accepted presentation context.
     * @param {Request|Response} dimse - DIMSE.
     */
    private _performDimse;
    /**
     * Wraps socket operations.
     * @method
     * @private
     */
    private _wrapSocket;
    /**
     * Resets connection stats.
     * @method
     * @private
     */
    private _reset;
}
import { SmartBuffer } from "smart-buffer";
import { Command } from "./Command";
import { CEchoRequest } from "./Command";
import { CEchoResponse } from "./Command";
import { CFindRequest } from "./Command";
import { CFindResponse } from "./Command";
import { CStoreRequest } from "./Command";
import { CStoreResponse } from "./Command";
import { CMoveRequest } from "./Command";
import { CMoveResponse } from "./Command";
import { CGetRequest } from "./Command";
import { CGetResponse } from "./Command";
import { NCreateRequest } from "./Command";
import { NCreateResponse } from "./Command";
import { NActionRequest } from "./Command";
import { NActionResponse } from "./Command";
import { NDeleteRequest } from "./Command";
import { NDeleteResponse } from "./Command";
import { NEventReportRequest } from "./Command";
import { NEventReportResponse } from "./Command";
import { NGetRequest } from "./Command";
import { NGetResponse } from "./Command";
import { NSetRequest } from "./Command";
import { NSetResponse } from "./Command";
import { Association } from "./Association";
