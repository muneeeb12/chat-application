const mongoose = require('mongoose');
const { Schema } = mongoose;

const friendshipSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
  });
  
  const Friendship = mongoose.model('Friendship', friendshipSchema);
  module.exports = Friendship;
  