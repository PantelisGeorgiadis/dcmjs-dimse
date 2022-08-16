const { TransferSyntax, StorageClass } = require('./Constants');
const Implementation = require('./Implementation');

const { readFile, readFileSync, writeFile, writeFileSync } = require('fs');
const { EOL } = require('os');
const dcmjs = require('dcmjs');
const { DicomMetaDictionary, DicomDict, DicomMessage, ReadBufferStream, WriteBufferStream } =
  dcmjs.data;
const dcmjsLog = dcmjs.log;

//#region Dataset
class Dataset {
  /**
   * Creates an instance of Dataset.
   * @constructor
   * @param {Object|Buffer} [elementsOrBuffer] - Dataset elements as object or encoded as a DICOM dataset buffer.
   * @param {string} [transferSyntaxUid] - Dataset transfer syntax
   */
  constructor(elementsOrBuffer, transferSyntaxUid) {
    dcmjsLog.level = 'error';

    this.transferSyntaxUid = transferSyntaxUid || TransferSyntax.ImplicitVRLittleEndian;
    if (Buffer.isBuffer(elementsOrBuffer)) {
      this.elements = this._fromElementsBuffer(elementsOrBuffer, this.transferSyntaxUid);
      return;
    }

    this.elements = elementsOrBuffer || {};
  }

  /**
   * Gets element value.
   * @method
   * @param {string} tag - Element tag.
   * @returns {string} Element value.
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
    this.transferSyntaxUid = transferSyntaxUid;
  }

  /**
   * Gets elements encoded in a DICOM dataset buffer.
   * @method
   * @returns {Buffer} DICOM dataset.
   */
  getDenaturalizedDataset() {
    const denaturalizedDataset = DicomMetaDictionary.denaturalizeDataset(this.getElements());
    const stream = new WriteBufferStream();
    DicomMessage.write(denaturalizedDataset, stream, this.transferSyntaxUid, {});

    return Buffer.from(stream.getBuffer());
  }

  /**
   * Gets elements encoded in a DICOM dataset buffer meant for a command.
   * @method
   * @returns {Buffer} DICOM dataset.
   */
  getDenaturalizedCommandDataset() {
    const denaturalizedDataset = DicomMetaDictionary.denaturalizeDataset(this.getElements());

    const datasetStream = new WriteBufferStream();
    const elementsStream = new WriteBufferStream();
    DicomMessage.write(
      denaturalizedDataset,
      elementsStream,
      TransferSyntax.ImplicitVRLittleEndian,
      {}
    );
    DicomMessage.writeTagObject(
      datasetStream,
      '00000000',
      'UL',
      elementsStream.size,
      TransferSyntax.ImplicitVRLittleEndian,
      {}
    );
    datasetStream.concat(elementsStream);

    return Buffer.from(datasetStream.getBuffer());
  }

  /**
   * Loads a dataset from p10 file.
   * @method
   * @static
   * @param {string} path - P10 file path.
   * @param {function(Error, Dataset)} [callback] - P10 file reading callback function.
   * If this is not provided, the function runs synchronously.
   * @param {object} [readOptions] - The read options to pass through to `DicomMessage.readFile()`.
   * @returns {Dataset|undefined} Dataset or undefined, if the function runs asynchronously.
   */
  static fromFile(path, callback, readOptions) {
    if (callback !== undefined && callback instanceof Function) {
      readFile(path, (error, fileBuffer) => {
        if (error) {
          callback(error, undefined);
          return;
        }
        callback(undefined, this._fromP10Buffer(fileBuffer, readOptions));
      });
      return;
    }

    return this._fromP10Buffer(readFileSync(path), readOptions);
  }

  /**
   * Saves a dataset to p10 file.
   * @method
   * @param {string} path - P10 file path.
   * @param {function(Error)} [callback] - P10 file writing callback function.
   * If this is not provided, the function runs synchronously.
   * @param {Object} [nameMap] - Additional DICOM tags to recognize when denaturalizing the
   * dataset. Can be used to support writing private fields/tags.
   * @param {object} [writeOptions] - The write options to pass through to `DicomDict.write()`.
   */
  toFile(path, callback, nameMap, writeOptions) {
    const elements = {
      _meta: {
        FileMetaInformationVersion: new Uint8Array([0, 1]).buffer,
        MediaStorageSOPClassUID:
          this.getElement('SOPClassUID') || StorageClass.SecondaryCaptureImageStorage,
        MediaStorageSOPInstanceUID:
          this.getElement('SOPInstanceUID') || Dataset.generateDerivedUid(),
        TransferSyntaxUID: this.getTransferSyntaxUid(),
        ImplementationClassUID: Implementation.getImplementationClassUid(),
        ImplementationVersionName: Implementation.getImplementationVersion(),
      },
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
      writeFile(path, Buffer.from(dicomDict.write(writeOptions)), callback);
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
   * @private
   * @param {Buffer} buffer - p10 buffer.
   * @param {object} [readOptions] - The read options to pass through to `DicomMessage.readFile()`.
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
   * @returns {Object} Dataset elements.
   */
  _fromElementsBuffer(buffer, transferSyntaxUid) {
    const stream = new ReadBufferStream(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    );
    // Use the proper syntax length (based on transfer syntax UID)
    // since dcmjs doesn't do that internally.
    let syntaxLengthTypeToDecode =
      transferSyntaxUid === TransferSyntax.ImplicitVRLittleEndian
        ? TransferSyntax.ImplicitVRLittleEndian
        : TransferSyntax.ExplicitVRLittleEndian;
    const denaturalizedDataset = DicomMessage._read(stream, syntaxLengthTypeToDecode, true);

    return DicomMetaDictionary.naturalizeDataset(denaturalizedDataset);
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Dataset;
//#endregion
