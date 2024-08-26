const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatRoomSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }, 
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Users in the chat room
  createdAt: { type: Date, default: Date.now }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
module.exports = ChatRoom;
