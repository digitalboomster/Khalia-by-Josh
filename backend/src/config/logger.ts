import winston from 'winston';
import path from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

// Custom format for structured logging
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Console transport (always enabled)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? `\n${JSON.stringify(meta, null, 2)}`
        : '';
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    }),
  ),
});

// File transports
const transports: winston.transport[] = [consoleTransport];

// File transport for errors
transports.push(
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
);

// File transport for combined logs
transports.push(
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
);

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log'),
    }),
  ],
});

// Add request ID context
logger.addContext = function (data: any) {
  return this.child(data);
};

export default logger;
