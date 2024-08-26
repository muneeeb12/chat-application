const mongoose = require('mongoose');
const { Schema } = mongoose;

const directMessageSchema = new Schema({
    friendship: { type: Schema.Types.ObjectId, ref: 'Friendship', required: true }, // Link to the friendship
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date } 
  });
  
  const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
  module.exports = DirectMessage;
  