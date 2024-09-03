const winston = require('winston');
require('winston-daily-rotate-file');

// Define transports
const dailyRotateFileTransport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  dirname: './logs',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d', // Keep logs for 7 days
  maxSize: '10m', // Rotate files after 10MB
  zippedArchive: true // Compress the rotated files
});

const exceptionsTransport = new winston.transports.DailyRotateFile({
  filename: 'exceptions-%DATE%.log',
  dirname: './logs',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  maxSize: '10m',
  zippedArchive: true
});

const rejectionsTransport = new winston.transports.DailyRotateFile({
  filename: 'rejections-%DATE%.log',
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
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    dailyRotateFileTransport
  ],
  exceptionHandlers: [
    exceptionsTransport
  ],
  rejectionHandlers: [
    rejectionsTransport
  ]
});


module.exports = logger;
