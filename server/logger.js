const winston = require('winston');
require('winston-daily-rotate-file');

const transport = new winston.transports.DailyRotateFile({
  filename: 'app-%DATE%.log',
  dirname: './logs',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d', 
  maxSize: '10m', 
  zippedArchive: true
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    transport
  ]
});

module.exports = logger;
