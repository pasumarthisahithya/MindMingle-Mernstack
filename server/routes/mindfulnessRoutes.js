const express = require('express');
const router = express.Router();
const { 
  getMindfulnessExercises, 
  getMindfulnessExercise,
  createMindfulnessExercise 
} = require('../controllers/mindfulnessController');

router.route('/')
  .get(getMindfulnessExercises)
  .post(createMindfulnessExercise);

router.route('/:id')
  .get(getMindfulnessExercise);

module.exports = router;