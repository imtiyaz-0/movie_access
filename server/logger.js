const pino = require('pino');
const logFilePath = './logs/app.log'; 

const logger = pino({
    level: 'info'
}, pino.destination(logFilePath));

module.exports = logger;
