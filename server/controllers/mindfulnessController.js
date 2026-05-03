const MindfulnessExercise = require('../models/MindfulnessExercise');

// @desc    Get all mindfulness exercises
// @route   GET /api/v1/mindfulness-exercises
// @access  Public
const getMindfulnessExercises = async (req, res) => {
  try {
    const exercises = await MindfulnessExercise.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: exercises.length,
      mindfulnessExercises: exercises
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching exercises' });
  }
};

// @desc    Get single mindfulness exercise
// @route   GET /api/v1/mindfulness-exercises/:id
// @access  Public
const getMindfulnessExercise = async (req, res) => {
  try {
    const exercise = await MindfulnessExercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({
      success: true,
      exercise
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching exercise' });
  }
};

// @desc    Create mindfulness exercise (Admin only - for seeding)
// @route   POST /api/v1/mindfulness-exercises
// @access  Public (should be protected in production)
const createMindfulnessExercise = async (req, res) => {
  try {
    const exercise = await MindfulnessExercise.create(req.body);

    res.status(201).json({
      success: true,
      exercise
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating exercise' });
  }
};

module.exports = {
  getMindfulnessExercises,
  getMindfulnessExercise,
  createMindfulnessExercise
};