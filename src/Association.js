const { CStoreRequest } = require('./Command');
const { Implementation, PresentationContextResult, Uid, TransferSyntax } = require('./Constants');

//#region PresentationContext
class PresentationContext {
  /**
   * Creates an instance of PresentationContext.
   *
   * @param {Number} pcId - Presentation context ID.
   * @param {String} abstractSyntaxUid - Abstract syntax UID.
   * @param {String} transferSyntaxUid - Transfer syntax UID.
   * @param {Number} result - Presentation context result.
   * @memberof PresentationContext
   */
  constructor(pcId, abstractSyntaxUid, transferSyntaxUid, result) {
    this.pcId = pcId;
    this.abstractSyntaxUid = abstractSyntaxUid;
    this.transferSyntaxes = [];
    if (transferSyntaxUid) {
      this.transferSyntaxes.push(transferSyntaxUid);
    }
    this.result = result;
    if (!this.result) {
      this.result = PresentationContextResult.Proposed;
    }
  }

  /**
   * Gets presentation context ID.
   *
   * @returns {Number} Presentation context ID.
   * @memberof PresentationContext
   */
  getPresentationContextId() {
    return this.pcId;
  }

  /**
   * Gets abstract syntax UID.
   *
   * @returns {String} Abstract syntax UID.
   * @memberof PresentationContext
   */
  getAbstractSyntaxUid() {
    return this.abstractSyntaxUid;
  }

  /**
   * Gets transfer syntax UIDs.
   *
   * @returns {Array} Transfer syntax UIDs.
   * @memberof PresentationContext
   */
  getTransferSyntaxUids() {
    return this.transferSyntaxes;
  }

  /**
   * Add transfer syntax UIDs.
   *
   * @param {String} transferSyntaxUid - Transfer syntax UIDs.
   * @memberof PresentationContext
   */
  addTransferSyntaxUid(transferSyntaxUid) {
    if (this.transferSyntaxes.includes(transferSyntaxUid)) {
      return;
    }
    this.transferSyntaxes.push(transferSyntaxUid);
  }

  /**
   * Gets the accepted transfer syntax UID.
   *
   * @returns {String} Transfer syntax UID.
   * @memberof PresentationContext
   */
  getAcceptedTransferSyntaxUid() {
    return this.transferSyntaxes.length > 0 ? this.transferSyntaxes[0] : undefined;
  }

  /**
   * Gets the presentation context result.
   *
   * @returns {Number} Result.
   * @memberof PresentationContext
   */
  getResult() {
    return this.result;
  }

  /**
   * Sets the presentation context result.
   *
   * @param {Number} result - Result.
   * @param {String} acceptedTransferSyntax - Accepted transfer syntax UID.
   * @memberof PresentationContext
   */
  setResult(result, acceptedTransferSyntaxUid) {
    this.result = result;
    this.transferSyntaxes.length = 0;

    if (acceptedTransferSyntaxUid) {
      this.transferSyntaxes.push(acceptedTransferSyntaxUid);
    } else {
      if (this.transferSyntaxes.length > 0) {
        this.transferSyntaxes.push(this.transferSyntaxes[0]);
      }
    }
  }

  /**
   * Gets the presentation context result description.
   *
   * @memberof PresentationContext
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
}
//#endregion

//#region Association
class Association {
  /**
   * Creates an instance of Association.
   *
   * @param {String} callingAeTitle - Local AE title.
   * @param {String} calledAeTitle - Remote AE title.
   * @memberof Association
   */
  constructor(callingAeTitle, calledAeTitle) {
    this.callingAeTitle = callingAeTitle;
    this.calledAeTitle = calledAeTitle;
    this.maxPduLength = Implementation.MaxPduLength;
    this.applicationContextName = Uid.ApplicationContextName;
    this.implementationClassUid = Implementation.ImplementationClassUid;
    this.implementationVersion = Implementation.ImplementationVersion;
    this.presentationContexts = [];
  }

  /**
   * Gets the calling AE title.
   *
   * @returns {String} Calling AE title.
   * @memberof PresentationContext
   */
  getCallingAeTitle() {
    return this.callingAeTitle;
  }

  /**
   * Sets the calling AE title.
   *
   * @param {String} aet - Calling AE title.
   * @memberof PresentationContext
   */
  setCallingAeTitle(aet) {
    this.callingAeTitle = aet;
  }

  /**
   * Gets the called AE title.
   *
   * @returns {String} Called AE title.
   * @memberof PresentationContext
   */
  getCalledAeTitle() {
    return this.calledAeTitle;
  }

  /**
   * Sets the called AE title.
   *
   * @param {String} aet - Called AE title.
   * @memberof PresentationContext
   */
  setCalledAeTitle(aet) {
    this.calledAeTitle = aet;
  }

  /**
   * Gets maximum PDU length.
   *
   * @returns {Number} Maximum PDU length.
   * @memberof PresentationContext
   */
  getMaxPduLength() {
    return this.maxPduLength;
  }

  /**
   * Sets maximum PDU length.
   *
   * @param {Number} maxPduLength - Maximum PDU length.
   * @memberof PresentationContext
   */
  setMaxPduLength(maxPduLength) {
    this.maxPduLength = maxPduLength;
  }

  /**
   * Gets the application context name.
   *
   * @returns {String} Application context name.
   * @memberof PresentationContext
   */
  getApplicationContextName() {
    return this.applicationContextName;
  }

  /**
   * Gets the implementation class UID.
   *
   * @returns {String} Implementation class UID.
   * @memberof PresentationContext
   */
  getImplementationClassUid() {
    return this.implementationClassUid;
  }

  /**
   * Sets the implementation class UID.
   *
   * @param {String} uid - Implementation class UID.
   * @memberof PresentationContext
   */
  setImplementationClassUid(uid) {
    this.implementationClassUid = uid;
  }

