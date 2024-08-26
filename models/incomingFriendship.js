const mongoose = require('mongoose');
const { Schema } = mongoose;

const incomingFriendshipSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who received the request
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who sent the request
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const IncomingFriendship = mongoose.model('IncomingFriendship', incomingFriendshipSchema);
module.exports = IncomingFriendship;
