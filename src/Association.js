const { CGetRequest, CStoreRequest } = require('./Command');
const {
  CommandFieldType,
  PresentationContextResult,
  SopClass,
  StorageClass,
  TransferSyntax,
  Uid,
  UserIdentityType,
} = require('./Constants');
const Implementation = require('./Implementation');

const { EOL } = require('os');

//#region PresentationContext
class PresentationContext {
  /**
   * Creates an instance of PresentationContext.
   * @constructor
   * @param {number} pcId - Presentation context ID.
   * @param {string} abstractSyntaxUid - Abstract syntax UID.
   * @param {string} [transferSyntaxUid] - Transfer syntax UID.
   * @param {number} [result] - Presentation context result.
   */
  constructor(pcId, abstractSyntaxUid, transferSyntaxUid, result) {
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
  getPresentationContextId() {
    return this.pcId;
  }

  /**
   * Gets abstract syntax UID.
   * @method
   * @returns {string} Abstract syntax UID.
   */
  getAbstractSyntaxUid() {
    return this.abstractSyntaxUid;
  }

  /**
   * Gets transfer syntax UIDs.
   * @method
   * @returns {Array<string>} Transfer syntax UIDs.
   */
  getTransferSyntaxUids() {
    return this.transferSyntaxes;
  }

  /**
   * Add transfer syntax UID.
   * @method
   * @param {string} transferSyntaxUid - Transfer syntax UID.
   */
  addTransferSyntaxUid(transferSyntaxUid) {
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
  removeTransferSyntaxUid(transferSyntaxUid) {
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
   * Checks whether transfer syntax UID is present.
   * @method
   * @param {string} transferSyntaxUid - Transfer syntax UID.
   * @returns {boolean} Whether transfer syntax UID is present.
   */
  hasTransferSyntaxUid(transferSyntaxUid) {
    return this.transferSyntaxes.includes(transferSyntaxUid);
  }

  /**
   * Gets the accepted transfer syntax UID.
   * @method
   * @returns {string|undefined} Accepted transfer syntax UID or undefined.
   */
  getAcceptedTransferSyntaxUid() {
    return this.transferSyntaxes.length > 0 ? this.transferSyntaxes[0] : undefined;
  }

  /**
   * Gets the presentation context result.
   * @method
   * @returns {number} Result.
   */
  getResult() {
    return this.result;
  }

  /**
   * Sets the presentation context result.
   * @method
   * @param {number} result - Result.
   * @param {string} [acceptedTransferSyntax] - Accepted transfer syntax UID.
   */
  setResult(result, acceptedTransferSyntaxUid) {
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
  getResultDescription() {
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

  /**
   * Gets the presentation context description.
   * @method
   * @return {string} Presentation context description.
   */
  toString() {
    const str = [];
    str.push(
      `Presentation Context:  ${this.getPresentationContextId()} [${this.getResultDescription()}]`
    );
    str.push(`  Abstract:  ${this.getAbstractSyntaxUid()}`);
    const syntaxes = this.getTransferSyntaxUids();
    syntaxes.forEach((tx) => {
      str.push(`      Transfer:  ${tx}`);
    });

    return str.join(EOL);
  }
}
//#endregion

//#region Association
class Association {
  /**
   * Creates an instance of Association.
   * @constructor
   * @param {string} callingAeTitle - Local AE title.
   * @param {string} calledAeTitle - Remote AE title.
   */
  constructor(callingAeTitle, calledAeTitle) {
    this.callingAeTitle = callingAeTitle;
    this.calledAeTitle = calledAeTitle;
    this.maxPduLength = Implementation.getMaxPduLength();
    this.applicationContextName = Uid.ApplicationContextName;
    this.implementationClassUid = Implementation.getImplementationClassUid();
    this.implementationVersion = Implementation.getImplementationVersion();
    this.presentationContexts = [];
    this.negotiateAsyncOps = false;
    this.maxAsyncOpsInvoked = 1;
    this.maxAsyncOpsPerformed = 1;
    this.negotiateUserIdentity = false;
    this.userIdentityType = UserIdentityType.Username;
    this.userIdentityPositiveResponseRequested = false;
    this.userIdentityPrimaryField = '';
    this.userIdentitySecondaryField = '';
    this.negotiateUserIdentityServerResponse = false;
    this.userIdentityServerResponse = '';
  }

  /**
   * Gets the calling AE title.
   * @method
   * @returns {string} Calling AE title.
   */
  getCallingAeTitle() {
    return this.callingAeTitle;
  }

  /**
   * Sets the calling AE title.
   * @method
   * @param {string} aet - Calling AE title.
   */
  setCallingAeTitle(aet) {
    this.callingAeTitle = aet;
  }

  /**
   * Gets the called AE title.
   * @method
   * @returns {string} Called AE title.
   */
  getCalledAeTitle() {
    return this.calledAeTitle;
  }

  /**
   * Sets the called AE title.
   * @method
   * @param {string} aet - Called AE title.
   */
  setCalledAeTitle(aet) {
    this.calledAeTitle = aet;
  }

  /**
   * Gets maximum PDU length.
   * @method
   * @returns {number} Maximum PDU length.
   */
  getMaxPduLength() {
    return this.maxPduLength;
  }

  /**
   * Sets maximum PDU length.
   * @method
   * @param {number} maxPduLength - Maximum PDU length.
   */
  setMaxPduLength(maxPduLength) {
    this.maxPduLength = maxPduLength;
  }

  /**
   * Gets the application context name.
   * @method
   * @returns {string} Application context name.
   */
  getApplicationContextName() {
    return this.applicationContextName;
  }

  /**
   * Gets the implementation class UID.
   * @method
   * @returns {string} Implementation class UID.
   */
  getImplementationClassUid() {
    return this.implementationClassUid;
  }

  /**
   * Sets the implementation class UID.
   * @method
   * @param {string} uid - Implementation class UID.
   */
  setImplementationClassUid(uid) {
    this.implementationClassUid = uid;
  }

  /**
   * Gets the implementation version.
   * @method
   * @returns {string} Implementation version.
   */
  getImplementationVersion() {
    return this.implementationVersion;
  }

  /**
   * Sets the implementation version.
   * @method
   * @param {string} version - Implementation version.
   */
  setImplementationVersion(version) {
    this.implementationVersion = version;
  }

  /**
   * Gets a flag indicating whether to negotiate asynchronous operations.
   * @method
   * @returns {boolean} Flag indicating whether to negotiate asynchronous operations.
   */
  getNegotiateAsyncOps() {
    return this.negotiateAsyncOps;
  }

  /**
   * Sets a flag indicating whether to negotiate asynchronous operations.
   * @method
   * @param {boolean} negotiate - Flag indicating whether to negotiate asynchronous operations.
   */
  setNegotiateAsyncOps(negotiate) {
    this.negotiateAsyncOps = negotiate;
  }

  /**
   * Gets the supported maximum number of asynchronous operations invoked.
   * @method
   * @returns {number} Maximum number of asynchronous operations invoked.
   */
  getMaxAsyncOpsInvoked() {
    return this.maxAsyncOpsInvoked;
  }

  /**
   * Sets the supported maximum number of asynchronous operations invoked.
   * @method
   * @param {number} ops - Maximum number of asynchronous operations invoked.
   */
  setMaxAsyncOpsInvoked(ops) {
    this.maxAsyncOpsInvoked = ops;
  }

  /**
   * Gets the supported maximum number of asynchronous operations performed.
   * @method
   * @returns {number} Maximum number of asynchronous operations performed.
   */
  getMaxAsyncOpsPerformed() {
    return this.maxAsyncOpsPerformed;
  }

  /**
   * Sets the supported maximum number of asynchronous operations performed.
   * @method
   * @param {number} ops - Maximum number of asynchronous operations performed.
   */
  setMaxAsyncOpsPerformed(ops) {
    this.maxAsyncOpsPerformed = ops;
  }

  /**
   * Gets a flag indicating whether to negotiate user identity.
   * @method
   * @returns {boolean} Flag indicating whether to negotiate user identity.
   */
  getNegotiateUserIdentity() {
    return this.negotiateUserIdentity;
  }

  /**
   * Sets a flag indicating whether to negotiate user identity.
   * @method
   * @param {boolean} negotiate - Flag indicating whether to negotiate user identity.
   */
  setNegotiateUserIdentity(negotiate) {
    this.negotiateUserIdentity = negotiate;
  }

  /**
   * Gets the user identity type.
   * @method
   * @returns {UserIdentityType} User identity type.
   */
  getUserIdentityType() {
    return this.userIdentityType;
  }

  /**
   * Sets the user identity type.
   * @method
   * @param {UserIdentityType} type - User identity type.
   */
  setUserIdentityType(type) {
    this.userIdentityType = type;
  }

  /**
   * Gets a flag indicating whether a positive response requested.
   * @method
   * @returns {boolean} Flag to indicate whether a positive response requested.
   */
  getUserIdentityPositiveResponseRequested() {
    return this.userIdentityPositiveResponseRequested;
  }

  /**
   * Sets a flag indicating whether a positive response requested.
   * @method
   * @param {boolean} positiveResponseRequested - Flag to indicate whether a positive response requested.
   */
  setUserIdentityPositiveResponseRequested(positiveResponseRequested) {
    this.userIdentityPositiveResponseRequested = positiveResponseRequested;
  }

  /**
   * Gets the user identity primary field.
   * This field might contain the username, the Kerberos service ticket or the JWT.
   * @method
   * @returns {string} User identity primary field.
   */
  getUserIdentityPrimaryField() {
    return this.userIdentityPrimaryField;
  }

  /**
   * Sets the user identity primary field.
   * This field might contain the username, the Kerberos service ticket or the JWT.
   * @method
   * @param {string} primaryField - User identity primary field.
   */
  setUserIdentityPrimaryField(primaryField) {
    this.userIdentityPrimaryField = primaryField;
  }

  /**
   * Gets the user identity secondary field.
   * This field might contain the passcode.
   * @method
   * @returns {string} User identity secondary field.
   */
  getUserIdentitySecondaryField() {
    return this.userIdentitySecondaryField;
  }

  /**
   * Sets the user identity secondary field.
   * This field might contain the passcode.
   * @method
   * @param {string} secondaryField - User identity secondary field.
   */
  setUserIdentitySecondaryField(secondaryField) {
    this.userIdentitySecondaryField = secondaryField;
  }

  /**
   * Gets a flag indicating whether to negotiate user identity server response.
   * @method
   * @returns {boolean} Flag indicating whether to negotiate user identity server response.
   */
  getNegotiateUserIdentityServerResponse() {
    return this.negotiateUserIdentityServerResponse;
  }

  /**
   * Sets a flag indicating whether to negotiate user identity server response.
   * @method
   * @param {boolean} negotiate - Flag indicating whether to negotiate user identity server response.
   */
  setNegotiateUserIdentityServerResponse(negotiate) {
    this.negotiateUserIdentityServerResponse = negotiate;
  }

  /**
   * Gets the user identity server response.
   * This field might contain the Kerberos server ticket if the user identity type value was 3,
   * the SAML response if the user identity type value was 4, or it might be empty
   * if the user identity type value was 1 or 2.
   * @method
   * @returns {string} User identity server response.
   */
  getUserIdentityServerResponse() {
    return this.userIdentityServerResponse;
  }

  /**
   * Sets the user identity server response.
   * This field might contain the Kerberos server ticket if the user identity type value was 3,
   * the SAML response if the user identity type value was 4, or it might be empty
   * if the user identity type value was 1 or 2.
   * @method
   * @param {string} serverResponse - User identity server response.
   */
  setUserIdentityServerResponse(serverResponse) {
    this.userIdentityServerResponse = serverResponse;
  }

  /**
   * Adds presentation context to association.
   * @method
   * @param {string} abstractSyntaxUid - Abstract Syntax UID.
   * @param {number} [presentationContextId] - Presentation context ID.
   * @returns {number} Presentation context ID.
   */
  addPresentationContext(abstractSyntaxUid, presentationContextId) {
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
  addOrGetPresentationContext(abstractSyntaxUid) {
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
  addTransferSyntaxToPresentationContext(pcId, transferSyntaxUid) {
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
  findPresentationContextByAbstractSyntaxAndTransferSyntax(abstractSyntaxUid, transferSyntaxUid) {
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
  getPresentationContext(pcId) {
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
  getPresentationContexts() {
    return this.presentationContexts;
  }

  /**
   * Clears all presentation contexts.
   * @method
   */
  clearPresentationContexts() {
    this.presentationContexts.length = 0;
  }

  /**
   * Adds presentation context from request.
   * @method
   * @param {Request} request - Request.
   * @param {string|Array<string>} [transferSyntaxUidOrUids] - Transfer syntax UID or UIDs to propose.
   * @returns {number} Presentation context ID.
   */
  addPresentationContextFromRequest(request, transferSyntaxUidOrUids) {
    let syntaxes = transferSyntaxUidOrUids || TransferSyntax.ImplicitVRLittleEndian;
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
      if (request.getAddStorageSopClassesToAssociation() === true) {
        Object.keys(StorageClass).forEach((uid) => {
          const storageClassUid = StorageClass[uid];
          const storagePcId = this.addOrGetPresentationContext(storageClassUid);
          syntaxes.forEach((syntax) => {
            this.addTransferSyntaxToPresentationContext(storagePcId, syntax);
          });
        });
      }
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
   * @param {Request} request - Request.
   * @return {PresentationContext|undefined} Accepted presentation context, if found.
   */
  getAcceptedPresentationContextFromRequest(request) {
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
  toString() {
    const str = [];
    str.push(`Application Context:     ${this.getApplicationContextName()}`);
    str.push(`Implementation Class:    ${this.getImplementationClassUid()}`);
    str.push(`Implementation Version:  ${this.getImplementationVersion()}`);
    str.push(`Maximum PDU Length:      ${this.getMaxPduLength()}`);
    str.push(`Called AE Title:         ${this.getCalledAeTitle()}`);
    str.push(`Calling AE Title:        ${this.getCallingAeTitle()}`);
    if (this.getNegotiateAsyncOps()) {
      str.push(
        `Asynchronous Operations: Invoked: ${this.getMaxAsyncOpsInvoked()} Performed:${this.getMaxAsyncOpsPerformed()}`
      );
    }
    if (this.getNegotiateUserIdentity()) {
      str.push(
        `User Identity:           ${
          this._userIdentityTypeToString(this.getUserIdentityType()) || ''
        }`
      );
    }
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

    return str.join(EOL);
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
  _uidNameFromValue(uids, uid) {
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
  _sopClassFromRequest(request) {
    switch (request.getCommandFieldType()) {
      case CommandFieldType.NGetRequest:
      case CommandFieldType.NSetRequest:
      case CommandFieldType.NActionRequest:
      case CommandFieldType.NDeleteRequest:
        return request.getMetaSopClassUid() !== undefined
          ? request.getMetaSopClassUid()
          : request.getRequestedSopClassUid();
      case CommandFieldType.CStoreRequest:
      case CommandFieldType.CFindRequest:
      case CommandFieldType.CGetRequest:
      case CommandFieldType.CMoveRequest:
      case CommandFieldType.CEchoRequest:
        return request.getAffectedSopClassUid();
      case CommandFieldType.NEventReportRequest:
      case CommandFieldType.NCreateRequest:
        return request.getMetaSopClassUid() !== undefined
          ? request.getMetaSopClassUid()
          : request.getAffectedSopClassUid();
      default:
        return request.getAffectedSopClassUid();
    }
  }

  /**
   * Returns a readable string from user identity type.
   * @method
   * @private
   * @param {number} type - User identity type.
   * @returns {string} Readable string.
   */
  _userIdentityTypeToString(type) {
    switch (type) {
      case UserIdentityType.Username:
        return 'Username';
      case UserIdentityType.UsernameAndPasscode:
        return 'Username and Passcode';
      case UserIdentityType.Kerberos:
        return 'Kerberos Service Ticket';
      case UserIdentityType.Saml:
        return 'SAML Assertion';
      case UserIdentityType.Jwt:
        return 'JSON Web Token';
      default:
        return `${type}`;
    }
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = { Association, PresentationContext };
//#endregion
