export class RawPdu {
    /**
     * Creates an instance of Pdu for reading or writing PDUs.
     * @constructor
     * @param {Number|Buffer} typeOrBuffer - Type of PDU or PDU Buffer.
     */
    constructor(typeOrBuffer: number | Buffer);
    m16: any[];
    m32: any[];
    buffer: SmartBuffer;
    type: number;
    /**
     * Gets the PDU type.
     * @method
     * @returns {number} PDU type.
     */
    getType(): number;
    /**
     * Gets the PDU length.
     * @method
     * @returns {number} PDU length.
     */
    getLength(): number;
    /**
     * Gets the PDU description.
     * @method
     * @returns {string} PDU description.
     */
    toString(): string;
    /**
     * Resets PDU read buffer.
     * @method
     */
    reset(): void;
    /**
     * Reads PDU.
     * @method
     */
    readPdu(): void;
    /**
     * Writes PDU type and length.
     * @method
     * @returns {Buffer} PDU buffer with type and length.
     */
    writePdu(): Buffer;
    /**
     * Checks if the reading bytes exceed the PDU length.
     * @method
     * @param {number} bytes - Number of bytes to read.
     * @param {string} name - Field name to read.
     * @throws Error if bytes to read are exceeding buffer length.
     */
    checkOffset(bytes: number, name: string): void;
    /**
     * Reads byte from PDU.
     * @method
     * @param {string} name - Field name to read.
     * @returns {number} Read byte.
     */
    readByte(name: string): number;
    /**
     * Reads bytes from PDU.
     * @method
     * @param {string} name - Field name to read.
     * @param {number} count - Number of bytes to read.
     * @returns {Buffer} Read bytes in a buffer.
     */
    readBytes(name: string, count: number): Buffer;
    /**
     * Reads unsigned short from PDU.
     * @method
     * @param {string} name - Field name to read.
     * @returns {number} Read unsigned short.
     */
    readUInt16(name: string): number;
    /**
     * Reads unsigned int from PDU.
     * @method
     * @param {string} name - Field name to read.
     * @returns {number} Read unsigned int.
     */
    readUInt32(name: string): number;
    /**
     * Reads string from PDU.
     * @method
     * @param {string} name - Field name to read.
     * @param {number} count - Number of bytes to read.
     * @returns {string} Read string.
     */
    readString(name: string, count: number): string;
    /**
     * Skips bytes in PDU.
     * @method
     * @param {string} name - Field name to skip.
     * @param {number} count - Number of bytes to skip.
     */
    skipBytes(name: string, count: number): void;
    /**
     * Writes byte to PDU.
     * @method
     * @param {string} name - Field name to write.
     * @param {number} value - Byte value.
     */
    writeByte(name: string, value: number): void;
    /**
     * Writes byte to PDU multiple times.
     * @method
     * @param {string} name - Field name to write.
     * @param {number} value - Byte value.
     * @param {number} count - Number of times to write PDU value.
     */
    writeByteMultiple(name: string, value: number, count: number): void;
    /**
     * Writes bytes to PDU.
     * @method
     * @param {string} name - Field name to write.
     * @param {Buffer} value - Byte values.
     */
    writeBytes(name: string, value: Buffer): void;
    /**
     * Writes unsigned short to PDU.
     * @method
     * @param {string} name - Field name to write.
     * @param {number} value - Unsigned short value.
     */
    writeUInt16(name: string, value: number): void;
    /**
     * Writes unsigned int to PDU.
     * @method
     * @param {string} name - Field name to write.
     * @param {number} value - Unsigned int value.
     */
    writeUInt32(name: string, value: number): void;
    /**
     * Writes string to PDU.
     * @method
     * @param {string} name - Field name to write.
     * @param {string} value - String value.
     */
    writeString(name: string, value: string): void;
    /**
     * Writes string to PDU with padding.
     * @method
     * @param {string} name - Field name to write.
     * @param {string} value - String value.
     * @param {number} count - Number of characters to write.
     * @param {string} pad - Padding character.
     */
    writeStringWithPadding(name: string, value: string, count: number, pad: string): void;
    /**
     * Marks position to write 16-bit length value.
     * @method
     * @param {string} name - Field name.
     */
    markLength16(name: string): void;
    /**
     * Writes 16-bit length to top length marker.
     * @method
     */
    writeLength16(): void;
    /**
     * Marks position to write 32-bit length value.
     * @method
     * @param {string} name - Field name.
     */
    markLength32(name: string): void;
    /**
     * Writes 32-bit length to top length marker.
     * @method
     */
    writeLength32(): void;
    /**
     * Trim characters from a string.
     * @method
     * @private
     * @param {string} str - The string to trim.
     * @param {Array<string>} chars - The characters to trim from string.
     * @returns {string} Trimmed string.
     */
    private _trim;
}
export class AAssociateRQ {
    /**
     * Creates an instance of AAssociateRQ.
     * @constructor
     * @param {Association} association - Association information.
     */
    constructor(association: Association);
    association: Association;
    /**
     * Gets the association information.
     * @method
     * @returns {Association} Association information.
     */
    getAssociation(): Association;
    /**
     * Writes A-ASSOCIATE-RQ to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads A-ASSOCIATE-RQ from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
export class AAssociateAC {
    /**
     * Creates an instance of AAssociateAC.
     * @constructor
     * @param {Association} association - Association information.
     */
    constructor(association: Association);
    association: Association;
    /**
     * Gets the association information.
     * @method
     * @returns {Association} Association information.
     */
    getAssociation(): Association;
    /**
     * Writes A-ASSOCIATE-AC to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads A-ASSOCIATE-AC from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
export class AAssociateRJ {
    /**
     * Creates an instance of AAssociateRJ.
     * @constructor
     * @param {number} [result] - Rejection result.
     * @param {number} [source] - Rejection source.
     * @param {number} [source] - Rejection reason.
     */
    constructor(result?: number, source?: number, reason: any);
    result: any;
    source: number;
    reason: any;
    /**
     * Gets the rejection result.
     * @method
     * @returns {number} Rejection result.
     */
    getResult(): number;
    /**
     * Gets the rejection source.
     * @method
     * @returns {number} Rejection source.
     */
    getSource(): number;
    /**
     * Gets the rejection reason.
     * @method
     * @returns {number} Rejection reason.
     */
    getReason(): number;
    /**
     * Writes A-ASSOCIATE-RJ to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads A-ASSOCIATE-RJ from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
export class AReleaseRQ {
    /**
     * Writes A-RELEASE-RQ to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads A-RELEASE-RQ from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
export class AReleaseRP {
    /**
     * Writes A-RELEASE-RP to PDU buffer.
     * @method
     * @returns {RawPdu} PDU buffer.
     */
    write(): RawPdu;
    /**
     * Reads A-RELEASE-RP from PDU buffer.
     * @method
     * @param {RawPdu} PDU buffer.
     */
    read(pdu: any): void;
}
export class AAbort {
    /**
     * Creates an instance of AAbort.
     * @constructor
     * @param {number} [source] - Rejection source.
     * @param {number} [reason] - Rejection reason.
     */
    constructor(source?: number, reason?: number);
    source: number;
    reason: any;
    /**
     * Gets the abort source.
     * @method
     * @returns {number} Abort source.
     */
    getSource(): number;
    /**
     * Gets the abort reason.
     * @method
     * @returns {number} Abort reason.
     */
    getReason(): number;
    /**
     * Writes A-ABORT to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads A-ABORT from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
export class Pdv {
    /**
     * Creates an instance of Pdv.
     * @constructor
     * @param {number} pcId - Presentation context ID.
     * @param {Buffer} value - PDV data.
     * @param {boolean} command - Is command.
     * @param {boolean} last - Is last fragment of command or data.
     */
    constructor(pcId: number, value: Buffer, command: boolean, last: boolean);
    pcId: number;
    value: Buffer;
    command: boolean;
    last: boolean;
    /**
     * Gets the presentation context ID.
     * @method
     * @returns {number} Presentation context ID.
     */
    getPresentationContextId(): number;
    /**
     * Gets the PDV data.
     * @method
     * @returns {Buffer} PDV data.
     */
    getValue(): Buffer;
    /**
     * Gets whether PDV is command.
     * @method
     * @returns {boolean} Is command.
     */
    isCommand(): boolean;
    /**
     * Gets whether PDV is last fragment of command or data.
     * @method
     * @returns {boolean} Is last fragment.
     */
    isLastFragment(): boolean;
    /**
     * Gets the PDV length.
     * @method
     * @returns {number} PDV length.
     */
    getLength(): number;
    /**
     * Writes PDV to PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    write(pdu: any): void;
    /**
     * Reads PDV from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): any;
}
export class PDataTF {
    pdvs: any[];
    /**
     * Gets PDVs in P-DATA-TF.
     * @method
     * @returns {Array<Pdv>} PDVs in this P-DATA-TF.
     */
    getPdvs(): Array<Pdv>;
    /**
     * Gets PDV count in P-DATA-TF.
     * @method
     * @returns {number} PDV count.
     */
    getPdvCount(): number;
    /**
     * Adds a PDV in P-DATA-TF.
     * @method
     * @param {Pdv} pdv - PDV.
     */
    addPdv(pdv: Pdv): number;
    /**
     * Clears all PDVs in P-DATA-TF.
     * @method
     */
    clearPdvs(): void;
    /**
     * Gets the total length of the PDVs in P-DATA-TF.
     * @method
     * @returns {number} Length of PDVs.
     */
    getLengthOfPdvs(): number;
    /**
     * Writes P-DATA-TF to PDU.
     * @method
     * @returns {RawPdu} PDU.
     */
    write(): RawPdu;
    /**
     * Reads P-DATA-TF from PDU.
     * @method
     * @param {RawPdu} PDU.
     */
    read(pdu: any): void;
}
import { SmartBuffer } from "smart-buffer";
