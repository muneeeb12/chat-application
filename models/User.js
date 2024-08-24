const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the user
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create a model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
