const mongoose = require('mongoose');

const mindfulnessExerciseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['breathing', 'meditation', 'visualization', 'body-scan', 'mindful-movement'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: [{
    step: Number,
    text: String
  }],
  benefits: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MindfulnessExercise', mindfulnessExerciseSchema);