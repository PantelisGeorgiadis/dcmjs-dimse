const { StorageClass, TransferSyntax } = require('./Constants');
const Implementation = require('./Implementation');

const { readFile, readFileSync, writeFile, writeFileSync } = require('fs');
const { EOL } = require('os');
const dcmjs = require('dcmjs');
const { DicomDict, DicomMessage, DicomMetaDictionary, ReadBufferStream, WriteBufferStream } =
  dcmjs.data;
const dcmjsLog = dcmjs.log;

//#region Dataset
class Dataset {
  /**
   * Creates an instance of Dataset.
   * @constructor
   * @param {Object|Buffer} [elementsOrBuffer] - Dataset elements as object or encoded as a DICOM dataset buffer.
   * @param {string} [transferSyntaxUid] - Dataset transfer syntax UID.
   * @param {Object} [readOptions] - The read options to pass through to `DicomMessage._read()`.
   * @param {Object} [options] - Additional dataset options.
   * @param {boolean} [options.retainSourceBuffer] - When true and `elementsOrBuffer` is a Buffer,
   * keeps a reference to the original encoded dataset buffer so it can be reused by `toFile()`
   * without re-serializing the elements. The retained buffer is automatically dropped on any
   * mutating operation (`setElement`, `setTransferSyntaxUid` with a different syntax).
   */
  constructor(elementsOrBuffer, transferSyntaxUid, readOptions, options) {
    readOptions = readOptions || {};
    const baseOptions = { ignoreErrors: true };
    readOptions = { ...baseOptions, ...readOptions };

    dcmjsLog.level = 'error';

    this.sourceElementsBuffer = undefined;
    this.sourceTransferSyntaxUid = undefined;

    this.transferSyntaxUid = transferSyntaxUid || TransferSyntax.ImplicitVRLittleEndian;
    if (Buffer.isBuffer(elementsOrBuffer)) {
      if (options && options.retainSourceBuffer) {
        this.sourceElementsBuffer = elementsOrBuffer;
        this.sourceTransferSyntaxUid = this.transferSyntaxUid;
      }
      this.elements = this._fromElementsBuffer(
        elementsOrBuffer,
        this.transferSyntaxUid,
        readOptions
      );
      return;
    }

    this.elements = elementsOrBuffer || {};
  }

  /**
   * Gets element value.
   * @method
   * @param {string} tag - Element tag.
   * @returns {string|undefined} Element value or undefined if element doesn't exist.
   */
  getElement(tag) {
    return this.elements[tag];
  }

  /**
   * Sets element value.
   * @method
   * @param {string} tag - Element tag.
   * @param {string} value - Element value.
   */
  setElement(tag, value) {
    this.elements[tag] = value;
    this.sourceElementsBuffer = undefined;
    this.sourceTransferSyntaxUid = undefined;
  }

  /**
   * Gets all elements.
   * @method
   * @returns {Object} Elements.
   */
  getElements() {
    return this.elements;
  }

  /**
   * Gets DICOM transfer syntax UID.
   * @method
   * @returns {string} Transfer syntax UID.
   */
  getTransferSyntaxUid() {
    return this.transferSyntaxUid;
  }

  /**
   * Sets DICOM transfer syntax UID.
   * @method
   * @param {string} transferSyntaxUid - Transfer Syntax UID.
   */
  setTransferSyntaxUid(transferSyntaxUid) {
    if (this.transferSyntaxUid !== transferSyntaxUid) {
      this.sourceElementsBuffer = undefined;
      this.sourceTransferSyntaxUid = undefined;
    }
    this.transferSyntaxUid = transferSyntaxUid;
  }

  /**
   * Gets elements encoded in a DICOM dataset buffer.
   * @method
   * @param {Object} [writeOptions] - The write options to pass through to `DicomMessage.write()`.
   * @param {Object} [nameMap] - Additional DICOM tags to recognize when denaturalizing the dataset.
   * @returns {Buffer} DICOM dataset.
   */
  getDenaturalizedDataset(writeOptions, nameMap) {
    const denaturalizedDataset = nameMap
      ? DicomMetaDictionary.denaturalizeDataset(this.getElements(), {
          ...DicomMetaDictionary.nameMap,
          ...nameMap,
        })
      : DicomMetaDictionary.denaturalizeDataset(this.getElements());

    const stream = new WriteBufferStream();
    DicomMessage.write(denaturalizedDataset, stream, this.transferSyntaxUid, writeOptions);

    return Buffer.from(stream.getBuffer());
  }

