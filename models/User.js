const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the user
const userSchema = new Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allow null values
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email address']
  },
  password: {
    type: String,
    minlength: 8
  },
  isPending: {
    type: Boolean,
    default: true
  },
  status: { 
    type: String,
    enum: ['Online', 'Offline', 'Busy'], default: 'Offline' },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
