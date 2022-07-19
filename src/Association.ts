import { CStoreRequest, CGetRequest, Request } from './Command';
import {
  CommandFieldType,
  PresentationContextResult,
  Uid,
  SopClass,
  StorageClass,
  TransferSyntax,
} from './Constants';
import Implementation from './Implementation';

//#region PresentationContext
class PresentationContext {
  pcId: number;
  abstractSyntaxUid: string;
  transferSyntaxes: string[];
  result: number;

  /**
   * Creates an instance of PresentationContext.
   * @constructor
   * @param {number} pcId - Presentation context ID.
   * @param {string} abstractSyntaxUid - Abstract syntax UID.
   * @param {string} [transferSyntaxUid] - Transfer syntax UID.
   * @param {number} [result] - Presentation context result.
   */
  constructor(
    pcId: number,
    abstractSyntaxUid: string,
    transferSyntaxUid?: string,
    result?: number
  ) {
    this.pcId = pcId;
    this.abstractSyntaxUid = abstractSyntaxUid;
    this.transferSyntaxes = [];
    if (transferSyntaxUid) {
      this.transferSyntaxes.push(transferSyntaxUid);
    }
    this.result = result || PresentationContextResult.Proposed;
  }

  /**
   * Gets presentation context ID.
   * @method
   * @returns {number} Presentation context ID.
   */
  getPresentationContextId(): number {
    return this.pcId;
  }

  /**
   * Gets abstract syntax UID.
   * @method
   * @returns {string} Abstract syntax UID.
   */
  getAbstractSyntaxUid(): string {
    return this.abstractSyntaxUid;
  }

  /**
   * Gets transfer syntax UIDs.
   * @method
   * @returns {Array<string>} Transfer syntax UIDs.
   */
  getTransferSyntaxUids(): Array<string> {
    return this.transferSyntaxes;
  }

  /**
   * Add transfer syntax UID.
   * @method
   * @param {string} transferSyntaxUid - Transfer syntax UID.
   */
  addTransferSyntaxUid(transferSyntaxUid: string) {
    if (this.transferSyntaxes.includes(transferSyntaxUid)) {
      return;
    }
    this.transferSyntaxes.push(transferSyntaxUid);
  }

  /**
   * Removes transfer syntax UID.
   * @method
   * @param {string} transferSyntaxUid - Transfer syntax UID.
   */
  removeTransferSyntaxUid(transferSyntaxUid: string) {
    if (!this.transferSyntaxes.includes(transferSyntaxUid)) {
      return;
    }
    const index = this.transferSyntaxes.indexOf(transferSyntaxUid);
    if (index === -1) {
      return;
    }
    this.transferSyntaxes.splice(index, 1);
  }

  /**
   * Checks if transfer syntax UID is present.
   * @method
   * @param {string} transferSyntaxUid - Transfer syntax UID.
   * @returns {boolean} Whether transfer syntax UID is present.
   */
  hasTransferSyntaxUid(transferSyntaxUid: string): boolean {
    return this.transferSyntaxes.includes(transferSyntaxUid);
  }

  /**
   * Gets the accepted transfer syntax UID.
   * @method
   * @returns {string} Transfer syntax UID.
   */
  getAcceptedTransferSyntaxUid(): string {
    return this.transferSyntaxes.length > 0 ? this.transferSyntaxes[0] : undefined;
  }

  /**
   * Gets the presentation context result.
   * @method
   * @returns {number} Result.
   */
  getResult(): number {
    return this.result;
  }

  /**
   * Sets the presentation context result.
   * @method
   * @param {number} result - Result.
   * @param {string} [acceptedTransferSyntaxUid] - Accepted transfer syntax UID.
   */
  setResult(result: number, acceptedTransferSyntaxUid?: string) {
    this.result = result;
    const transferSyntaxes = [...this.transferSyntaxes];
    this.transferSyntaxes.length = 0;

    if (acceptedTransferSyntaxUid) {
      this.transferSyntaxes.push(acceptedTransferSyntaxUid);
    } else {
      if (transferSyntaxes.length > 0) {
        this.transferSyntaxes.push(transferSyntaxes[0]);
      }
    }
  }

