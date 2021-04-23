const { SmartBuffer } = require('smart-buffer');

//#region RawPdu
class RawPdu {
  /**
   * Creates an instance of Pdu for reading or writing PDUs.
   *
   * @param {Number|Buffer} typeOrBuffer - Type of PDU or PDU Buffer.
   * @memberof RawPdu
   */
  constructor(typeOrBuffer) {
    this.m16 = [];
    this.m32 = [];

    if (Buffer.isBuffer(typeOrBuffer)) {
      this.buffer = SmartBuffer.fromBuffer(typeOrBuffer);
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
   *
   * @returns {Number} PDU type.
   * @memberof RawPdu
   */
  getType() {
    return this.type;
  }

  /**
   * Gets the PDU length.
   *
   * @returns {Number} PDU length.
   * @memberof RawPdu
   */
  getLength() {
    return this.buffer.length;
  }

  /**
   * Gets the PDU description.
   *
   * @returns {String} PDU description.
   * @memberof RawPdu
   */
  toString() {
    return `PDU [type=${this.getType()}, length=${this.getLength()}]`;
  }

  /**
   * Resets PDU read buffer.
   *
   * @memberof RawPdu
   */
  reset() {
    this.buffer.readOffset = 0;
    this.buffer.writeOffset = 0;
  }

  /**
   * Reads PDU.
   *
   * @memberof RawPdu
   */
  readPdu() {
    this.buffer.readUInt8();
    const len = this.buffer.readUInt32BE();
    const data = this.buffer.readBuffer(len);
    this.buffer = SmartBuffer.fromBuffer(data);
  }

  /**
   * Writes PDU type and length.
   *
   * @returns {Buffer} PDU buffer with type and length.
   * @memberof RawPdu
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
   *
   * @param {Number} bytes - Number of bytes to read.
   * @param {String} name - Field name to read.
   * @memberof RawPdu
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
   *
   * @param {String} name - Field name to read.
   * @returns {Number} Read byte.
   * @memberof RawPdu
   */
  readByte(name) {
    this.checkOffset(1, name);
    return this.buffer.readUInt8();
  }

  /**
   * Reads bytes from PDU.
   *
   * @param {String} name - Field name to read.
   * @param {Number} count - Number of bytes to read.
   * @returns {Buffer} Read bytes in a buffer.
   * @memberof RawPdu
   */
  readBytes(name, count) {
    this.checkOffset(count, name);
    return this.buffer.readBuffer(count);
  }

  /**
   * Reads unsigned short from PDU.
   *
   * @param {String} name - Field name to read.
   * @returns {Number} Read unsigned short.
   * @memberof RawPdu
   */
  readUInt16(name) {
    this.checkOffset(2, name);
    return this.buffer.readUInt16BE();
  }

  /**
   * Reads unsigned int from PDU.
   *
   * @param {String} name - Field name to read.
   * @returns {Number} Read unsigned int.
   * @memberof RawPdu
   */
  readUInt32(name) {
    this.checkOffset(4, name);
    return this.buffer.readUInt32BE();
  }

  /**
   * Reads string from PDU.
   *
   * @param {String} name - Field name to read.
   * @param {Number} count - Number of bytes to read.
   * @returns {String} Read string.
   * @memberof RawPdu
   */
  readString(name, count) {
    const bytes = this.readBytes(name, count);
    return this._trim(String.fromCharCode.apply(String, bytes), [' ', '\0']);
  }

  /**
   * Skips bytes in PDU.
   *
   * @param {String} name - Field name to skip.
   * @param {Number} count - Number of bytes to skip.
   * @memberof RawPdu
   */
  skipBytes(name, count) {
    this.checkOffset(count, name);
    this.buffer.readOffset += count;
  }
  //#endregion

  //#region Write Methods
  /**
   * Writes byte to PDU.
   *
   * @param {String} name - Field name to write.
   * @param {Number} value - Byte value.
   * @memberof RawPdu
   */
  writeByte(name, value) {
    this.buffer.writeUInt8(value);
  }

  /**
   * Writes byte to PDU multiple times.
   *
   * @param {String} name - Field name to write.
   * @param {Number} value - Byte value.
   * @param {Number} count - Number of times to write PDU value.
   * @memberof RawPdu
   */
  writeByteMultiple(name, value, count) {
    for (let i = 0; i < count; i++) {
      this.writeByte(name, value);
    }
  }

  /**
   * Writes bytes to PDU.
   *
   * @param {String} name - Field name to write.
   * @param {Buffer} value - Byte values.
   * @memberof RawPdu
   */
  writeBytes(name, value) {
    this.buffer.writeBuffer(value);
  }

  /**
   * Writes unsigned short to PDU.
   *
   * @param {String} name - Field name to write.
   * @param {Number} value - Unsigned short value.
   * @memberof RawPdu
   */
  writeUInt16(name, value) {
    this.buffer.writeUInt16BE(value);
  }

  /**
   * Writes unsigned int to PDU.
   *
   * @param {String} name - Field name to write.
   * @param {Number} value - Unsigned int value.
   * @memberof RawPdu
   */
  writeUInt32(name, value) {
    this.buffer.writeUInt32BE(value);
  }

  /**
   * Writes string to PDU.
   *
   * @param {String} name - Field name to write.
   * @param {String} value - String value.
   * @memberof RawPdu
   */
  writeString(name, value) {
    for (let i = 0, len = value.length; i < len; ++i) {
      this.buffer.writeUInt8(value.charCodeAt(i));
    }
  }

  /**
   * Writes string to PDU with padding.
   *
   * @param {String} name - Field name to write.
   * @param {String} value - String value.
   * @param {Number} count - Number of characters to write.
   * @param {String} pad - Padding character.
   * @memberof RawPdu
   */
  writeStringWithPadding(name, value, count, pad) {
    this.writeString(name, value.padEnd(count, pad));
  }

  /**
   * Marks position to write 16-bit length value.
   *
   * @param {String} name - Field name.
   * @memberof RawPdu
   */
  // eslint-disable-next-line no-unused-vars
  markLength16(name) {
    this.m16.push(this.buffer.writeOffset);
    this.buffer.writeUInt16BE(0);
  }

  /**
   * Writes 16-bit length to top length marker.
   *
   * @memberof RawPdu
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
   *
   * @param {String} name - Field name.
   * @memberof RawPdu
   */
  // eslint-disable-next-line no-unused-vars
  markLength32(name) {
    this.m32.push(this.buffer.writeOffset);
    this.buffer.writeUInt32BE(0);
  }

  /**
   * Writes 32-bit length to top length marker.
   *
   * @memberof RawPdu
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
   *
   * @param {String} str - The string to trim.
   * @param {Array} chars - The characters to trim from string.
   * @returns {String} Trimmed string.
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
   *
   * @param {Object} association - Association information.
   * @memberof AAssociateRQ
   */
  constructor(association) {
    this.association = association;
  }

  /**
   * Gets the association information.
   *
   * @returns {Object} Association information.
   * @memberof AAssociateRQ
   */
  getAssociation() {
    return this.association;
  }

  /**
   * Writes A-ASSOCIATE-RQ to PDU.
   *
   * @returns {Object} PDU.
   * @memberof AAssociateRQ
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
   *
   * @param {Object} PDU.
   * @memberof AAssociateRQ
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
   *
   * @param {Object} association - Association information.
   * @memberof AAssociateAC
   */
  constructor(association) {
    this.association = association;
  }

  /**
   * Gets the association information.
   *
   * @returns {Object} Association information.
   * @memberof AAssociateAC
   */
  getAssociation() {
    return this.association;
  }

  /**
   * Writes A-ASSOCIATE-AC to PDU.
   *
   * @returns {Object} PDU.
   * @memberof AAssociateAC
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
        context.getAcceptedTransferSyntaxUid() || '1.2.840.10008.1.2'
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
   *
   * @param {Object} PDU.
   * @memberof AAssociateAC
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
   *
   * @param {Number} result - Rejection result.
   * @param {Number} source - Rejection source.
   * @param {Number} source - Rejection reason.
   * @memberof AAssociateRJ
   */
  constructor(result, source, reason) {
    this.result = result;
    this.source = source;
    this.reason = reason;
    if (!this.result) {
      // Permanent
      this.result = 1;
    }
    if (!this.source) {
      // Service user
      this.source = 1;
    }
    if (!this.reason) {
      // No reason given (Service user)
      this.reason = 1;
    }
  }

  /**
   * Gets the rejection result.
   *
   * @returns {Number} Rejection result.
   * @memberof AAssociateRJ
   */
  getResult() {
    return this.result;
  }

  /**
   * Gets the rejection source.
   *
   * @returns {Number} Rejection source.
   * @memberof AAssociateRJ
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the rejection reason.
   *
   * @returns {Number} Rejection reason.
   * @memberof AAssociateRJ
   */
  getReason() {
    return this.reason;
  }

  /**
   * Writes A-ASSOCIATE-RJ to PDU.
   *
   * @returns {Object} PDU.
   * @memberof AAssociateRJ
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
   *
   * @param {Object} PDU.
   * @memberof AAssociateRJ
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
   *
   * @memberof AReleaseRQ
   */
  constructor() {}

  /**
   * Writes A-RELEASE-RQ to PDU.
   *
   * @returns {Object} PDU.
   * @memberof AReleaseRQ
   */
  write() {
    const pdu = new RawPdu(0x05);

    pdu.writeUInt32('Reserved', 0x00000000);

    return pdu;
  }
  /**
   * Reads A-RELEASE-RQ from PDU.
   *
   * @param {Object} PDU.
   * @memberof AReleaseRQ
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
   *
   * @memberof AReleaseRP
   */
  constructor() {}

  /**
   * Writes A-RELEASE-RP to PDU buffer.
   *
   * @returns {Object} PDU buffer.
   * @memberof AReleaseRP
   */
  write() {
    const pdu = new RawPdu(0x06);

    pdu.writeUInt32('Reserved', 0x00000000);

    return pdu;
  }
  /**
   * Reads A-RELEASE-RP from PDU buffer.
   *
   * @param {Object} PDU buffer.
   * @memberof AReleaseRP
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
   *
   * @param {Number} source - Rejection source.
   * @param {Number} reason - Rejection reason.
   * @memberof AAbort
   */
  constructor(source, reason) {
    this.source = source;
    this.reason = reason;
    if (!this.source) {
      // Service user
      this.source = 1;
    }
    if (!this.reason) {
      // Not specified
      this.reason = 0;
    }
  }

  /**
   * Gets the abort source.
   *
   * @returns {Number} Abort source.
   * @memberof AAbort
   */
  getSource() {
    return this.source;
  }

  /**
   * Gets the abort reason.
   *
   * @returns {Number} Abort reason.
   * @memberof AAbort
   */
  getReason() {
    return this.reason;
  }

  /**
   * Writes A-ABORT to PDU.
   *
   * @returns {Object} PDU.
   * @memberof AAbort
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
   *
   * @param {Object} PDU.
   * @memberof AAbort
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
   *
   * @param {Number} pcId - Presentation context ID.
   * @param {Buffer} value - PDV data.
   * @param {Boolean} command - Is command.
   * @param {Boolean} last - Is last fragment of command or data.
   * @memberof Pdv
   */
  constructor(pcId, value, command, last) {
    this.pcId = pcId;
    this.value = value;
    this.command = command;
    this.last = last;
  }

  /**
   * Gets the presentation context ID.
   *
   * @returns {Number} Presentation context ID.
   * @memberof Pdv
   */
  getPresentationContextId() {
    return this.pcId;
  }

  /**
   * Gets the PDV data.
   *
   * @returns {Buffer} PDV data.
   * @memberof Pdv
   */

  getValue() {
    return this.value;
  }

  /**
   * Gets whether PDV is command.
   *
   * @returns {Boolean} Is command.
   * @memberof Pdv
   */
  isCommand() {
    return this.command;
  }

  /**
   * Gets whether PDV is last fragment of command or data.
   *
   * @returns {Boolean} Is last fragment.
   * @memberof Pdv
   */
  isLastFragment() {
    return this.last;
  }

  /**
   * Gets the PDV length.
   *
   * @returns {Number} PDV length.
   * @memberof Pdv
   */
  getLength() {
    return this.value.length + 6;
  }

  /**
   * Writes PDV to PDU.
   *
   * @param {Object} PDU.
   * @memberof Pdv
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
   *
   * @param {Object} PDU.
   * @memberof Pdv
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
   *
   * @memberof PDataTF
   */
  constructor() {
    this.pdvs = [];
  }

  /**
   * Gets PDVs in P-DATA-TF.
   *
   * @returns {Array} PDVs in this P-DATA-TF.
   * @memberof PDataTF
   */
  getPdvs() {
    return this.pdvs;
  }

  /**
   * Gets PDV count in P-DATA-TF.
   *
   * @returns {Number} PDV count.
   * @memberof PDataTF
   */
  getPdvCount() {
    return this.pdvs.length;
  }

  /**
   * Adds a PDV in P-DATA-TF.
   *
   * @param {Object} pdv - PDV.
   * @memberof PDataTF
   */
  addPdv(pdv) {
    return this.pdvs.push(pdv);
  }

  /**
   * Gets the total length of the PDVs in P-DATA-TF.
   *
   * @returns {Number} Length of PDVs.
   * @memberof PDataTF
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
   *
   * @returns {Object} PDU.
   * @memberof PDataTF
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
   *
   * @param {Object} PDU.
   * @memberof PDataTF
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