  /**
   * Gets command elements encoded in a DICOM dataset buffer.
   * @method
   * @param {Object} [writeOptions] - The write options to pass through to `DicomMessage.write()` and `DicomMessage.writeTagObject()`.
   * @returns {Buffer} DICOM dataset.
   */
  getDenaturalizedCommandDataset(writeOptions) {
    const denaturalizedDataset = DicomMetaDictionary.denaturalizeDataset(this.getElements());

    const datasetStream = new WriteBufferStream();
    const elementsStream = new WriteBufferStream();
    DicomMessage.write(
      denaturalizedDataset,
      elementsStream,
      TransferSyntax.ImplicitVRLittleEndian,
      writeOptions
    );
    DicomMessage.writeTagObject(
      datasetStream,
      '00000000',
      'UL',
      elementsStream.size,
      TransferSyntax.ImplicitVRLittleEndian,
      writeOptions
    );
    datasetStream.concat(elementsStream);

    return Buffer.from(datasetStream.getBuffer());
  }

  /**
   * Loads a dataset from DICOM P10 file.
   * @method
   * @static
   * @param {string} path - P10 file path.
   * @param {function(Error, Dataset)} [callback] - P10 file reading callback function.
   * If this is not provided, the function runs synchronously.
   * @param {Object} [readOptions] - The read options to pass through to `DicomMessage.readFile()`.
   * @returns {Dataset|undefined} Dataset or undefined, if the function runs asynchronously.
   */
  static fromFile(path, callback, readOptions) {
    if (callback !== undefined && callback instanceof Function) {
      readFile(path, (error, fileBuffer) => {
        if (error) {
          callback(error, undefined);
          return;
        }

        try {
          callback(undefined, this._fromP10Buffer(fileBuffer, readOptions));
        } catch (err) {
          callback(err, undefined);
        }
      });
      return;
    }

    return this._fromP10Buffer(readFileSync(path), readOptions);
  }

  /**
   * Saves a dataset to DICOM P10 file.
   * @method
   * @param {string} path - P10 file path.
   * @param {function(Error)} [callback] - P10 file writing callback function.
   * If this is not provided, the function runs synchronously.
   * @param {Object} [nameMap] - Additional DICOM tags to recognize when denaturalizing the
   * dataset. Can be used to support writing private fields/tags.
   * @param {Object} [writeOptions] - The write options to pass through to `DicomDict.write()`.
   */
  toFile(path, callback, nameMap, writeOptions) {
    const meta = {
      FileMetaInformationVersion: new Uint8Array([0, 1]).buffer,
      MediaStorageSOPClassUID:
        this.getElement('SOPClassUID') || StorageClass.SecondaryCaptureImageStorage,
      MediaStorageSOPInstanceUID: this.getElement('SOPInstanceUID') || Dataset.generateDerivedUid(),
      TransferSyntaxUID: this.getTransferSyntaxUid(),
      ImplementationClassUID: Implementation.getImplementationClassUid(),
      ImplementationVersionName: Implementation.getImplementationVersion(),
    };

    // Fast path: when a retained source elements buffer is available and still valid,
    // skip the full denaturalize/serialize round-trip and write the original wire bytes
    // verbatim, prepended with a freshly built P10 preamble + DICM + file meta header.
    if (
      !nameMap &&
      this.sourceElementsBuffer &&
      this.sourceTransferSyntaxUid === this.transferSyntaxUid
    ) {
      const fileBuffer = this._buildP10FileBufferFromSource(meta, writeOptions);
      if (callback instanceof Function) {
        writeFile(path, fileBuffer, (error) => {
          callback(error ? error : undefined);
          return;
        });
      } else {
        writeFileSync(path, fileBuffer);
      }
      return;
    }

    const elements = {
      _meta: meta,
      ...this.getElements(),
    };
    const denaturalizedMetaHeader = DicomMetaDictionary.denaturalizeDataset(elements._meta);
    const dicomDict = new DicomDict(denaturalizedMetaHeader);

    dicomDict.dict = nameMap
      ? DicomMetaDictionary.denaturalizeDataset(elements, {
          ...DicomMetaDictionary.nameMap,
          ...nameMap,
        })
      : DicomMetaDictionary.denaturalizeDataset(elements);

    if (callback instanceof Function) {
      writeFile(path, Buffer.from(dicomDict.write(writeOptions)), (error) => {
        callback(error ? error : undefined);
        return;
      });
    } else {
      writeFileSync(path, Buffer.from(dicomDict.write(writeOptions)));
    }
  }

