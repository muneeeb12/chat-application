const mongoose = require('mongoose');
const { Schema } = mongoose;

const outgoingFriendshipSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who sent the request
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // User who received the request
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const OutgoingFriendship = mongoose.model('OutgoingFriendship', outgoingFriendshipSchema);
module.exports = OutgoingFriendship;
