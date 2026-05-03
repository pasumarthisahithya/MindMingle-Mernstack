const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad', 'Anxious', 'Calm', 'Stressed'],
    required: true
  },
  intensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  notes: {
    type: String,
    maxlength: 500
  },
  activities: [String],
  date: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
moodSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Mood', moodSchema);