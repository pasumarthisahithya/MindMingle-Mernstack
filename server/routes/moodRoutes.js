const express = require('express');
const router = express.Router();
const { trackMood, getMoodHistory, getMoodStats, getTodayMood, getRecommendedExercises } = require('../controllers/moodController');
const { protect } = require('../middelware/auth');

// Mood tracking routes
router.post('/', protect, trackMood);
router.get('/', protect, getMoodHistory);
router.get('/stats', protect, getMoodStats);
router.get('/today', protect, getTodayMood);
router.get('/recommendations', protect, getRecommendedExercises);

module.exports = router;
