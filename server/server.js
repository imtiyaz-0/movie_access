const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const {logger,requestLogger} = require('./logger');
const swaggerSetup = require('./swagger');
const cookieParser = require('cookie-parser');
require('./create-logs-directory');


require('dotenv').config();

const app = express();
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    requestLogger.info(`[${method}] ${url} - ${statusCode} - ${duration}ms`);
  });

  next();
});
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true, 
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.info(err));

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

swaggerSetup(app);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

 module.exports = app;  
