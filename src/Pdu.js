const {
  RejectResult,
  RejectSource,
  RejectReason,
  AbortSource,
  AbortReason,
  TransferSyntax
} = require('./Constants');

const { SmartBuffer } = require('smart-buffer');

//#region RawPdu
class RawPdu {
  /**
   * Creates an instance of Pdu for reading or writing PDUs.
   * @constructor
   * @param {Number|Buffer} typeOrBuffer - Type of PDU or PDU Buffer.
   */
  constructor(typeOrBuffer) {
    this.m16 = [];
    this.m32 = [];

    if (Buffer.isBuffer(typeOrBuffer)) {
      this.buffer = SmartBuffer.fromBuffer(typeOrBuffer, 'ascii');
      this.type = this.buffer.readUInt8();
      return;
    }

    this.buffer = SmartBuffer.fromOptions({
      encoding: 'ascii'
    });
    this.type = typeOrBuffer;
  }

  /**
   * Gets the PDU type.
   * @method
   * @returns {number} PDU type.
   */
  getType() {
    return this.type;
  }

  /**
   * Gets the PDU length.
   * @method
   * @returns {number} PDU length.
   */
  getLength() {
    return this.buffer.length;
  }

  /**
   * Gets the PDU description.
   * @method
   * @returns {string} PDU description.
   */
  toString() {
    return `PDU [type=${this.getType()}, length=${this.getLength()}]`;
  }

  /**
   * Resets PDU read buffer.
   * @method
   */
  reset() {
    this.buffer.readOffset = 0;
    this.buffer.writeOffset = 0;
  }

  /**
   * Reads PDU.
   * @method
   */
  readPdu() {
    this.buffer.readUInt8();
    const len = this.buffer.readUInt32BE();
    const data = this.buffer.readBuffer(len);
    this.buffer = SmartBuffer.fromBuffer(data, 'ascii');
  }

  /**
   * Writes PDU type and length.
   * @method
   * @returns {Buffer} PDU buffer with type and length.
   */
  writePdu() {
    const outBuffer = SmartBuffer.fromOptions({
      encoding: 'ascii'
    });
    const length = this.getLength();

    outBuffer.writeUInt8(this.type);
    outBuffer.writeUInt8(0);
    outBuffer.writeUInt8((length & 0xff000000) >> 24);
    outBuffer.writeUInt8((length & 0x00ff0000) >> 16);
    outBuffer.writeUInt8((length & 0x0000ff00) >> 8);
    outBuffer.writeUInt8(length & 0x000000ff);
    outBuffer.writeBuffer(this.buffer.toBuffer());

    return outBuffer.toBuffer();
  }

  /**
   * Checks if the reading bytes exceed the PDU length.
   * @method
   * @param {number} bytes - Number of bytes to read.
   * @param {string} name - Field name to read.
   * @throws Error if bytes to read are exceeding buffer length.
   */
  checkOffset(bytes, name) {
    const offset = this.buffer.readOffset;
    const length = this.buffer.length;
    if (offset + bytes > length) {
      throw new Error(
        `${toString()} (length=${length}, offset=${offset}, bytes=${bytes}, field=${name}) Requested offset out of range!`
      );
    }
  }

  //#region Read Methods
  /**
   * Reads byte from PDU.
   * @method
   * @param {string} name - Field name to read.
   * @returns {number} Read byte.
   */
  readByte(name) {
    this.checkOffset(1, name);
    return this.buffer.readUInt8();
  }

  /**
   * Reads bytes from PDU.
   * @method
   * @param {string} name - Field name to read.
   * @param {number} count - Number of bytes to read.
   * @returns {Buffer} Read bytes in a buffer.
   */
  readBytes(name, count) {
    this.checkOffset(count, name);
    return this.buffer.readBuffer(count);
  }

  /**
   * Reads unsigned short from PDU.
   * @method
   * @param {string} name - Field name to read.
   * @returns {number} Read unsigned short.
   */
  readUInt16(name) {
    this.checkOffset(2, name);
    return this.buffer.readUInt16BE();
  }

