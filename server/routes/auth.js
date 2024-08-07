const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); 
const logger = require('../logger');

const router = express.Router();
const secretKey = '123456';

router.post('/register', [
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        logger.warn('Login attempt with invalid email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.warn('Login attempt with invalid password for email:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const payload = { userId: user._id };
      const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  
      res.json({ token });
    } catch (error) {
      logger.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;
