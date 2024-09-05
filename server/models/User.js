const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  photoUrl: {
    type: String, 
    default: 'http://localhost:5001/uploads/profile/default-profile.jpg', 
  },
});

module.exports = mongoose.model('User', UserSchema);
