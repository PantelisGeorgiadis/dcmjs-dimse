const { TransferSyntax, Implementation, StorageClass } = require('./Constants');

const fs = require('fs');
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
      const stream = new ReadBufferStream(
        elementsOrBuffer.buffer.slice(
          elementsOrBuffer.byteOffset,
          elementsOrBuffer.byteOffset + elementsOrBuffer.byteLength
        )
      );
      const denaturalizedDataset = DicomMessage.read(stream, this.transferSyntaxUid, true);
      const naturalizedDataset = DicomMetaDictionary.naturalizeDataset(denaturalizedDataset);

      this.elements = {};
      Object.keys(naturalizedDataset).forEach((item) => {
        this.elements[item] = naturalizedDataset[item];
      });
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
   * @returns {Dataset} Dataset.
   */
  static fromFile(path) {
    const fileBuffer = fs.readFileSync(path);
    const dicomDict = DicomMessage.readFile(
      fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength),
      { ignoreErrors: true }
    );
    const meta = DicomMetaDictionary.naturalizeDataset(dicomDict.meta);
    const transferSyntaxUid = meta.TransferSyntaxUID;
    const elements = DicomMetaDictionary.naturalizeDataset(dicomDict.dict);

    return new Dataset(elements, transferSyntaxUid);
  }

  /**
   * Saves a dataset to p10 file.
   * @method
   * @param {string} path - P10 file path.
   */
  toFile(path) {
    const elements = {
      _meta: {
        FileMetaInformationVersion: new Uint8Array([0, 1]).buffer,
        MediaStorageSOPClassUID:
          this.getElement('SOPClassUID') || StorageClass.SecondaryCaptureImageStorage,
        MediaStorageSOPInstanceUID:
          this.getElement('SOPInstanceUID') || Dataset.generateDerivedUid(),
        TransferSyntaxUID: this.getTransferSyntaxUid(),
        ImplementationClassUID: Implementation.ImplementationClassUid,
        ImplementationVersionName: Implementation.ImplementationVersion,
      },
      ...this.getElements(),
    };
    const denaturalizedMetaHeader = DicomMetaDictionary.denaturalizeDataset(elements._meta);
    const dicomDict = new DicomDict(denaturalizedMetaHeader);
    dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(elements);

    fs.writeFileSync(path, Buffer.from(dicomDict.write()));
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
    str.push('===============================================');
    str.push(JSON.stringify(this.getElements()));

    return str.join('\n');
  }
}
//#endregion

//#region Exports
module.exports = Dataset;
//#endregion
