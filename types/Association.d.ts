export class PresentationContext {
    /**
     * Creates an instance of PresentationContext.
     * @constructor
     * @param {number} pcId - Presentation context ID.
     * @param {string} abstractSyntaxUid - Abstract syntax UID.
     * @param {string} [transferSyntaxUid] - Transfer syntax UID.
     * @param {number} [result] - Presentation context result.
     */
    constructor(pcId: number, abstractSyntaxUid: string, transferSyntaxUid?: string, result?: number);
    pcId: number;
    abstractSyntaxUid: string;
    transferSyntaxes: string[];
    result: number;
    /**
     * Gets presentation context ID.
     * @method
     * @returns {number} Presentation context ID.
     */
    getPresentationContextId(): number;
    /**
     * Gets abstract syntax UID.
     * @method
     * @returns {string} Abstract syntax UID.
     */
    getAbstractSyntaxUid(): string;
    /**
     * Gets transfer syntax UIDs.
     * @method
     * @returns {Array<string>} Transfer syntax UIDs.
     */
    getTransferSyntaxUids(): Array<string>;
    /**
     * Add transfer syntax UID.
     * @method
     * @param {string} transferSyntaxUid - Transfer syntax UID.
     */
    addTransferSyntaxUid(transferSyntaxUid: string): void;
    /**
     * Removes transfer syntax UID.
     * @method
     * @param {string} transferSyntaxUid - Transfer syntax UID.
     */
    removeTransferSyntaxUid(transferSyntaxUid: string): void;
    /**
     * Checks if transfer syntax UID is present.
     * @method
     * @param {string} transferSyntaxUid - Transfer syntax UID.
     * @returns {boolean} Whether transfer syntax UID is present.
     */
    hasTransferSyntaxUid(transferSyntaxUid: string): boolean;
    /**
     * Gets the accepted transfer syntax UID.
     * @method
     * @returns {string} Transfer syntax UID.
     */
    getAcceptedTransferSyntaxUid(): string;
    /**
     * Gets the presentation context result.
     * @method
     * @returns {number} Result.
     */
    getResult(): number;
    /**
     * Sets the presentation context result.
     * @method
     * @param {number} result - Result.
     * @param {string} acceptedTransferSyntaxUid - Accepted transfer syntax UID.
     */
    setResult(result: number, acceptedTransferSyntaxUid: string): void;
    /**
     * Gets the presentation context result description.
     * @method
     * @returns {string} Presentation context result description.
     */
    getResultDescription(): string;
}
export class Association {
    /**
     * Creates an instance of Association.
     * @constructor
     * @param {string} callingAeTitle - Local AE title.
     * @param {string} calledAeTitle - Remote AE title.
     */
    constructor(callingAeTitle: string, calledAeTitle: string);
    callingAeTitle: string;
    calledAeTitle: string;
    maxPduLength: number;
    applicationContextName: string;
    implementationClassUid: string;
    implementationVersion: string;
    presentationContexts: { id: number, context: PresentationContext }[];
    /**
     * Gets the calling AE title.
     * @method
     * @returns {string} Calling AE title.
     */
    getCallingAeTitle(): string;
    /**
     * Sets the calling AE title.
     * @method
     * @param {string} aet - Calling AE title.
     */
    setCallingAeTitle(aet: string): void;
    /**
     * Gets the called AE title.
     * @method
     * @returns {string} Called AE title.
     */
    getCalledAeTitle(): string;
    /**
     * Sets the called AE title.
     * @method
     * @param {string} aet - Called AE title.
     */
    setCalledAeTitle(aet: string): void;
    /**
     * Gets maximum PDU length.
     * @method
     * @returns {number} Maximum PDU length.
     */
    getMaxPduLength(): number;
    /**
     * Sets maximum PDU length.
     * @method
     * @param {number} maxPduLength - Maximum PDU length.
     */
    setMaxPduLength(maxPduLength: number): void;
    /**
     * Gets the application context name.
     * @method
     * @returns {string} Application context name.
     */
    getApplicationContextName(): string;
    /**
     * Gets the implementation class UID.
     * @method
     * @returns {string} Implementation class UID.
     */
    getImplementationClassUid(): string;
    /**
     * Sets the implementation class UID.
     * @method
     * @param {string} uid - Implementation class UID.
     */
    setImplementationClassUid(uid: string): void;
    /**
     * Gets the implementation version.
     * @method
     * @returns {string} Implementation version.
     */
    getImplementationVersion(): string;
    /**
     * Sets the implementation version.
     * @method
     * @param {string} version - Implementation version.
     */
    setImplementationVersion(version: string): void;
    /**
     * Adds presentation context to association.
     * @method
     * @param {string} abstractSyntaxUid - Abstract Syntax UID.
     * @param {number} [presentationContextId] - Presentation context ID.
     * @returns {number} Presentation context ID.
     */
    addPresentationContext(abstractSyntaxUid: string, presentationContextId?: number): number;
    /**
     * Adds presentation context to association if not exists.
     * @method
     * @param {string} abstractSyntaxUid - Abstract Syntax UID.
     * @returns {number} Presentation context ID.
     */
    addOrGetPresentationContext(abstractSyntaxUid: string): number;
    /**
     * Adds transfer syntax to presentation context.
     * @method
     * @param {number} pcId - Presentation context ID.
     * @param {string} transferSyntaxUid - Transfer Syntax UID.
     */
    addTransferSyntaxToPresentationContext(pcId: number, transferSyntaxUid: string): void;
    /**
     * Finds presentation context.
     * @method
     * @param {string} abstractSyntaxUid - Abstract Syntax UID.
     * @param {string} transferSyntaxUid - Transfer Syntax UID.
     * @returns {number|undefined} Presentation context ID, if found.
     */
    findPresentationContextByAbstractSyntaxAndTransferSyntax(abstractSyntaxUid: string, transferSyntaxUid: string): number | undefined;
    /**
     * Gets presentation context.
     * @method
     * @param {number} pcId - Presentation context ID.
     * @returns {PresentationContext} Presentation context.
     * @throws Error if presentation context ID is not found within the presentation contexts collection.
     */
    getPresentationContext(pcId: number): PresentationContext;
    /**
     * Gets presentation contexts.
     * @method
     * @returns {Array<{id: number, context: PresentationContext}>} Presentation contexts.
     */
    getPresentationContexts(): Array<{
        id: number;
        context: PresentationContext;
    }>;
    /**
     * Adds presentation context from request.
     * @method
     * @param {Request} request - Request.
     * @param {Array<TransferSyntax>} [transferSyntaxes] - Transfer syntax UIDs to propose.
     * @returns {number} Presentation context ID.
     */
    addPresentationContextFromRequest(request: Request, transferSyntaxes?: Array<{
        ImplicitVRLittleEndian: string;
        ExplicitVRLittleEndian: string;
        DeflatedExplicitVRLittleEndian: string;
        ExplicitVRBigEndian: string;
        RleLossless: string;
        JpegBaseline: string;
        JpegLossless: string;
        JpegLsLossless: string;
        JpegLsLossy: string;
        Jpeg2000Lossless: string;
        Jpeg2000Lossy: string;
    }>): number;
    /**
     * Gets accepted presentation context from request.
     * @method
     * @return {PresentationContext} Presentation context.
     */
    getAcceptedPresentationContextFromRequest(request: any): PresentationContext;
    /**
     * Gets the association description.
     * @method
     * @return {string} Association description.
     */
    toString(): string;
    /**
     * Gets UID name from UID value.
     * @method
     * @private
     * @param {Object|Array} uids - UID object(s).
     * @param {string} uid - UID value.
     * @returns {string} UID name.
     */
    private _uidNameFromValue;
    /**
     * Gets SOP class UID based on the request type.
     * @method
     * @private
     * @param {Request} request - Request.
     * @returns {string} SOP class UID.
     */
    private _sopClassFromRequest;
}
