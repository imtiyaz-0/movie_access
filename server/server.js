const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const movieRoutes = require('./routes/movies');
const authRoutes = require('./routes/auth');
const logger = require('./logger');
const swaggerSetup = require('./swagger');
const nodemailer = require('nodemailer'); // Make sure nodemailer is required

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch(err => logger.info(err));

app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

swaggerSetup(app);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
