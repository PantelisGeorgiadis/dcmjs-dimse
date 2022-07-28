export = Dataset;
declare class Dataset {
    /**
     * Loads a dataset from p10 file.
     * @method
     * @static
     * @param {string} path - P10 file path.
     * @param {function(Error, Dataset)} [callback] - P10 file reading callback function.
     * If this is not provided, the function runs synchronously.
     * @returns {Dataset|undefined} Dataset or undefined, if the function runs asynchronously.
     */
    static fromFile(path: string, callback?: (arg0: Error, arg1: Dataset) => any): Dataset | undefined;
    /**
     * Generates a UUID-derived UID.
     * @method
     * @static
     * @returns {string} UUID-derived UID.
     */
    static generateDerivedUid(): string;
    /**
     * Creates a dataset from p10 buffer.
     * @method
     * @private
     * @param {Buffer} buffer - p10 buffer.
     * @returns {Dataset} Dataset.
     */
    private static _fromP10Buffer;
    /**
     * Creates an instance of Dataset.
     * @constructor
     * @param {Object|Buffer} [elementsOrBuffer] - Dataset elements as object or encoded as a DICOM dataset buffer.
     * @param {string} [transferSyntaxUid] - Dataset transfer syntax
     */
    constructor(elementsOrBuffer?: any | Buffer, transferSyntaxUid?: string);
    transferSyntaxUid: string;
    elements: any;
    /**
     * Gets element value.
     * @method
     * @param {string} tag - Element tag.
     * @returns {string} Element value.
     */
    getElement(tag: string): string;
    /**
     * Sets element value.
     * @method
     * @param {string} tag - Element tag.
     * @param {string} value - Element value.
     */
    setElement(tag: string, value: string): void;
    /**
     * Gets all elements.
     * @method
     * @returns {Object} Elements.
     */
    getElements(): any;
    /**
     * Gets DICOM transfer syntax UID.
     * @method
     * @returns {string} Transfer syntax UID.
     */
    getTransferSyntaxUid(): string;
    /**
     * Sets DICOM transfer syntax UID.
     * @method
     * @param {string} transferSyntaxUid - Transfer Syntax UID.
     */
    setTransferSyntaxUid(transferSyntaxUid: string): void;
    /**
     * Gets elements encoded in a DICOM dataset buffer.
     * @method
     * @returns {Buffer} DICOM dataset.
     */
    getDenaturalizedDataset(): Buffer;
    /**
     * Gets elements encoded in a DICOM dataset buffer meant for a command.
     * @method
     * @returns {Buffer} DICOM dataset.
     */
    getDenaturalizedCommandDataset(): Buffer;
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
    toFile(path: string, callback?: (arg0: Error) => any, nameMap?: any, writeOptions?: object): void;
    /**
     * Gets the dataset description.
     * @method
     * @returns {string} Dataset description.
     */
    toString(): string;
    /**
     * Loads a dataset from elements only buffer.
     * @method
     * @private
     * @param {Buffer} buffer - Elements buffer.
     * @param {string} transferSyntaxUid - Transfer Syntax UID.
     * @returns {Object} Dataset elements.
     */
    private _fromElementsBuffer;
}
