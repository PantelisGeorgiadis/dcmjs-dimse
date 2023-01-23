const { createLogger, format, transports } = require('winston');
const { combine, printf, timestamp } = format;

const log = createLogger({
  format: combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
      return `${timestamp} -- ${level.toUpperCase()} -- ${message}`;
    })
  ),
  transports: [new transports.Console()],
});

//#region Exports
module.exports = log;
//#endregion
