const { DefaultImplementation } = require('./Constants');

//#region Implementation
class Implementation {
  /**
   * Gets implementation class UID.
   * @method
   * @static
   * @returns {string} Implementation class UID.
   */
  static getImplementationClassUid() {
    return this.implementationClassUid || DefaultImplementation.ImplementationClassUid;
  }

  /**
   * Sets implementation class UID.
   * @method
   * @static
   * @param {string} uid - Implementation class UID.
   */
  static setImplementationClassUid(uid) {
    this.implementationClassUid = uid;
  }

  /**
   * Gets implementation version.
   * @method
   * @static
   * @returns {string} Implementation version.
   */
  static getImplementationVersion() {
    return this.implementationVersion || DefaultImplementation.ImplementationVersion;
  }

  /**
   * Sets implementation version.
   * @method
   * @static
   * @param {string} version - Implementation version.
   */
  static setImplementationVersion(version) {
    if (typeof version !== 'string' || version.length > 16) {
      throw new Error('Implementation version should be a string with less than 16 characters');
    }

    this.implementationVersion = version;
  }

  /**
   * Gets max PDU length.
   * @method
   * @static
   * @returns {number} Max PDU length.
   */
  static getMaxPduLength() {
    return this.maxPduLength || DefaultImplementation.MaxPduLength;
  }

  /**
   * Sets max PDU length.
   * @method
   * @static
   * @param {number} maxLength - Max PDU length.
   */
  static setMaxPduLength(maxLength) {
    this.maxPduLength = maxLength;
  }
}
//#endregion

//#region Exports
module.exports = Implementation;
//#endregion
