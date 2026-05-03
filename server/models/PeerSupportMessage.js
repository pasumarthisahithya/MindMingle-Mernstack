const mongoose = require('mongoose');

const peerSupportMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  anonymous: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  supportType: {
    type: String,
    enum: ['general', 'anxiety', 'depression', 'stress', 'relationships', 'other'],
    default: 'general'
  }
});

module.exports = mongoose.model('PeerSupportMessage', peerSupportMessageSchema);