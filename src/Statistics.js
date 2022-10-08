//#region Statistics
class Statistics {
  /**
   * Creates an instance of Statistics.
   * @constructor
   */
  constructor() {
    this.bytesReceived = 0;
    this.bytesSent = 0;
  }

  /**
   * Gets the received bytes.
   * @method
   * @returns {number} Received bytes.
   */
  getBytesReceived() {
    return this.bytesReceived;
  }

  /**
   * Gets the sent bytes.
   * @method
   * @returns {number} Sent bytes.
   */
  getBytesSent() {
    return this.bytesSent;
  }

  /**
   * Adds bytes to the received bytes.
   * @method
   * @param {number} bytes - Bytes to add.
   */
  addBytesReceived(bytes) {
    this.bytesReceived += bytes;
  }

  /**
   * Adds bytes to the sent bytes.
   * @method
   * @param {number} bytes - Bytes to add.
   */
  addBytesSent(bytes) {
    this.bytesSent += bytes;
  }

  /**
   * Adds values from other statistics.
   * @method
   * @param {Statistics} statistics - Statistics to add.
   */
  addFromOtherStatistics(statistics) {
    this.addBytesReceived(statistics.getBytesReceived());
    this.addBytesSent(statistics.getBytesSent());
  }

  /**
   * Resets received and sent bytes.
   * @method
   */
  reset() {
    this.bytesReceived = 0;
    this.bytesSent = 0;
  }

  /**
   * Gets the statistics description.
   * @method
   * @return {string} Statistics description.
   */
  toString() {
    return `Sent: ${this._formatBytes(this.getBytesSent())}, Received: ${this._formatBytes(
      this.getBytesReceived()
    )}`;
  }

  //#region Private Methods
  /**
   * Formats bytes to size in KB, MB, GB, TB, and PB.
   * @method
   * @private
   * @returns {string} Formatted size.
   */
  _formatBytes(bytes) {
    if (bytes === undefined || bytes === 0) {
      return '0 Bytes';
    }
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(3))} ${sizes[i]}`;
  }
  //#endregion
}
//#endregion

//#region Exports
module.exports = Statistics;
//#endregion
