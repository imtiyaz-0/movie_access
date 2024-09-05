const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); 

const router = express.Router();
const fs = require('fs');
const secretKey = process.env.JWT_SECRET_KEY;


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
  
      if (user.photoUrl && user.photoUrl!=='http://localhost:5001/uploads/default-profile.jpg') {
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
  module.exports = router;