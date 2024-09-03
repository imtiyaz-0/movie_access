const winston = require('winston');
require('winston-daily-rotate-file');

// Transport for request logs
const requestLogTransport = new winston.transports.DailyRotateFile({
  filename: 'requests-%DATE%.log',
  dirname: './logs/requests',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  maxSize: '10m',
  zippedArchive: true
});

// Transport for general application logs
const generalLogTransport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  dirname: './logs',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  maxSize: '10m',
  zippedArchive: true
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    generalLogTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: './logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: './logs/rejections.log' })
  ]
});

// Separate logger for requests
const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    requestLogTransport
  ]
});

module.exports = { logger, requestLogger };