  /**
   * Generates a UUID-derived UID.
   * @method
   * @static
   * @returns {string} UUID-derived UID.
   */
  static generateDerivedUid() {
    return DicomMetaDictionary.uid();
  }

  /**
   * Gets the dataset description.
   * @method
   * @returns {string} Dataset description.
   */
  toString() {
    const str = [];
    str.push('Dataset:');
    str.push('='.repeat(50));
    str.push(JSON.stringify(this.getElements()));

    return str.join(EOL);
  }

  //#region Private Methods
  /**
   * Creates a dataset from p10 buffer.
   * @method
   * @static
   * @private
   * @param {Buffer} buffer - p10 buffer.
   * @param {Object} [readOptions] - The read options to pass through to `DicomMessage.readFile()`.
   * @returns {Dataset} Dataset.
   */
  static _fromP10Buffer(buffer, readOptions) {
    readOptions = readOptions || {};
    const baseOptions = { ignoreErrors: true };
    readOptions = { ...baseOptions, ...readOptions };

    const dicomDict = DicomMessage.readFile(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      readOptions
    );
    const meta = DicomMetaDictionary.naturalizeDataset(dicomDict.meta);
    const transferSyntaxUid = meta.TransferSyntaxUID;
    const elements = DicomMetaDictionary.naturalizeDataset(dicomDict.dict);

    return new Dataset(elements, transferSyntaxUid);
  }

  /**
   * Loads a dataset from elements only buffer.
   * @method
   * @private
   * @param {Buffer} buffer - Elements buffer.
   * @param {string} transferSyntaxUid - Transfer Syntax UID.
   * @param {Object} [readOptions] - The read options to pass through to `DicomMessage._read()`.
   * @returns {Object} Dataset elements.
   */
  _fromElementsBuffer(buffer, transferSyntaxUid, readOptions) {
    const stream = new ReadBufferStream(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    );
    // Use the proper encoding and endianness (based on transfer syntax UID)
    // since dcmjs doesn't do that internally.
    const syntaxTypeToDecode =
      transferSyntaxUid === TransferSyntax.ImplicitVRLittleEndian
        ? TransferSyntax.ImplicitVRLittleEndian
        : transferSyntaxUid === TransferSyntax.ExplicitVRBigEndian
          ? TransferSyntax.ExplicitVRBigEndian
          : TransferSyntax.ExplicitVRLittleEndian;
    const denaturalizedDataset = DicomMessage._read(stream, syntaxTypeToDecode, readOptions);

    return DicomMetaDictionary.naturalizeDataset(denaturalizedDataset);
  }

  /**
   * Builds a complete P10 file buffer by concatenating a freshly built preamble
   * + DICM marker + file meta header (in Explicit VR Little Endian) with the
   * retained source elements buffer.
   * @method
   * @private
   * @param {Object} meta - File meta information elements (natural form).
   * @param {Object} [writeOptions] - The write options to pass through to `DicomMessage.write()`.
   * @returns {Buffer} Complete P10 file buffer.
   */
  _buildP10FileBufferFromSource(meta, writeOptions) {
    const denaturalizedMeta = DicomMetaDictionary.denaturalizeDataset(meta);
    const metaStream = new WriteBufferStream();
    DicomMessage.write(
      denaturalizedMeta,
      metaStream,
      TransferSyntax.ExplicitVRLittleEndian,
      writeOptions
    );
    const metaHeader = Buffer.from(metaStream.getBuffer());

    const preamble = Buffer.alloc(128);
    const dicm = Buffer.from('DICM', 'ascii');

    return Buffer.concat(
      [preamble, dicm, metaHeader, this.sourceElementsBuffer],
      preamble.length + dicm.length + metaHeader.length + this.sourceElementsBuffer.length
    );
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Dataset;
//#endregion
