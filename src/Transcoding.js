const { NativeCodecs, Transcoder } = require('dcmjs-codecs');
const { TranscodableTransferSyntaxes, TransferSyntax } = require('./Constants');
const Dataset = require('./Dataset');
const log = require('./log');

//#region Transcoding
class Transcoding {
  /**
   * Initializes transcoding using dcmjs-codecs native codecs webassembly.
   * @method
   * @static
   * @async
   * @param {Object} [opts] - Transcoding initialization options.
   * @param {string} [opts.webAssemblyModulePathOrUrl] - Custom WebAssembly module path or URL.
   * If not provided, the module is trying to be resolved within the same directory.
   * @param {boolean} [opts.logCodecsInfo] - Flag to indicate whether to log informational messages.
   * @param {boolean} [opts.logCodecsTrace] - Flag to indicate whether to log trace messages.
   */
  static async initializeAsync(opts = {}) {
    await NativeCodecs.initializeAsync(opts);
  }

  /**
   * Releases dcmjs-codecs native codecs webassembly.
   * @method
   * @static
   */
  static release() {
    NativeCodecs.release();
  }

  /**
   * Transcodes a dataset to a different transfer syntax.
   * @method
   * @static
   * @param {Dataset} dataset - The dataset to transcode.
   * @param {string} transferSyntax - The transfer syntax to transcode to.
   * @param {Object} [opts] - Transcoding options.
   * @returns {Dataset} The transcoded dataset.
   * @throws {Error} If transcoding is not initialized or the transfer syntax transcoding is not supported.
   */
  static transcodeDataset(dataset, transferSyntax, opts = {}) {
    if (dataset.getTransferSyntaxUid() === transferSyntax) {
      return dataset;
    }

    if (
      transferSyntax !== TransferSyntax.ImplicitVRLittleEndian &&
      transferSyntax !== TransferSyntax.ExplicitVRLittleEndian &&
      transferSyntax !== TransferSyntax.ExplicitVRBigEndian &&
      NativeCodecs.isInitialized() !== true
    ) {
      throw new Error(
        'Transcoding is not initialized. Please call Transcoding.initializeAsync() first.'
      );
    }

    if (
      !TranscodableTransferSyntaxes.includes(dataset.getTransferSyntaxUid()) ||
      !TranscodableTransferSyntaxes.includes(transferSyntax)
    ) {
      throw new Error(
        `Transcoding dataset from ${this._transferSyntaxDescriptionFromValue(dataset.getTransferSyntaxUid())} to ${this._transferSyntaxDescriptionFromValue(transferSyntax)} is not supported.`
      );
    }

    log.info(
      `Transcoding dataset from ${this._transferSyntaxDescriptionFromValue(dataset.getTransferSyntaxUid())} to ${this._transferSyntaxDescriptionFromValue(transferSyntax)}...`
    );
    const transcoder = new Transcoder(dataset.getElements(), dataset.getTransferSyntaxUid());
    transcoder.transcode(transferSyntax, opts);

    return new Dataset(transcoder.getElements(), transcoder.getTransferSyntaxUid());
  }

  //#region Private Methods
  /**
   * Gets transfer syntax description from UID value.
   * @method
   * @static
   * @private
   * @param {string} uid - Transfer syntax UID value.
   * @returns {string} Transfer syntax description.
   */
  static _transferSyntaxDescriptionFromValue(uid) {
    const syntaxName = Object.keys(TransferSyntax).find((key) => TransferSyntax[key] === uid);
    return syntaxName ? `${syntaxName} (${uid})` : uid;
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Transcoding;
//#endregion
