const log = require('loglevel');
const prefix = require('loglevel-plugin-prefix');

prefix.reg(log);
log.enableAll(false);

prefix.apply(log, {
  // eslint-disable-next-line no-unused-vars
  format(level, name, timestamp) {
    return `${timestamp} -- ${level.toUpperCase()} --`;
  },
  timestampFormatter(timestamp) {
    return timestamp.toISOString();
  },
});

//#region Exports
module.exports = log;
//#endregion