  /**
   * Gets the presentation context result description.
   * @method
   * @returns {string} Presentation context result description.
   */
  getResultDescription(): string {
    switch (this.result) {
      case PresentationContextResult.Accept:
        return 'Accept';
      case PresentationContextResult.Proposed:
        return 'Proposed';
      case PresentationContextResult.RejectAbstractSyntaxNotSupported:
        return 'Reject - Abstract Syntax Not Supported';
      case PresentationContextResult.RejectNoReason:
        return 'Reject - No Reason';
      case PresentationContextResult.RejectTransferSyntaxesNotSupported:
        return 'Reject - Transfer Syntaxes Not Supported';
      case PresentationContextResult.RejectUser:
        return 'Reject - User';
      default:
        return 'Unknown';
    }
  }
}
//#endregion

//#region Association
class Association {
  presentationContexts: Array<{ id: number; context: PresentationContext }>;
  callingAeTitle: string;
  calledAeTitle: string;
  maxPduLength: number;
  implementationClassUid: string;
  applicationContextName: string;
  implementationVersion: string;

  /**
   * Creates an instance of Association.
   * @constructor
   * @param {string} [callingAeTitle] - Local AE title.
   * @param {string} [calledAeTitle] - Remote AE title.
   */
  constructor(callingAeTitle?: string, calledAeTitle?: string) {
    this.callingAeTitle = callingAeTitle;
    this.calledAeTitle = calledAeTitle;
    this.maxPduLength = Implementation.getMaxPduLength();
    this.applicationContextName = Uid.ApplicationContextName;
    this.implementationClassUid = Implementation.getImplementationClassUid();
    this.implementationVersion = Implementation.getImplementationVersion();
    this.presentationContexts = [];
  }

  /**
   * Gets the calling AE title.
   * @method
   * @returns {string} Calling AE title.
   */
  getCallingAeTitle(): string {
    return this.callingAeTitle;
  }

  /**
   * Sets the calling AE title.
   * @method
   * @param {string} aet - Calling AE title.
   */
  setCallingAeTitle(aet: string) {
    this.callingAeTitle = aet;
  }

  /**
   * Gets the called AE title.
   * @method
   * @returns {string} Called AE title.
   */
  getCalledAeTitle(): string {
    return this.calledAeTitle;
  }

  /**
   * Sets the called AE title.
   * @method
   * @param {string} aet - Called AE title.
   */
  setCalledAeTitle(aet: string) {
    this.calledAeTitle = aet;
  }

  /**
   * Gets maximum PDU length.
   * @method
   * @returns {number} Maximum PDU length.
   */
  getMaxPduLength(): number {
    return this.maxPduLength;
  }

  /**
   * Sets maximum PDU length.
   * @method
   * @param {number} maxPduLength - Maximum PDU length.
   */
  setMaxPduLength(maxPduLength: number) {
    this.maxPduLength = maxPduLength;
  }

  /**
   * Gets the application context name.
   * @method
   * @returns {string} Application context name.
   */
  getApplicationContextName(): string {
    return this.applicationContextName;
  }

  /**
   * Gets the implementation class UID.
   * @method
   * @returns {string} Implementation class UID.
   */
  getImplementationClassUid(): string {
    return this.implementationClassUid;
  }

  /**
   * Sets the implementation class UID.
   * @method
   * @param {string} uid - Implementation class UID.
   */
  setImplementationClassUid(uid: string) {
    this.implementationClassUid = uid;
  }

  /**
   * Gets the implementation version.
   * @method
   * @returns {string} Implementation version.
   */
  getImplementationVersion(): string {
    return this.implementationVersion;
  }

  /**
   * Sets the implementation version.
   * @method
   * @param {string} version - Implementation version.
   */
  setImplementationVersion(version: string) {
    this.implementationVersion = version;
  }

  /**
   * Adds presentation context to association.
   * @method
   * @param {string} abstractSyntaxUid - Abstract Syntax UID.
   * @param {number} [presentationContextId] - Presentation context ID.
   * @returns {number} Presentation context ID.
   */
  addPresentationContext(abstractSyntaxUid: string, presentationContextId?: number): number {
    let pcId = presentationContextId || 1;
    this.presentationContexts.forEach((pc) => {
      const id = pc.id;
      if (id >= pcId) {
        pcId = id + 2;
      }
    });
    this.presentationContexts.push({
      id: pcId,
      context: new PresentationContext(pcId, abstractSyntaxUid),
    });

    return pcId;
  }

