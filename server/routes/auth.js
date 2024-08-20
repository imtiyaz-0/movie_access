require('dotenv').config(); 
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); 
const logger = require('../logger');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const secretKey = process.env.JWT_SECRET_KEY;

router.post('/register', [
  body('email').isEmail().withMessage('Invalid email address'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      logger.warn(`Registration attempt with existing email or username: ${email}, ${username}`);
      return res.status(409).json({ message: 'Email or username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    const payload = { userId: newUser._id };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

    logger.info(`New user registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login attempt with invalid username: ${username}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login attempt with invalid password for username: ${username}`);
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

router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = new User({ googleId, username: payload.name });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ token: jwtToken });
  } catch (error) {
    logger.error('Error during Google authentication:', {
      message: error.message,
      stack: error.stack,
      context: { token }
    });
    res.status(500).json({ message: 'Google authentication failed' });
  }
});


router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No user with that email' });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your password reset link is: ${process.env.EMAIL_url}/reset/${resetToken}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    logger.error('Error sending password reset email:', {
      message: error.message,
      stack: error.stack,
      context: { email }
    });
    res.status(500).json({ message: 'Error processing request' });
  }
});

router.post('/reset/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;