  /**
   * Reads unsigned int from PDU.
   * @method
   * @param {string} name - Field name to read.
   * @returns {number} Read unsigned int.
   */
  readUInt32(name) {
    this.checkOffset(4, name);
    return this.buffer.readUInt32BE();
  }

  /**
   * Reads string from PDU.
   * @method
   * @param {string} name - Field name to read.
   * @param {number} count - Number of bytes to read.
   * @returns {string} Read string.
   */
  readString(name, count) {
    const bytes = this.readBytes(name, count);
    return this._trim(String.fromCharCode.apply(String, bytes), [' ', '\0']);
  }

  /**
   * Skips bytes in PDU.
   * @method
   * @param {string} name - Field name to skip.
   * @param {number} count - Number of bytes to skip.
   */
  skipBytes(name, count) {
    this.checkOffset(count, name);
    this.buffer.readOffset += count;
  }
  //#endregion

  //#region Write Methods
  /**
   * Writes byte to PDU.
   * @method
   * @param {string} name - Field name to write.
   * @param {number} value - Byte value.
   */
  writeByte(name, value) {
    this.buffer.writeUInt8(value);
  }

  /**
   * Writes byte to PDU multiple times.
   * @method
   * @param {string} name - Field name to write.
   * @param {number} value - Byte value.
   * @param {number} count - Number of times to write PDU value.
   */
  writeByteMultiple(name, value, count) {
    for (let i = 0; i < count; i++) {
      this.writeByte(name, value);
    }
  }

  /**
   * Writes bytes to PDU.
   * @method
   * @param {string} name - Field name to write.
   * @param {Buffer} value - Byte values.
   */
  writeBytes(name, value) {
    this.buffer.writeBuffer(value);
  }

  /**
   * Writes unsigned short to PDU.
   * @method
   * @param {string} name - Field name to write.
   * @param {number} value - Unsigned short value.
   */
  writeUInt16(name, value) {
    this.buffer.writeUInt16BE(value);
  }

  /**
   * Writes unsigned int to PDU.
   * @method
   * @param {string} name - Field name to write.
   * @param {number} value - Unsigned int value.
   */
  writeUInt32(name, value) {
    this.buffer.writeUInt32BE(value);
  }

  /**
   * Writes string to PDU.
   * @method
   * @param {string} name - Field name to write.
   * @param {string} value - String value.
   */
  writeString(name, value) {
    for (let i = 0, len = value.length; i < len; ++i) {
      this.buffer.writeUInt8(value.charCodeAt(i));
    }
  }

  /**
   * Writes string to PDU with padding.
   * @method
   * @param {string} name - Field name to write.
   * @param {string} value - String value.
   * @param {number} count - Number of characters to write.
   * @param {string} pad - Padding character.
   */
  writeStringWithPadding(name, value, count, pad) {
    this.writeString(name, value.padEnd(count, pad));
  }

  /**
   * Marks position to write 16-bit length value.
   * @method
   * @param {string} name - Field name.
   */
  // eslint-disable-next-line no-unused-vars
  markLength16(name) {
    this.m16.push(this.buffer.writeOffset);
    this.buffer.writeUInt16BE(0);
  }

  /**
   * Writes 16-bit length to top length marker.
   * @method
   */
  writeLength16() {
    const p1 = this.m16.pop();
    const p2 = this.buffer.writeOffset;
    this.buffer.writeOffset = p1;
    this.buffer.writeUInt16BE(p2 - p1 - 2);
    this.buffer.writeOffset = p2;
  }

  /**
   * Marks position to write 32-bit length value.
   * @method
   * @param {string} name - Field name.
   */
  // eslint-disable-next-line no-unused-vars
  markLength32(name) {
    this.m32.push(this.buffer.writeOffset);
    this.buffer.writeUInt32BE(0);
  }

