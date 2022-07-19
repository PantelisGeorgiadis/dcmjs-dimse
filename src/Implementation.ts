import { DefaultImplementation } from './Constants';

//#region Implementation
class Implementation {
  static implementationClassUid: string;
  static implementationVersion: string;
  static maxPduLength: number;

  /**
   * Gets implementation class UID.
   * @method
   * @static
   * @returns {string} Implementation class UID.
   */
  static getImplementationClassUid(): string {
    return this.implementationClassUid || DefaultImplementation.ImplementationClassUid;
  }

  /**
   * Sets implementation class UID.
   * @method
   * @static
   * @param {string} uid - Implementation class UID.
   */
  static setImplementationClassUid(uid: string) {
    this.implementationClassUid = uid;
  }

  /**
   * Gets implementation version.
   * @method
   * @static
   * @returns {string} Implementation version.
   */
  static getImplementationVersion(): string {
    return this.implementationVersion || DefaultImplementation.ImplementationVersion;
  }

  /**
   * Sets implementation version.
   * @method
   * @static
   * @param {string} version - Implementation version.
   */
  static setImplementationVersion(version: string) {
    this.implementationVersion = version;
  }

  /**
   * Gets max PDU length.
   * @method
   * @static
   * @returns {number} Max PDU length.
   */
  static getMaxPduLength(): number {
    return this.maxPduLength || DefaultImplementation.MaxPduLength;
  }

  /**
   * Sets max PDU length.
   * @method
   * @static
   * @param {number} maxLength - Max PDU length.
   */
  static setMaxPduLength(maxLength: number) {
    this.maxPduLength = maxLength;
  }
}
//#endregion

//#region Exports
export default Implementation;
//#endregion
