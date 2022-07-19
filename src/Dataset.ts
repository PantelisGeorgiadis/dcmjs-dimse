import { TransferSyntax, StorageClass } from './Constants';
import Implementation from './Implementation';

import { readFile, readFileSync, writeFile, writeFileSync } from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import dcmjs from 'dcmjs';
const { DicomMetaDictionary, DicomDict, DicomMessage, ReadBufferStream, WriteBufferStream } =
  dcmjs.data;
const dcmjsLog = dcmjs.log;

// TODO: Adjust type when Element Enum exists
type DatasetElements = { [key: string]: string | number | object | Array<any> };

//#region Dataset
class Dataset {
  transferSyntaxUid: TransferSyntax;
  elements: DatasetElements;
  /**
   * Creates an instance of Dataset.
   * @constructor
   * @param {Object|Buffer} [elementsOrBuffer] - Dataset elements as object or encoded as a DICOM dataset buffer.
   * @param {string} [transferSyntaxUid] - Dataset transfer syntax
   */
  constructor(elementsOrBuffer?: DatasetElements | Buffer, transferSyntaxUid?: TransferSyntax) {
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
  getElement(tag: string): any {
    return this.elements[tag];
  }

  /**
   * Sets element value.
   * @method
   * @param {string} tag - Element tag.
   * @param {string} value - Element value.
   */
  setElement(tag: string, value: string | number | any[]) {
    this.elements[tag] = value;
  }

  /**
   * Gets all elements.
   * @method
   * @returns {Object} Elements.
   */
  getElements(): DatasetElements {
    return this.elements;
  }

  /**
   * Gets DICOM transfer syntax UID.
   * @method
   * @returns {string} Transfer syntax UID.
   */
  getTransferSyntaxUid(): string {
    return this.transferSyntaxUid;
  }

  /**
   * Sets DICOM transfer syntax UID.
   * @method
   * @param {string} transferSyntaxUid - Transfer Syntax UID.
   */
  setTransferSyntaxUid(transferSyntaxUid: string) {
    this.transferSyntaxUid = transferSyntaxUid as TransferSyntax;
  }

  /**
   * Gets elements encoded in a DICOM dataset buffer.
   * @method
   * @returns {Buffer} DICOM dataset.
   */
  getDenaturalizedDataset(): Buffer {
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
  getDenaturalizedCommandDataset(): Buffer {
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
   * @returns {Dataset|undefined} Dataset or undefined, if the function runs asynchronously.
   */
  static fromFile(
    path: string,
    callback?: (arg0: Error, arg1: Dataset) => any
  ): Dataset | undefined {
    if (callback !== undefined && callback instanceof Function) {
      readFile(path, (error, fileBuffer) => {
        if (error) {
          callback(error, undefined);
          return;
        }
        callback(undefined, this._fromP10Buffer(fileBuffer));
      });
      return;
    }

    return this._fromP10Buffer(readFileSync(path));
  }

  /**
   * Saves a dataset to p10 file.
   * @method
   * @param {string} path - P10 file path.
   * @param {function(Error)} [callback] - P10 file writing callback function.
   * If this is not provided, the function runs synchronously.
   * @param {Object} [nameMap] - Additional DICOM tags to recognize when denaturalizing the
   * dataset. Can be used to support writing private fields/tags.
   * @param {object} [writeOptions] - The write options to pass through to
   * `DicomDict.write()`. Optional.
   */
  toFile(path: string, callback?: (arg0: Error) => any, nameMap?: object, writeOptions?: object) {
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
  static generateDerivedUid(): string {
    return DicomMetaDictionary.uid();
  }

  /**
   * Gets the dataset description.
   * @method
   * @returns {string} Dataset description.
   */
  toString(): string {
    const str = [];
    str.push('Dataset:');
    str.push('===============================================');
    str.push(JSON.stringify(this.getElements()));

    return str.join('\n');
  }

  //#region Private Methods
  /**
   * Creates a dataset from p10 buffer.
   * @method
   * @private
   * @param {Buffer} buffer - p10 buffer.
   * @returns {Dataset} Dataset.
   */
  static _fromP10Buffer(buffer: Buffer): Dataset {
    const dicomDict = DicomMessage.readFile(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      { ignoreErrors: true }
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
  _fromElementsBuffer(buffer: Buffer, transferSyntaxUid: string): DatasetElements {
    const stream = new ReadBufferStream(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    );
    // Use the proper syntax length (based on transfer syntax UID)
    // since dcmjs doesn't do that internally.
    const syntaxLengthTypeToDecode =
      transferSyntaxUid === TransferSyntax.ImplicitVRLittleEndian
        ? TransferSyntax.ImplicitVRLittleEndian
        : TransferSyntax.ExplicitVRLittleEndian;
    const denaturalizedDataset = DicomMessage.read(stream, syntaxLengthTypeToDecode, true);

    return DicomMetaDictionary.naturalizeDataset(denaturalizedDataset);
  }
  //#endregion
}
//#endregion

//#region Exports
export default Dataset;
export { Dataset, DatasetElements };
//#endregion