  /**
   * Writes 32-bit length to top length marker.
   * @method
   */
  writeLength32() {
    const p1 = this.m32.pop();
    const p2 = this.buffer.writeOffset;
    this.buffer.writeOffset = p1;
    this.buffer.writeUInt32BE(p2 - p1 - 4);
    this.buffer.writeOffset = p2;
  }
  //#endregion

  //#region Private Methods
  /**
   * Trim characters from a string.
   * @method
   * @private
   * @param {string} str - The string to trim.
   * @param {Array<string>} chars - The characters to trim from string.
   * @returns {string} Trimmed string.
   */
  _trim(str, chars) {
    let start = 0;
    let end = str.length;
    while (start < end && chars.indexOf(str[start]) >= 0) {
      ++start;
    }
    while (end > start && chars.indexOf(str[end - 1]) >= 0) {
      --end;
    }
    return start > 0 || end < str.length ? str.substring(start, end) : str;
  }
  //#endregion
}
//#endregion

//#region AAssociateRQ
class AAssociateRQ {
  /**
   * Creates an instance of AAssociateRQ.
   * @constructor
   * @param {Association} association - Association information.
   */
  constructor(association) {
    this.association = association;
  }

  /**
   * Gets the association information.
   * @method
   * @returns {Association} Association information.
   */
  getAssociation() {
    return this.association;
  }

  /**
   * Writes A-ASSOCIATE-RQ to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x01);

    pdu.writeUInt16('Version', 0x0001);
    pdu.writeByteMultiple('Reserved', 0x00, 2);
    pdu.writeStringWithPadding('Called AE', this.association.getCalledAeTitle(), 16, ' ');
    pdu.writeStringWithPadding('Calling AE', this.association.getCallingAeTitle(), 16, ' ');
    pdu.writeByteMultiple('Reserved', 0x00, 32);

    // Application Context
    pdu.writeByte('Item-Type', 0x10);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Application Context Name', this.association.getApplicationContextName());
    pdu.writeLength16();

    const contexts = this.association.getPresentationContexts();
    contexts.forEach(pc => {
      const context = this.association.getPresentationContext(pc.id);
      // Presentation Context
      pdu.writeByte('Item-Type', 0x20);
      pdu.writeByte('Reserved', 0x00);
      pdu.markLength16('Item-Length');
      pdu.writeByte('Presentation Context ID', context.getPresentationContextId());
      pdu.writeByteMultiple('Reserved', 0x00, 3);

      // Abstract Syntax
      pdu.writeByte('Item-Type', 0x30);
      pdu.writeByte('Reserved', 0x00);
      pdu.markLength16('Item-Length');
      pdu.writeString('Abstract Syntax UID', context.getAbstractSyntaxUid());
      pdu.writeLength16();

      // Transfer Syntaxes
      const syntaxes = context.getTransferSyntaxUids();
      syntaxes.forEach(tx => {
        pdu.writeByte('Item-Type', 0x40);
        pdu.writeByte('Reserved', 0x00);
        pdu.markLength16('Item-Length');
        pdu.writeString('Transfer Syntax UID', tx);
        pdu.writeLength16();
      });

      pdu.writeLength16();
    });

    // User Data Fields
    pdu.writeByte('Item-Type', 0x50);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');

    // Maximum PDU
    pdu.writeByte('Item-Type', 0x51);
    pdu.writeByte('Reserved', 0x00);
    pdu.writeUInt16('Item-Length', 0x0004);
    pdu.writeUInt32('Max PDU Length', this.association.getMaxPduLength());

    // Implementation Class UID
    pdu.writeByte('Item-Type', 0x52);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Implementation Class UID', this.association.getImplementationClassUid());
    pdu.writeLength16();

    // Implementation Version
    pdu.writeByte('Item-Type', 0x55);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Implementation Version', this.association.getImplementationVersion());
    pdu.writeLength16();

    pdu.writeLength16();

    return pdu;
  }

  /**
   * Reads A-ASSOCIATE-RQ from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    let l = pdu.getLength() - 6;

    pdu.readUInt16('Version');
    pdu.skipBytes('Reserved', 2);
    this.association.setCalledAeTitle(pdu.readString('Called AE', 16));
    this.association.setCallingAeTitle(pdu.readString('Calling AE', 16));
    pdu.skipBytes('Reserved', 32);
    l -= 2 + 2 + 16 + 16 + 32;

    while (l > 0) {
      const type = pdu.readByte('Item-Type');
      pdu.skipBytes('Reserved', 1);
      let il = pdu.readUInt16('Item-Length');

      l -= 4 + il;
      if (type === 0x10) {
        // Application Context
        pdu.skipBytes('Application Context', il);
      } else if (type === 0x20) {
        // Presentation Context
        const id = pdu.readByte('Presentation Context ID');
        pdu.skipBytes('Reserved', 3);
        il -= 4;

        while (il > 0) {
          const pt = pdu.readByte('Presentation Context Item-Type');
          pdu.skipBytes('Reserved', 1);
          const pl = pdu.readUInt16('Presentation Context Item-Length');
          const sx = pdu.readString('Presentation Context Syntax UID', pl);
          if (pt === 0x30) {
            this.association.addPresentationContext(sx, id);
          } else if (pt === 0x40) {
            this.association.addTransferSyntaxToPresentationContext(id, sx);
          }
          il -= 4 + pl;
        }
      } else if (type === 0x50) {
        // User Information
        while (il > 0) {
          const ut = pdu.readByte('User Information Item-Type');
          pdu.skipBytes('Reserved', 1);
          const ul = pdu.readUInt16('User Information Item-Length');
          il -= 4 + ul;
          if (ut == 0x51) {
            this.association.setMaxPduLength(pdu.readUInt32('Max PDU Length'));
          } else if (ut === 0x52) {
            this.association.setImplementationClassUid(
              pdu.readString('Implementation Class UID', ul)
            );
          } else if (ut === 0x55) {
            this.association.setImplementationVersion(pdu.readString('Implementation Version', ul));
          } else {
            pdu.skipBytes('Unhandled User Item', ul);
          }
        }
      }
    }
  }
}
//#endregion

//#region AAssociateAC
class AAssociateAC {
  /**
   * Creates an instance of AAssociateAC.
   * @constructor
   * @param {Association} association - Association information.
   */
  constructor(association) {
    this.association = association;
  }

