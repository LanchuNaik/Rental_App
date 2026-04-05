const mongoose = require("mongoose");

// create schema (structure of user)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },    
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// create model
module.exports = mongoose.model("User", userSchema);