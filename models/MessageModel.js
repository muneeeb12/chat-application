const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    chatRoom: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }] // Users who have read the message
  });
  
  const Message = mongoose.model('Message', messageSchema);
  module.exports = Message;
  