  /**
   * Adds presentation context to association if not exists.
   * @method
   * @param {string} abstractSyntaxUid - Abstract Syntax UID.
   * @returns {number} Presentation context ID.
   */
  addOrGetPresentationContext(abstractSyntaxUid: string): number {
    const presentationContexts = this.getPresentationContexts();
    for (let i = 0; i < presentationContexts.length; i++) {
      const ctx = presentationContexts[i];
      if (ctx.context.getAbstractSyntaxUid() === abstractSyntaxUid) {
        return ctx.context.getPresentationContextId();
      }
    }

    return this.addPresentationContext(abstractSyntaxUid);
  }

  /**
   * Adds transfer syntax to presentation context.
   * @method
   * @param {number} pcId - Presentation context ID.
   * @param {string} transferSyntaxUid - Transfer Syntax UID.
   */
  addTransferSyntaxToPresentationContext(pcId: number, transferSyntaxUid: string) {
    const context = this.getPresentationContext(pcId);
    context.addTransferSyntaxUid(transferSyntaxUid);
  }

  /**
   * Finds presentation context.
   * @method
   * @param {string} abstractSyntaxUid - Abstract Syntax UID.
   * @param {string} transferSyntaxUid - Transfer Syntax UID.
   * @returns {number|undefined} Presentation context ID, if found.
   */
  findPresentationContextByAbstractSyntaxAndTransferSyntax(
    abstractSyntaxUid: string,
    transferSyntaxUid: string
  ): number | undefined {
    const presentationContexts = this.getPresentationContexts();
    for (let i = 0; i < presentationContexts.length; i++) {
      const ctx = presentationContexts[i];
      if (
        ctx.context.getAbstractSyntaxUid() === abstractSyntaxUid &&
        ctx.context.hasTransferSyntaxUid(transferSyntaxUid)
      ) {
        return ctx.context.getPresentationContextId();
      }
    }
  }

  /**
   * Gets presentation context.
   * @method
   * @param {number} pcId - Presentation context ID.
   * @returns {PresentationContext} Presentation context.
   * @throws Error if presentation context ID is not found within the presentation contexts collection.
   */
  getPresentationContext(pcId: number): PresentationContext {
    const presentationContext = this.presentationContexts.find((p) => p.id === pcId);
    if (!presentationContext) {
      throw new Error(`Invalid presentation context ID: ${pcId}`);
    }

    return presentationContext.context;
  }

  /**
   * Gets presentation contexts.
   * @method
   * @returns {Array<{id: number, context: PresentationContext}>} Presentation contexts.
   */
  getPresentationContexts(): Array<{ id: number; context: PresentationContext }> {
    return this.presentationContexts;
  }

  /**
   * Adds presentation context from request.
   * @method
   * @param {Request} request - Request.
   * @param {Array<TransferSyntax>} [transferSyntaxes] - Transfer syntax UIDs to propose.
   * @returns {number} Presentation context ID.
   */
  addPresentationContextFromRequest(
    request: Request,
    transferSyntaxes?: Array<TransferSyntax>
  ): number {
    let syntaxes = transferSyntaxes || [TransferSyntax.ImplicitVRLittleEndian];
    syntaxes = Array.isArray(syntaxes) ? syntaxes : [syntaxes];

    const sopClassUid = this._sopClassFromRequest(request);
    let pcId = undefined;

    if (request instanceof CStoreRequest) {
      pcId = this.addOrGetPresentationContext(sopClassUid);
      syntaxes.forEach((syntax) => {
        this.addTransferSyntaxToPresentationContext(pcId, syntax);
      });

      // Add an extra presentation context with any encapsulated transfer syntax
      // to allow bit-stream.
      const dataset = request.getDataset();
      const transferSyntaxUid = dataset.getTransferSyntaxUid();
      if (
        transferSyntaxUid !== TransferSyntax.ImplicitVRLittleEndian &&
        transferSyntaxUid !== TransferSyntax.ExplicitVRLittleEndian
      ) {
        pcId = this.findPresentationContextByAbstractSyntaxAndTransferSyntax(
          sopClassUid,
          transferSyntaxUid
        );
        if (pcId === undefined) {
          pcId = this.addPresentationContext(sopClassUid);
          this.addTransferSyntaxToPresentationContext(pcId, transferSyntaxUid);
        }
      }
    } else if (request instanceof CGetRequest) {
      pcId = this.addOrGetPresentationContext(sopClassUid);
      syntaxes.forEach((syntax) => {
        this.addTransferSyntaxToPresentationContext(pcId, syntax);
      });
      Object.keys(StorageClass).forEach((uid) => {
        const storageClassUid = StorageClass[uid];
        const storagePcId = this.addOrGetPresentationContext(storageClassUid);
        syntaxes.forEach((syntax) => {
          this.addTransferSyntaxToPresentationContext(storagePcId, syntax);
        });
      });
    } else {
      pcId = this.addOrGetPresentationContext(sopClassUid);
      syntaxes.forEach((syntax) => {
        this.addTransferSyntaxToPresentationContext(pcId, syntax);
      });
    }

    return pcId;
  }

