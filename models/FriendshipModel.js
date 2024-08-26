const mongoose = require('mongoose');
const { Schema } = mongoose;

const friendshipSchema = new Schema({
  user1: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // One user in the friendship
  user2: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // The other user in the friendship
  status: { type: String, enum: ['Accepted'], default: 'Accepted' }, // Status will always be 'Accepted' for established friendships
  createdAt: { type: Date, default: Date.now } // When the friendship was established
});

// Ensure that the friendship is unique for a pair of users
friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

const Friendship = mongoose.model('Friendship', friendshipSchema);
module.exports = Friendship;
