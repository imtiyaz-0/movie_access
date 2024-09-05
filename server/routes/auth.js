require('dotenv').config(); 
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User'); 
const { logger } = require('../logger');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const secretKey = process.env.JWT_SECRET_KEY;
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/profile', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, secretKey); 

    const userId = decoded.userId;  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/profile/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, secretKey); 

    const userId = decoded.userId;  
        const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.photoUrl) {
      const oldPhotoPath = path.join(__dirname, '../uploads', path.basename(user.photoUrl));
      fs.unlink(oldPhotoPath, (err) => {
        if (err) {
          console.error('Error deleting old photo:', err);
        }
      });
    }

    const photoUrl = `http://localhost:5001/uploads/${req.file.filename}`;
    user.photoUrl = photoUrl;
    await user.save();

    res.json({ message: 'Photo uploaded successfully', photoUrl });
  } catch (error) {
    console.error('Error uploading photo:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 0 
  });
  res.status(200).json({ message: 'Logout successful' });
});


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

    res.cookie('token', token, {
      httpOnly: true,
      secure:false,
      sameSite: 'lax',
      maxAge: 3600000
    });
   
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/check-session', (req, res) => {
  if (req.cookies.token) {
    
    return res.json({ isAuthenticated: true });
  }
  return res.json({ isAuthenticated: false });
});



router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login attempt with invalid username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.error(`Login attempt with invalid password for username: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure:false,
      sameSite: 'lax',
      maxAge: 3600000
    });
   
    res.status(200).json({ message: 'Login successful' });
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
    if (!user) return res.status(401).json({ message: 'No user with that email' });
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

router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, secretKey); 

    const userId = decoded.userId; 
   
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 0
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;