  /**
   * Gets accepted presentation context from request.
   * @method
   * @return {PresentationContext} Presentation context.
   */
  getAcceptedPresentationContextFromRequest(request): PresentationContext {
    let acceptedContext = undefined;
    const contexts = this.getPresentationContexts();

    // Look for a presentation context which is an exact match for this request's transfer syntax
    if (request.getDataset()) {
      contexts.forEach((pc) => {
        const context = this.getPresentationContext(pc.id);
        if (
          context.getAbstractSyntaxUid() === this._sopClassFromRequest(request) &&
          context.getAcceptedTransferSyntaxUid() === request.getDataset().getTransferSyntaxUid() &&
          context.getResult() === PresentationContextResult.Accept
        ) {
          acceptedContext = context;
        }
      });
    }

    // If there was no exact transfer syntax match then look for a match based just on the abstract syntax
    if (acceptedContext === undefined) {
      contexts.forEach((pc) => {
        const context = this.getPresentationContext(pc.id);
        if (
          context.getAbstractSyntaxUid() === this._sopClassFromRequest(request) &&
          context.getResult() === PresentationContextResult.Accept
        ) {
          acceptedContext = context;
        }
      });
    }

    return acceptedContext;
  }

  /**
   * Gets the association description.
   * @method
   * @return {string} Association description.
   */
  toString(): string {
    const str = [];
    str.push(`Application Context:     ${this.applicationContextName}`);
    str.push(`Implementation Class:    ${this.implementationClassUid}`);
    str.push(`Implementation Version:  ${this.implementationVersion}`);
    str.push(`Maximum PDU Length:      ${this.maxPduLength}`);
    str.push(`Called AE Title:         ${this.calledAeTitle}`);
    str.push(`Calling AE Title:        ${this.callingAeTitle}`);
    str.push(`Presentation Contexts:   ${this.presentationContexts.length}`);
    this.presentationContexts.forEach((pc) => {
      const context = this.getPresentationContext(pc.id);
      str.push(`  Presentation Context:  ${pc.id} [${context.getResultDescription()}]`);
      str.push(
        `      Abstract:  ${
          this._uidNameFromValue([SopClass, StorageClass], context.getAbstractSyntaxUid()) ||
          context.getAbstractSyntaxUid()
        }`
      );

      const syntaxes = context.getTransferSyntaxUids();
      syntaxes.forEach((tx) => {
        str.push(`      Transfer:  ${this._uidNameFromValue(TransferSyntax, tx) || tx}`);
      });
    });
    str.push('');

    return str.join('\n');
  }

  //#region Private Methods
  /**
   * Gets UID name from UID value.
   * @method
   * @private
   * @param {Object|Array} uids - UID object(s).
   * @param {string} uid - UID value.
   * @returns {string} UID name.
   */
  _uidNameFromValue(uids: object | Array<any>, uid: string): string {
    const mergedUids = Array.isArray(uids) ? Object.assign({}, ...uids) : uids;
    return Object.keys(mergedUids).find((key) => mergedUids[key] === uid);
  }

  /**
   * Gets SOP class UID based on the request type.
   * @method
   * @private
   * @param {Request} request - Request.
   * @returns {string} SOP class UID.
   */
  _sopClassFromRequest(request: Request): string {
    switch (request.getCommandFieldType()) {
      case CommandFieldType.NGetRequest:
      case CommandFieldType.NSetRequest:
      case CommandFieldType.NActionRequest:
      case CommandFieldType.NDeleteRequest:
        return request.getRequestedSopClassUid();
      case CommandFieldType.CStoreRequest:
      case CommandFieldType.CFindRequest:
      case CommandFieldType.CGetRequest:
      case CommandFieldType.CMoveRequest:
      case CommandFieldType.CEchoRequest:
      case CommandFieldType.NEventReportRequest:
      case CommandFieldType.NCreateRequest:
        return request.getAffectedSopClassUid();
      default:
        return request.getAffectedSopClassUid();
    }
  }
  //#endregion
}
//#endregion

//#region Exports
export { PresentationContext, Association };
//#endregion
