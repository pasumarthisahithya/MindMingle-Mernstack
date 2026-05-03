const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  targetMood: {
    type: String,
    enum: ['Very Happy', 'Happy', 'Calm', 'Neutral', 'Anxious', 'Sad', 'Very Sad', 'Stressed']
  },
  targetFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Goal', goalSchema);