  /**
   * Gets the association information.
   * @method
   * @returns {Association} Association information.
   */
  getAssociation() {
    return this.association;
  }

  /**
   * Writes A-ASSOCIATE-AC to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x02);

    pdu.writeUInt16('Version', 0x0001);
    pdu.writeByteMultiple('Reserved', 0x00, 2);
    pdu.writeStringWithPadding('Called AE', this.association.getCalledAeTitle(), 16, ' ');
    pdu.writeStringWithPadding('Calling AE', this.association.getCallingAeTitle(), 16, ' ');
    pdu.writeByteMultiple('Reserved', 0x00, 32);

    // Application Context
    pdu.writeByte('Item-Type', 0x10);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Application Context Name', this.association.getApplicationContextName());
    pdu.writeLength16();

    const contexts = this.association.getPresentationContexts();
    contexts.forEach(pc => {
      const context = this.association.getPresentationContext(pc.id);

      // Presentation Context
      pdu.writeByte('Item-Type', 0x21);
      pdu.writeByte('Reserved', 0x00);
      pdu.markLength16('Item-Length');
      pdu.writeByte('Presentation Context ID', context.getPresentationContextId());
      pdu.writeByte('Reserved', 0x00);
      pdu.writeByte('Result', context.getResult());
      pdu.writeByte('Reserved', 0x00);

      // Transfer Syntax (set to Implicit VR Little Endian if no accepted transfer syntax is defined)
      pdu.writeByte('Item-Type', 0x40);
      pdu.writeByte('Reserved', 0x00);
      pdu.markLength16('Item-Length');
      pdu.writeString(
        'Transfer Syntax UID',
        context.getAcceptedTransferSyntaxUid() || TransferSyntax.ImplicitVRLittleEndian
      );
      pdu.writeLength16();

      pdu.writeLength16();
    });

    // User Data Fields
    pdu.writeByte('Item-Type', 0x50);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');

    // Maximum PDU
    pdu.writeByte('Item-Type', 0x51);
    pdu.writeByte('Reserved', 0x00);
    pdu.writeUInt16('Item-Length', 0x0004);
    pdu.writeUInt32('Max PDU Length', this.association.getMaxPduLength());

    // Implementation Class UID
    pdu.writeByte('Item-Type', 0x52);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Implementation Class UID', this.association.getImplementationClassUid());
    pdu.writeLength16();

    // Implementation Version
    pdu.writeByte('Item-Type', 0x55);
    pdu.writeByte('Reserved', 0x00);
    pdu.markLength16('Item-Length');
    pdu.writeString('Implementation Version', this.association.getImplementationVersion());
    pdu.writeLength16();

    pdu.writeLength16();

    return pdu;
  }

  /**
   * Reads A-ASSOCIATE-AC from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    let l = pdu.getLength() - 6;

    pdu.readUInt16('Version');
    pdu.skipBytes('Reserved', 2);
    pdu.skipBytes('Reserved', 16);
    pdu.skipBytes('Reserved', 16);
    pdu.skipBytes('Reserved', 32);
    l -= 68;

    while (l > 0) {
      const type = pdu.readByte('Item-Type');
      l -= 1;

      if (type === 0x10) {
        // Application Context
        pdu.skipBytes('Reserved', 1);
        const c = pdu.readUInt16('Item-Length');
        pdu.skipBytes('Value', c);
        l -= 3 + c;
      } else if (type === 0x21) {
        // Presentation Context
        pdu.readByte('Reserved');
        let pl = pdu.readUInt16('Presentation Context Item-Length');
        const id = pdu.readByte('Presentation Context ID');
        pdu.readByte('Reserved');
        const res = pdu.readByte('Presentation Context Result/Reason');
        pdu.readByte('Reserved');
        l -= pl + 3;
        pl -= 4;

        if (res === 0) {
          // Accept
          // Presentation Context Transfer Syntax
          pdu.readByte('Presentation Context Item-Type (0x40)');
          pdu.readByte('Reserved');
          const tl = pdu.readUInt16('Presentation Context Item-Length');
          const tx = pdu.readString('Presentation Context Syntax UID', tl);
          pl -= tl + 4;

          const context = this.association.getPresentationContext(id);
          context.setResult(res, tx);
        } else {
          pdu.skipBytes('Rejected Presentation Context', pl);

          const context = this.association.getPresentationContext(id);
          context.setResult(res);
        }
      } else if (type === 0x50) {
        // User Information
        pdu.readByte('Reserved');
        let il = pdu.readUInt16('User Information Item-Length');
        l -= il + 3;
        while (il > 0) {
          const ut = pdu.readByte('User Item-Type');
          pdu.readByte('Reserved');
          const ul = pdu.readUInt16('User Item-Length');
          il -= ul + 4;
          if (ut === 0x51) {
            this.association.setMaxPduLength(pdu.readUInt32('Max PDU Length'));
          } else if (ut === 0x52) {
            this.association.setImplementationClassUid(
              pdu.readString('Implementation Class UID', ul)
            );
          } else if (ut === 0x55) {
            this.association.setImplementationVersion(pdu.readString('Implementation Version', ul));
          } else {
            pdu.skipBytes('User Item Value', ul);
          }
        }
      } else {
        pdu.skipBytes('Reserved', 1);
        const il = pdu.readUInt16('User Item-Length');
        pdu.skipBytes('Unknown User Item', il);
        l -= il + 3;
      }
    }
  }
}
//#endregion

//#region AAssociateRJ
class AAssociateRJ {
  /**
   * Creates an instance of AAssociateRJ.
   * @constructor
   * @param {number} [result] - Rejection result.
   * @param {number} [source] - Rejection source.
   * @param {number} [source] - Rejection reason.
   */
  constructor(result, source, reason) {
    this.result = result || RejectResult.Permanent;
    this.source = source || RejectSource.ServiceUser;
    this.reason = reason || RejectReason.NoReasonGiven;
  }