  /**
   * Gets the implementation version.
   *
   * @returns {String} Implementation version.
   * @memberof PresentationContext
   */
  getImplementationVersion() {
    return this.implementationVersion;
  }

  /**
   * Sets the implementation version.
   *
   * @param {String} version - Implementation version.
   * @memberof PresentationContext
   */
  setImplementationVersion(version) {
    this.implementationVersion = version;
  }

  /**
   * Adds presentation context to association.
   *
   * @param {String} abstractSyntaxUid - Abstract Syntax UID.
   * @param {Number} presentationContextId - Presentation context ID.
   * @returns {Number} Presentation context ID.
   * @memberof Association
   */
  addPresentationContext(abstractSyntaxUid, presentationContextId) {
    let pcId = presentationContextId || 1;
    this.presentationContexts.forEach(pc => {
      const id = pc.id;
      if (id >= pcId) {
        pcId = id + 2;
      }
    });
    this.presentationContexts.push({
      id: pcId,
      context: new PresentationContext(pcId, abstractSyntaxUid)
    });

    return pcId;
  }

  /**
   * Adds transfer syntax to presentation context.
   *
   * @param {Number} pcId - Presentation context ID.
   * @param {String} transferSyntaxUid - Transfer Syntax UID.
   * @memberof Association
   */
  addTransferSyntaxToPresentationContext(pcId, transferSyntaxUid) {
    const context = this.getPresentationContext(pcId);
    context.addTransferSyntaxUid(transferSyntaxUid);
  }

  /**
   * Gets presentation context.
   *
   * @param {Number} pcId - Presentation context ID.
   * @returns {Object} Presentation context.
   * @memberof Association
   */
  getPresentationContext(pcId) {
    const presentationContext = this.presentationContexts.find(p => p.id === pcId);
    if (!presentationContext) {
      throw new Error(`Invalid presentation context ID: ${pcId}`);
    }

    return presentationContext.context;
  }

  /**
   * Gets presentation contexts.
   *
   * @returns {Array} Presentation contexts.
   * @memberof Association
   */
  getPresentationContexts() {
    return this.presentationContexts;
  }

  /**
   * Adds presentation context from request.
   *
   * @param {Object} request - Request.
   * @returns {Number} Presentation context ID.
   * @memberof Association
   */
  addPresentationContextFromRequest(request) {
    const sopClassUid = request.getAffectedSopClassUid();
    let pcId = undefined;

    if (request instanceof CStoreRequest) {
      let contextExists = false;
      const presentationContexts = this.getPresentationContexts();
      presentationContexts.forEach(pc => {
        const context = this.getPresentationContext(pc.id);
        if (sopClassUid === context.getAbstractSyntaxUid()) {
          contextExists = true;
        }
      });
      if (contextExists) {
        return pcId;
      }

      pcId = this.addPresentationContext(sopClassUid);
      this.addTransferSyntaxToPresentationContext(pcId, TransferSyntax.ImplicitVRLittleEndian);
      this.addTransferSyntaxToPresentationContext(pcId, TransferSyntax.ExplicitVRLittleEndian);

      // Add an extra presentation context with any encapsulated transfer syntax
      // to allow bitstream.
      const dataset = request.getDataset();
      const transferSyntaxUid = dataset.getTransferSyntaxUid();
      if (transferSyntaxUid !== TransferSyntax.ImplicitVRLittleEndian && transferSyntaxUid !== TransferSyntax.ExplicitVRLittleEndian) {
        pcId = this.addPresentationContext(sopClassUid);
        this.addTransferSyntaxToPresentationContext(pcId, transferSyntaxUid);
      }
    } else {
      pcId = this.addPresentationContext(sopClassUid);
      this.addTransferSyntaxToPresentationContext(pcId, TransferSyntax.ImplicitVRLittleEndian);
      this.addTransferSyntaxToPresentationContext(pcId, TransferSyntax.ExplicitVRLittleEndian);
    }

    return pcId;
  }

  /**
   * Gets accepted presentation context from request.
   *
   * @return {Object} request - Presentation context.
   * @memberof Association
   */
  getAcceptedPresentationContextFromRequest(request) {
    let acceptedContext = undefined;
    const contexts = this.getPresentationContexts();
    contexts.forEach(pc => {
      const context = this.getPresentationContext(pc.id);
      if (context.getAbstractSyntaxUid() === request.getAffectedSopClassUid() && context.getResult() === PresentationContextResult.Accept) {
        acceptedContext = context;
      }
    });
    return acceptedContext;
  }

  /**
   * Gets the association description.
   *
   * @memberof Association
   */
  toString() {
    const str = [];
    str.push(`Application Context:     ${this.applicationContextName}`);
    str.push(`Implementation Class:    ${this.implementationClassUid}`);
    str.push(`Implementation Version:  ${this.implementationVersion}`);
    str.push(`Maximum PDU Length:      ${this.maxPduLength}`);
    str.push(`Called AE Title:         ${this.calledAeTitle}`);
    str.push(`Calling AE Title:        ${this.callingAeTitle}`);
    str.push(`Presentation Contexts:   ${this.presentationContexts.length}`);
    this.presentationContexts.forEach(pc => {
      const context = this.getPresentationContext(pc.id);
      str.push(`  Presentation Context:  ${pc.id} [${context.getResultDescription()}]`);
      str.push(`      Abstract:  ${context.getAbstractSyntaxUid()}`);

      const syntaxes = context.getTransferSyntaxUids();
      syntaxes.forEach(tx => {
        str.push(`      Transfer:  ${tx}`);
      });
    });
    str.push('');

    return str.join('\n');
  }
}

//#region Exports
module.exports = { PresentationContext, Association };
//#endregion
