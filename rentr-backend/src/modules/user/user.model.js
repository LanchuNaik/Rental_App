const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: null,
  },
  avatar: {
    type: String,     // stores the file path e.g. "uploads/avatars/abc123.jpg"
    default: null,
  },
  role: {
    type: String,
    enum: ['renter', 'owner', 'both'],
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