  /**
   * Gets the rejection result.
   * @method
   * @returns {number} Rejection result.
   */
  getResult() {
    return this.result;
  }

  /**
   * Gets the rejection source.
   * @method
   * @returns {number} Rejection source.
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the rejection reason.
   * @method
   * @returns {number} Rejection reason.
   */
  getReason() {
    return this.reason;
  }

  /**
   * Writes A-ASSOCIATE-RJ to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x03);

    pdu.writeByte('Reserved', 0x00);
    pdu.writeByte('Result', this.result);
    pdu.writeByte('Source', this.source);
    pdu.writeByte('Reason', this.reason);

    return pdu;
  }
  /**
   * Reads A-ASSOCIATE-RJ from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    pdu.readByte('Reserved');
    this.result = pdu.readByte('Result');
    this.source = pdu.readByte('Source');
    this.reason = pdu.readByte('Reason');
  }
}
//#endregion

//#region AReleaseRQ
class AReleaseRQ {
  /**
   * Creates an instance of AReleaseRQ.
   * @constructor
   */
  constructor() {}

  /**
   * Writes A-RELEASE-RQ to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x05);

    pdu.writeUInt32('Reserved', 0x00000000);

    return pdu;
  }
  /**
   * Reads A-RELEASE-RQ from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    pdu.readUInt32('Reserved');
  }
}
//#endregion

//#region AReleaseRP
class AReleaseRP {
  /**
   * Creates an instance of AReleaseRP.
   * @constructor
   */
  constructor() {}

