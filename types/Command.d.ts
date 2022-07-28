export class Command {
    /**
     * Creates an instance of Command.
     * @constructor
     * @param {Dataset} [commandDataset] - Command dataset.
     * @param {Dataset} [dataset] - Dataset.
     */
    constructor(commandDataset?: Dataset, dataset?: Dataset);
    commandDataset: Dataset;
    dataset: Dataset;
    /**
     * Gets command dataset.
     * @method
     * @returns {Dataset} Command dataset.
     */
    getCommandDataset(): Dataset;
    /**
     * Sets command dataset.
     * @method
     * @param {Dataset} dataset - Command dataset.
     */
    setCommandDataset(dataset: Dataset): void;
    /**
     * Gets dataset.
     * @method
     * @returns {Dataset} Dataset.
     */
    getDataset(): Dataset;
    /**
     * Sets dataset and updates CommandDataSetType element.
     * @method
     * @param {Dataset} dataset - Dataset.
     */
    setDataset(dataset: Dataset): void;
    /**
     * Gets command field type.
     * @method
     * @returns {number} Command field type.
     */
    getCommandFieldType(): number;
    /**
     * Command has dataset.
     * @method
     * @returns {boolean} Command has dataset.
     */
    hasDataset(): boolean;
    /**
     * Gets the command description.
     * @method
     * @param {Object} [opts] - Description generation options.
     * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
     * @param {boolean} [opts.includeDataset] - Include dataset in the description.
     * @returns {string} Command description.
     */
    toString(opts?: {
        includeCommandDataset?: boolean;
        includeDataset?: boolean;
    }): string;
    /**
     * Returns a readable string from message type.
     * @method
     * @private
     * @param {number} type - Command field type.
     * @returns {string} Readable string.
     */
    private _typeToString;
}
declare const Request_base: any;
export class Request extends Request_base {
    [x: string]: any;
    /**
     * Creates an instance of Request.
     * @constructor
     * @param {number} type - Command field type.
     * @param {string} affectedOrRequestedClassUid - Affected or requested SOP Class UID.
     * @param {boolean} hasDataset - Request has dataset.
     */
    constructor(type: number, affectedOrRequestedClassUid: string, hasDataset: boolean);
    /**
     * Gets affected SOP class UID.
     * @method
     * @returns {string} Affected SOP class UID.
     */
    getAffectedSopClassUid(): string;
    /**
     * Sets affected SOP class UID.
     * @method
     * @param {string} affectedSopClassUid - Affected SOP class UID.
     */
    setAffectedSopClassUid(affectedSopClassUid: string): void;
    /**
     * Gets requested SOP class UID.
     * @method
     * @returns {string} Requested SOP class UID.
     */
    getRequestedSopClassUid(): string;
    /**
     * Sets requested SOP class UID.
     * @method
     * @param {string} requestedSopClassUid - Requested SOP class UID.
     */
    setRequestedSopClassUid(requestedSopClassUid: string): void;
    /**
     * Gets affected SOP instance UID.
     * @method
     * @returns {string} Affected SOP instance UID.
     */
    getAffectedSopInstanceUid(): string;
    /**
     * Sets affected SOP instance UID.
     * @method
     * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
     */
    setAffectedSopInstanceUid(affectedSopInstanceUid: string): void;
    /**
     * Gets requested SOP instance UID.
     * @method
     * @returns {string} Requested SOP instance UID.
     */
    getRequestedSopInstanceUid(): string;
    /**
     * Sets requested SOP instance UID.
     * @method
     * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
     */
    setRequestedSopInstanceUid(requestedSopInstanceUid: string): void;
    /**
     * Gets request message ID.
     * @method
     * @return {number} Request message ID.
     */
    getMessageId(): number;
    /**
     * Sets request message ID.
     * @method
     * @param {number} messageId - Request message ID.
     */
    setMessageId(messageId: number): void;
    /**
     * Raise response event.
     * @method
     * @param {Response} response - Response.
     */
    raiseResponseEvent(response: Response): void;
    /**
     * Raise instance event.
     * Special event for datasets coming from C-GET operations,
     * as C-STORE requests.
     * @method
     * @param {Dataset} dataset - Dataset.
     */
    raiseInstanceEvent(dataset: Dataset): void;
    /**
     * Raise done event.
     * @method
     */
    raiseDoneEvent(): void;
    /**
     * Gets the request description.
     * @method
     * @param {Object} [opts] - Description generation options.
     * @param {boolean} [opts.includeCommandDataset] - Include command dataset in the description.
     * @param {boolean} [opts.includeDataset] - Include dataset in the description.
     * @return {string} Request description.
     */
    toString(opts?: {
        includeCommandDataset?: boolean;
        includeDataset?: boolean;
    }): string;
}
export class Response extends Command {
    /**
     * Creates an instance of Response.
     * @constructor
     * @param {number} type - Command field type.
     * @param {string} affectedOrRequestedClassUid - Affected or requested SOP Class UID.
     * @param {boolean} hasDataset - Response has dataset.
     * @param {number} status - Response status.
     * @param {string} errorComment - Response error comment.
     */
    constructor(type: number, affectedOrRequestedClassUid: string, hasDataset: boolean, status: number, errorComment: string);
    /**
     * Gets affected SOP class UID.
     * @method
     * @returns {string} Affected SOP class UID.
     */
    getAffectedSopClassUid(): string;
    /**
     * Sets affected SOP class UID.
     * @method
     * @param {string} affectedSopClassUid - Affected SOP class UID.
     */
    setAffectedSopClassUid(affectedSopClassUid: string): void;
    /**
     * Gets requested SOP class UID.
     * @method
     * @returns {string} Requested SOP class UID.
     */
    getRequestedSopClassUid(): string;
    /**
     * Sets requested SOP class UID.
     * @method
     * @param {string} requestedSopClassUid - Requested SOP class UID.
     */
    setRequestedSopClassUid(requestedSopClassUid: string): void;
    /**
     * Gets affected SOP instance UID.
     * @method
     * @returns {string} Affected SOP instance UID.
     */
    getAffectedSopInstanceUid(): string;
    /**
     * Sets affected SOP instance UID.
     * @method
     * @param {string} affectedSopInstanceUid - Affected SOP instance UID.
     */
    setAffectedSopInstanceUid(affectedSopInstanceUid: string): void;
    /**
     * Gets requested SOP instance UID.
     * @method
     * @returns {string} Requested SOP instance UID.
     */
    getRequestedSopInstanceUid(): string;
    /**
     * Sets requested SOP instance UID.
     * @method
     * @param {string} requestedSopInstanceUid - Requested SOP instance UID.
     */
    setRequestedSopInstanceUid(requestedSopInstanceUid: string): void;
    /**
     * Gets status.
     * @method
     * @returns {number} Status.
     */
    getStatus(): number;
    /**
     * Sets status.
     * @method
     * @param {number} status - Status.
     */
    setStatus(status: number): void;
    /**
     * Gets error comment.
     * @method
     * @returns {string} Error comment.
     */
    getErrorComment(): string;
    /**
     * Sets error comment.
     * @method
     * @param {string} errorComment - Error comment.
     */
    setErrorComment(errorComment: string): void;
    /**
     * Gets response message ID.
     * @method
     * @return {number} Response message ID.
     */
    getMessageIdBeingRespondedTo(): number;
    /**
     * Sets response message ID.
     * @method
     * @param {number} messageId - Response message ID.
     */
    setMessageIdBeingRespondedTo(messageId: number): void;
    /**
     * Returns a readable string from status.
     * @method
     * @private
     * @param {number} status - Status code.
     * @returns {string} Readable status string.
     */
    private _statusToString;
}
export class CEchoRequest extends Request {
    /**
     * Creates an instance of CEchoRequest.
     * @constructor
     */
    constructor();
}
export class CEchoResponse extends Response {
    /**
     * Creates a C-ECHO response from a request.
     * @method
     * @static
     * @param {CEchoRequest} request - C-ECHO request.
     * @returns {CEchoResponse} C-ECHO response.
     * @throws Error if request is not an instance of CEchoRequest.
     */
    static fromRequest(request: CEchoRequest): CEchoResponse;
    /**
     * Creates an instance of CEchoResponse.
     * @constructor
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(status: number, errorComment: string);
}
export class CFindRequest extends Request {
    /**
     * Creates study find request.
     * @method
     * @static
     * @param {Object} elements - Find request dataset elements.
     * @param {Priority} [priority] - Request priority.
     * @return {CFindRequest} Study find request.
     */
    static createStudyFindRequest(elements: any, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CFindRequest;
    /**
     * Creates series find request.
     * @method
     * @static
     * @param {Object} elements - Find request dataset elements.
     * @param {Priority} [priority] - Request priority.
     * @return {CFindRequest} Series find request.
     */
    static createSeriesFindRequest(elements: any, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CFindRequest;
    /**
     * Creates image find request.
     * @method
     * @static
     * @param {Object} elements - Find request dataset elements.
     * @param {Priority} [priority] - Request priority.
     * @return {CFindRequest} Image find request.
     */
    static createImageFindRequest(elements: any, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CFindRequest;
    /**
     * Creates worklist find request.
     * @method
     * @static
     * @param {Object} elements - Find request dataset elements.
     * @param {Priority} [priority] - Request priority.
     * @return {CFindRequest} Worklist find request.
     */
    static createWorklistFindRequest(elements: any, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CFindRequest;
    /**
     * Creates an instance of CFindRequest.
     * @constructor
     * @param {Priority} [priority] - Request priority.
     */
    constructor(priority?: {
        Low: number;
        Medium: number;
        High: number;
    });
    /**
     * Gets request priority.
     * @method
     * @return {Priority} Request priority.
     */
    getPriority(): {
        Low: number;
        Medium: number;
        High: number;
    };
    /**
     * Sets request priority.
     * @method
     * @param {Priority} priority - Request request priority.
     */
    setPriority(priority: {
        Low: number;
        Medium: number;
        High: number;
    }): void;
}
export class CFindResponse extends Response {
    /**
     * Creates a C-FIND response from a request.
     * @method
     * @static
     * @param {CFindRequest} request - C-FIND request.
     * @returns {CFindResponse} C-FIND response.
     * @throws Error if request is not an instance of CFindRequest.
     */
    static fromRequest(request: CFindRequest): CFindResponse;
    /**
     * Creates an instance of CEchoResponse.
     * @constructor
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(status: number, errorComment: string);
}
export class CStoreRequest extends Request {
    /**
     * Creates an instance of CStoreRequest.
     * @constructor
     * @param {Object|String} datasetOrFile - Dataset or part10 file path.
     * @param {Priority} [priority] - Request priority.
     */
    constructor(datasetOrFile: any | string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    });
    /**
     * Gets request priority.
     * @method
     * @return {Priority} Request priority.
     */
    getPriority(): {
        Low: number;
        Medium: number;
        High: number;
    };
    /**
     * Sets request priority.
     * @method
     * @param {Priority} priority - Request request priority.
     */
    setPriority(priority: {
        Low: number;
        Medium: number;
        High: number;
    }): void;
}
export class CStoreResponse extends Response {
    /**
     * Creates a C-STORE response from a request.
     * @method
     * @static
     * @param {CStoreRequest} request - C-STORE request.
     * @returns {CStoreResponse} C-STORE response.
     * @throws Error if request is not an instance of CStoreRequest.
     */
    static fromRequest(request: CStoreRequest): CStoreResponse;
    /**
     * Creates an instance of CStoreResponse.
     * @constructor
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(status: number, errorComment: string);
}
export class CMoveRequest extends Request {
    /**
     * Creates study move request.
     * @method
     * @static
     * @param {string} destinationAet - Move destination AET.
     * @param {string} studyInstanceUid - Study instance UID of the study to move.
     * @param {Priority} [priority] - Request priority.
     * @return {CMoveRequest} Study move request.
     */
    static createStudyMoveRequest(destinationAet: string, studyInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CMoveRequest;
    /**
     * Creates series move request.
     * @method
     * @static
     * @param {string} destinationAet - Move destination AET.
     * @param {string} studyInstanceUid - Study instance UID of the study to move.
     * @param {string} seriesInstanceUid - Series instance UID of the series to move.
     * @param {Priority} [priority] - Request priority.
     * @return {CMoveRequest} Series move request.
     */
    static createSeriesMoveRequest(destinationAet: string, studyInstanceUid: string, seriesInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CMoveRequest;
    /**
     * Creates image move request.
     * @method
     * @static
     * @param {string} destinationAet - Move destination AET.
     * @param {string} studyInstanceUid - Study instance UID of the study to move.
     * @param {string} seriesInstanceUid - Series instance UID of the series to move.
     * @param {string} sopInstanceUid - SOP instance UID of the series to move.
     * @param {Priority} [priority] - Request priority.
     * @return {CMoveRequest} Image move request.
     */
    static createImageMoveRequest(destinationAet: string, studyInstanceUid: string, seriesInstanceUid: string, sopInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CMoveRequest;
    /**
     * Creates an instance of CMoveRequest.
     * @constructor
     * @param {Priority} [priority] - Request priority.
     */
    constructor(priority?: {
        Low: number;
        Medium: number;
        High: number;
    });
    /**
     * Gets request priority.
     * @method
     * @return {Priority} Request priority.
     */
    getPriority(): {
        Low: number;
        Medium: number;
        High: number;
    };
    /**
     * Sets request priority.
     * @method
     * @param {Priority} priority - Request request priority.
     */
    setPriority(priority: {
        Low: number;
        Medium: number;
        High: number;
    }): void;
}
export class CMoveResponse extends Response {
    /**
     * Creates a C-MOVE response from a request.
     * @method
     * @static
     * @param {CMoveRequest} request - C-MOVE request.
     * @returns {CMoveResponse} C-MOVE response.
     * @throws Error if request is not an instance of CMoveRequest.
     */
    static fromRequest(request: CMoveRequest): CMoveResponse;
    /**
     * Creates an instance of CMoveResponse.
     * @constructor
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(status: number, errorComment: string);
    /**
     * Gets remaining sub operations.
     * @method
     * @returns {number} Remaining sub operations.
     */
    getRemaining(): number;
    /**
     * Gets completed sub operations.
     * @method
     * @returns {number} Completed sub operations.
     */
    getCompleted(): number;
    /**
     * Gets sub operations with warnings.
     * @method
     * @returns {number} Sub operations with warnings.
     */
    getWarnings(): number;
    /**
     * Gets failed sub operations.
     * @method
     * @returns {number} Failed sub operations.
     */
    getFailures(): number;
}
export class CGetRequest extends Request {
    /**
     * Creates study get request.
     * @method
     * @static
     * @param {string} studyInstanceUid - Study instance UID of the study to get.
     * @param {Priority} [priority] - Request priority.
     * @return {CGetRequest} Study get request.
     */
    static createStudyGetRequest(studyInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CGetRequest;
    /**
     * Creates series get request.
     * @method
     * @static
     * @param {string} studyInstanceUid - Study instance UID of the study to get.
     * @param {string} seriesInstanceUid - Series instance UID of the series to get.
     * @param {Priority} [priority] - Request priority.
     * @return {CGetRequest} Series get request.
     */
    static createSeriesGetRequest(studyInstanceUid: string, seriesInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CGetRequest;
    /**
     * Creates image get request.
     * @method
     * @static
     * @param {string} studyInstanceUid - Study instance UID of the study to get.
     * @param {string} seriesInstanceUid - Series instance UID of the series to get.
     * @param {string} sopInstanceUid - SOP instance UID of the series to get.
     * @param {Priority} [priority] - Request priority.
     * @return {CGetRequest} Image get request.
     */
    static createImageGetRequest(studyInstanceUid: string, seriesInstanceUid: string, sopInstanceUid: string, priority?: {
        Low: number;
        Medium: number;
        High: number;
    }): CGetRequest;
    /**
     * Creates an instance of CGetRequest.
     * @constructor
     * @param {Priority} [priority] - Request priority.
     */
    constructor(priority?: {
        Low: number;
        Medium: number;
        High: number;
    });
    /**
     * Gets request priority.
     * @method
     * @return {Priority} Request priority.
     */
    getPriority(): {
        Low: number;
        Medium: number;
        High: number;
    };
    /**
     * Sets request priority.
     * @method
     * @param {Priority} priority - Request request priority.
     */
    setPriority(priority: {
        Low: number;
        Medium: number;
        High: number;
    }): void;
}
export class CGetResponse extends Response {
    /**
     * Creates a C-GET response from a request.
     * @method
     * @static
     * @param {CGetRequest} request - C-GET request.
     * @returns {CGetResponse} C-GET response.
     * @throws Error if request is not an instance of CGetRequest.
     */
    static fromRequest(request: CGetRequest): CGetResponse;
    /**
     * Creates an instance of CGetResponse.
     * @constructor
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(status: number, errorComment: string);
    /**
     * Gets remaining sub operations.
     * @method
     * @returns {number} Remaining sub operations.
     */
    getRemaining(): number;
    /**
     * Gets completed sub operations.
     * @method
     * @returns {number} Completed sub operations.
     */
    getCompleted(): number;
    /**
     * Gets sub operations with warnings.
     * @method
     * @returns {number} Sub operations with warnings.
     */
    getWarnings(): number;
    /**
     * Gets failed sub operations.
     * @method
     * @returns {number} Failed sub operations.
     */
    getFailures(): number;
}
export class NCreateRequest extends Request {
    /**
     * Creates an instance of NCreateRequest.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string);
}
export class NCreateResponse extends Response {
    /**
     * Creates an N-CREATE response from a request.
     * @method
     * @static
     * @param {NCreateRequest} request - N-CREATE request.
     * @returns {NCreateResponse} N-CREATE response.
     * @throws Error if request is not an instance of NCreateRequest.
     */
    static fromRequest(request: NCreateRequest): NCreateResponse;
    /**
     * Creates an instance of NCreateResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, status: number, errorComment: string);
}
export class NActionRequest extends Request {
    /**
     * Creates an instance of NActionRequest.
     * @constructor
     * @param {string} requestedSopClassUid - Requested SOP Class UID.
     * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
     * @param {number} actionTypeId - Action type ID.
     */
    constructor(requestedSopClassUid: string, requestedSopInstanceUid: string, actionTypeId: number);
    /**
     * Gets action type ID.
     * @method
     * @return {number} Action type ID.
     */
    getActionTypeId(): number;
    /**
     * Sets action type ID.
     * @method
     * @param {number} actionTypeId - Action type ID.
     */
    setActionTypeId(actionTypeId: number): void;
}
export class NActionResponse extends Response {
    /**
     * Creates an N-ACTION response from a request.
     * @method
     * @static
     * @param {NActionRequest} request - N-ACTION request.
     * @returns {NActionResponse} N-ACTION response.
     * @throws Error if request is not an instance of NActionRequest.
     */
    static fromRequest(request: NActionRequest): NActionResponse;
    /**
     * Creates an instance of NActionResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} actionTypeId - Action type ID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, actionTypeId: number, status: number, errorComment: string);
    /**
     * Gets action type ID.
     * @method
     * @return {number} Action type ID.
     */
    getActionTypeId(): number;
    /**
     * Sets action type ID.
     * @method
     * @param {number} actionTypeId - Action type ID.
     */
    setActionTypeId(actionTypeId: number): void;
}
export class NDeleteRequest extends Request {
    /**
     * Creates an instance of NDeleteRequest.
     * @constructor
     * @param {string} requestedSopClassUid - Requested SOP Class UID.
     * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
     */
    constructor(requestedSopClassUid: string, requestedSopInstanceUid: string);
}
export class NDeleteResponse extends Response {
    /**
     * Creates an N-DELETE response from a request.
     * @method
     * @static
     * @param {NDeleteRequest} request - N-DELETE request.
     * @returns {NDeleteResponse} N-DELETE response.
     * @throws Error if request is not an instance of NDeleteRequest.
     */
    static fromRequest(request: NDeleteRequest): NDeleteResponse;
    /**
     * Creates an instance of NDeleteResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, status: number, errorComment: string);
}
export class NEventReportRequest extends Request {
    /**
     * Creates an instance of NEventReportRequest.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} eventTypeID - Event type ID.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, eventTypeID: number);
    /**
     * Gets event type ID.
     * @method
     * @return {number} Event type ID.
     */
    getEventTypeId(): number;
    /**
     * Sets event type ID.
     * @method
     * @param {number} actionTypeId - Event type ID.
     */
    setEventTypeId(eventTypeId: any): void;
}
export class NEventReportResponse extends Response {
    /**
     * Creates an N-EVENT-REPORT response from a request.
     * @method
     * @static
     * @param {NEventReportRequest} request - N-EVENT-REPORT request.
     * @returns {NEventReportResponse} N-EVENT-REPORT response.
     * @throws Error if request is not an instance of NEventReportRequest.
     */
    static fromRequest(request: NEventReportRequest): NEventReportResponse;
    /**
     * Creates an instance of NEventReportResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} eventTypeID - Event type ID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, eventTypeID: number, status: number, errorComment: string);
    /**
     * Gets event type ID.
     * @method
     * @return {number} Event type ID.
     */
    getEventTypeId(): number;
    /**
     * Sets event type ID.
     * @method
     * @param {number} actionTypeId - Event type ID.
     */
    setEventTypeId(eventTypeId: any): void;
}
export class NGetRequest extends Request {
    /**
     * Creates an instance of NGetRequest.
     * @constructor
     * @param {string} requestedSopClassUid - Requested SOP Class UID.
     * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
     * @param {Array<string>} attributeIdentifierList - The requested attributes identifier list.
     */
    constructor(requestedSopClassUid: string, requestedSopInstanceUid: string, attributeIdentifierList: Array<string>);
    /**
     * Gets requested attributes identifier list.
     * @method
     * @return {Array<string>} The requested attributes identifier list.
     */
    getAttributeIdentifierList(): Array<string>;
    /**
     * Sets requested attributes identifier list.
     * @method
     * @param {Array<string>} attributeIdentifierList - The requested attributes identifier list.
     */
    setAttributeIdentifierList(attributeIdentifierList: Array<string>): void;
    /**
     * Returns a padded hexadecimal string.
     * @method
     * @private
     * @param {number} num - Number to convert to hex string.
     * @param {number} length - Number of resulting characters.
     * @returns {string} Padded hexadecimal string.
     */
    private _getPaddedHexString;
}
export class NGetResponse extends Response {
    /**
     * Creates an N-GET response from a request.
     * @method
     * @static
     * @param {NGetRequest} request - N-GET request.
     * @returns {NGetResponse} N-GET response.
     * @throws Error if request is not an instance of NGetRequest.
     */
    static fromRequest(request: NGetRequest): NGetResponse;
    /**
     * Creates an instance of NEventReportResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, status: number, errorComment: string);
}
export class NSetRequest extends Request {
    /**
     * Creates an instance of NSetRequest.
     * @constructor
     * @param {string} requestedSopClassUid - Requested SOP Class UID.
     * @param {string} requestedSopInstanceUid - Requested SOP Instance UID.
     */
    constructor(requestedSopClassUid: string, requestedSopInstanceUid: string);
}
export class NSetResponse extends Response {
    /**
     * Creates an N-SET response from a request.
     * @method
     * @static
     * @param {NSetRequest} request - N-SET request.
     * @returns {NSetResponse} N-SET response.
     * @throws Error if request is not an instance of NSetRequest.
     */
    static fromRequest(request: NSetRequest): NSetResponse;
    /**
     * Creates an instance of NEventReportResponse.
     * @constructor
     * @param {string} affectedSopClassUid - Affected SOP Class UID.
     * @param {string} affectedSopInstanceUid - Affected SOP Instance UID.
     * @param {number} status - Response status.
     * @param {string} errorComment - Error comment.
     */
    constructor(affectedSopClassUid: string, affectedSopInstanceUid: string, status: number, errorComment: string);
}
import Dataset = require("./Dataset");
export {};
