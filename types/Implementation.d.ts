export = Implementation;
declare class Implementation {
    /**
     * Gets implementation class UID.
     * @method
     * @static
     * @returns {string} Implementation class UID.
     */
    static getImplementationClassUid(): string;
    /**
     * Sets implementation class UID.
     * @method
     * @static
     * @param {string} uid - Implementation class UID.
     */
    static setImplementationClassUid(uid: string): void;
    /**
     * Gets implementation version.
     * @method
     * @static
     * @returns {string} Implementation version.
     */
    static getImplementationVersion(): string;
    /**
     * Sets implementation version.
     * @method
     * @static
     * @param {string} version - Implementation version.
     */
    static setImplementationVersion(version: string): void;
    /**
     * Gets max PDU length.
     * @method
     * @static
     * @returns {number} Max PDU length.
     */
    static getMaxPduLength(): number;
    /**
     * Sets max PDU length.
     * @method
     * @static
     * @param {number} maxLength - Max PDU length.
     */
    static setMaxPduLength(maxLength: number): void;
}
