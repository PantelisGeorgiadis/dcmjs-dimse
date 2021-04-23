const { TransferSyntax } = require('./Constants');

const fs = require('fs');
const dcmjs = require('dcmjs');
const { DicomMetaDictionary, DicomMessage, ReadBufferStream, WriteBufferStream } = dcmjs.data;
const dcmjsLog = dcmjs.log;

//#region Command
class Dataset {
  /**
   * Creates an instance of Dataset.
   * @param {Object|Buffer} elementsOrBuffer - Dataset elements as object or encoded as a DICOM dataset buffer.
   * @param {String} transferSyntaxUid - Dataset transfer syntax
   *
   * @memberof Dataset
   */
  constructor(elementsOrBuffer, transferSyntaxUid) {
    dcmjsLog.level = 'error';
    this.transferSyntaxUid = transferSyntaxUid || TransferSyntax.ImplicitVRLittleEndian;
    if (Buffer.isBuffer(elementsOrBuffer)) {
      var stream = new ReadBufferStream(
        elementsOrBuffer.buffer.slice(
          elementsOrBuffer.byteOffset,
          elementsOrBuffer.byteOffset + elementsOrBuffer.byteLength
        )
      );
      const denaturalizedDataset = DicomMessage.read(stream, this.transferSyntaxUid, true);
      const naturalizedDataset = DicomMetaDictionary.naturalizeDataset(denaturalizedDataset);

      this.elements = {};
      Object.keys(naturalizedDataset).forEach(item => {
        this.elements[item] = naturalizedDataset[item];
      });
      return;
    }

    this.elements = elementsOrBuffer;
    if (!this.elements) {
      this.elements = {};
    }
  }

  /**
   * Gets element value.
   *
   * @param {String} tag - Element tag.
   * @returns {String} Element value.
   * @memberof Dataset
   */
  getElement(tag) {
    return this.elements[tag];
  }

  /**
   * Sets element value.
   *
   * @param {String} tag - Element tag.
   * @param {String} value - Element value.
   * @memberof Dataset
   */
  setElement(tag, value) {
    this.elements[tag] = value;
  }

  /**
   * Gets all elements.
   *
   * @returns {Object} Elements.
   * @memberof Dataset
   */
  getElements() {
    return this.elements;
  }

  /**
   * Gets DICOM transfer syntax UID.
   *
   * @returns {String} Transfer syntax UID.
   * @memberof Dataset
   */
  getTransferSyntaxUid() {
    return this.transferSyntaxUid;
  }

  /**
   * Sets DICOM transfer syntax UID.
   *
   * @param {String} transferSyntaxUid - Transfer Syntax UID.
   * @memberof Dataset
   */
  setTransferSyntaxUid(transferSyntaxUid) {
    this.transferSyntaxUid = transferSyntaxUid;
  }

  /**
   * Gets elements encoded in a DICOM dataset buffer.
   *
   * @param {String} transferSyntaxUid - Transfer Syntax UID.
   * @returns {Buffer} DICOM dataset.
   * @memberof Dataset
   */
  getDenaturalizedDataset() {
    const denaturalizedDataset = DicomMetaDictionary.denaturalizeDataset(this.getElements());
    var stream = new WriteBufferStream();
    DicomMessage.write(denaturalizedDataset, stream, this.transferSyntaxUid, {});

    return Buffer.from(stream.getBuffer());
  }

  /**
   * Loads a dataset from p10 file.
   *
   * @param {String} path - P10 file path.
   * @returns {Object} Dataset.
   * @memberof Dataset
   */
  static fromFile(path) {
    const fileBuffer = fs.readFileSync(path);
    const dicomDict = DicomMessage.readFile(fileBuffer.buffer, { ignoreErrors: true });
    const meta = DicomMetaDictionary.naturalizeDataset(dicomDict.meta);
    const transferSyntaxUid = meta.TransferSyntaxUID;
    const elements = DicomMetaDictionary.naturalizeDataset(dicomDict.dict);

    return new Dataset(elements, transferSyntaxUid);
  }

  /**
   * Gets the dataset description.
   *
   * @memberof Dataset
   */
  toString() {
    const str = [];
    str.push('Dataset:');
    str.push('===============================================');
    str.push(JSON.stringify(this.getElements()));

    return str.join('\n');
  }
}
//#endregion

//#region Exports
module.exports = Dataset;
//#endregion