  /**
   * Writes A-RELEASE-RP to PDU buffer.
   * @method
   * @returns {RawPdu} PDU buffer.
   */
  write() {
    const pdu = new RawPdu(0x06);

    pdu.writeUInt32('Reserved', 0x00000000);

    return pdu;
  }
  /**
   * Reads A-RELEASE-RP from PDU buffer.
   * @method
   * @param {RawPdu} PDU buffer.
   */
  read(pdu) {
    pdu.readUInt32('Reserved');
  }
}
//#endregion

//#region AAbort
class AAbort {
  /**
   * Creates an instance of AAbort.
   * @constructor
   * @param {number} [source] - Rejection source.
   * @param {number} [reason] - Rejection reason.
   */
  constructor(source, reason) {
    this.source = source || AbortSource.ServiceUser;
    this.reason = reason || AbortReason.NotSpecified;
  }

  /**
   * Gets the abort source.
   * @method
   * @returns {number} Abort source.
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the abort reason.
   * @method
   * @returns {number} Abort reason.
   */
  getReason() {
    return this.reason;
  }

  /**
   * Writes A-ABORT to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x07);

    pdu.writeByte('Reserved', 0x00);
    pdu.writeByte('Reserved', 0x00);
    pdu.writeByte('Source', this.source);
    pdu.writeByte('Reason', this.reason);

    return pdu;
  }

  /**
   * Reads A-ABORT from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    pdu.readByte('Reserved');
    pdu.readByte('Reserved');
    this.source = pdu.readByte('Source');
    this.reason = pdu.readByte('Reason');
  }
}
//#endregion

//#region Pdv
class Pdv {
  /**
   * Creates an instance of Pdv.
   * @constructor
   * @param {number} pcId - Presentation context ID.
   * @param {Buffer} value - PDV data.
   * @param {boolean} command - Is command.
   * @param {boolean} last - Is last fragment of command or data.
   */
  constructor(pcId, value, command, last) {
    this.pcId = pcId;
    this.value = value;
    this.command = command;
    this.last = last;
  }

