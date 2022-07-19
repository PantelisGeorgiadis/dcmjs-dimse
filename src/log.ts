import { createLogger, format, transports } from 'winston';
const { combine, timestamp, printf } = format;

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
export default log;
//#endregion