  /**
   * Gets the presentation context ID.
   * @method
   * @returns {number} Presentation context ID.
   */
  getPresentationContextId() {
    return this.pcId;
  }

  /**
   * Gets the PDV data.
   * @method
   * @returns {Buffer} PDV data.
   */

  getValue() {
    return this.value;
  }

  /**
   * Gets whether PDV is command.
   * @method
   * @returns {boolean} Is command.
   */
  isCommand() {
    return this.command;
  }

  /**
   * Gets whether PDV is last fragment of command or data.
   * @method
   * @returns {boolean} Is last fragment.
   */
  isLastFragment() {
    return this.last;
  }

  /**
   * Gets the PDV length.
   * @method
   * @returns {number} PDV length.
   */
  getLength() {
    return this.value.length + 6;
  }

  /**
   * Writes PDV to PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  write(pdu) {
    const mch = (this.last ? 2 : 0) + (this.command ? 1 : 0);
    pdu.markLength32('PDV-Length');
    pdu.writeByte('Presentation Context ID', this.pcId);
    pdu.writeByte('Message Control Header', mch);
    pdu.writeBytes('PDV Value', this.value);
    pdu.writeLength32();
  }

  /**
   * Reads PDV from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    const len = pdu.readUInt32('PDV-Length');
    this.pcId = pdu.readByte('Presentation Context ID');
    const mch = pdu.readByte('Message Control Header');
    this.value = pdu.readBytes('PDV Value', len - 2);
    this.command = (mch & 0x01) !== 0;
    this.last = (mch & 0x02) !== 0;

    return len + 4;
  }
}
//#endregion

//#region PDataTF
class PDataTF {
  /**
   * Creates an instance of PDataTF.
   * @constructor
   */
  constructor() {
    this.pdvs = [];
  }

  /**
   * Gets PDVs in P-DATA-TF.
   * @method
   * @returns {Array<Pdv>} PDVs in this P-DATA-TF.
   */
  getPdvs() {
    return this.pdvs;
  }

  /**
   * Gets PDV count in P-DATA-TF.
   * @method
   * @returns {number} PDV count.
   */
  getPdvCount() {
    return this.pdvs.length;
  }

  /**
   * Adds a PDV in P-DATA-TF.
   * @method
   * @param {Pdv} pdv - PDV.
   */
  addPdv(pdv) {
    return this.pdvs.push(pdv);
  }

  /**
   * Clears all PDVs in P-DATA-TF.
   * @method
   */
  clearPdvs() {
    this.pdvs.length = 0;
  }

  /**
   * Gets the total length of the PDVs in P-DATA-TF.
   * @method
   * @returns {number} Length of PDVs.
   */
  getLengthOfPdvs() {
    let len = 0;
    this.pdvs.forEach(pdv => {
      len += pdv.getLength();
    });
    return len;
  }

  /**
   * Writes P-DATA-TF to PDU.
   * @method
   * @returns {RawPdu} PDU.
   */
  write() {
    const pdu = new RawPdu(0x04);
    this.pdvs.forEach(pdv => {
      pdv.write(pdu);
    });
    return pdu;
  }

  /**
   * Reads P-DATA-TF from PDU.
   * @method
   * @param {RawPdu} PDU.
   */
  read(pdu) {
    const len = pdu.getLength();
    let read = 0;
    while (read < len) {
      const pdv = new Pdv();
      read += pdv.read(pdu);
      this.pdvs.push(pdv);
    }
  }
}
//#endregion

//#region Exports
module.exports = {
  RawPdu,
  AAssociateRQ,
  AAssociateAC,
  AAssociateRJ,
  AReleaseRQ,
  AReleaseRP,
  AAbort,
  Pdv,
  PDataTF
};
//#endregion
