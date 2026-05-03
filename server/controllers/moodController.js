const Mood = require('../models/Mood');
const MindfulnessExercise = require('../models/MindfulnessExercise');

// Mood-based exercise recommendations mapping
const moodExerciseMap = {
  'Very Happy': ['meditation', 'mindful-movement'], // Maintain happiness with gentle practices
  'Happy': ['meditation', 'visualization', 'mindful-movement'], // Keep positive mood
  'Calm': ['meditation', 'body-scan', 'visualization'], // Maintain calmness
  'Neutral': ['breathing', 'meditation', 'body-scan'], // General wellness
  'Anxious': ['breathing', 'body-scan', 'meditation'], // Reduce anxiety
  'Sad': ['mindful-movement', 'breathing', 'visualization'], // Lift mood
  'Very Sad': ['breathing', 'mindful-movement', 'meditation'], // Gentle support
  'Stressed': ['breathing', 'body-scan', 'meditation'] // Stress relief
};

// @desc    Track mood
// @route   POST /api/v1/mood-tracking
// @access  Private
const trackMood = async (req, res) => {
  try {
    const { mood, intensity, notes, activities } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Please provide a mood' });
    }

    const moodEntry = await Mood.create({
      userId: req.user.id,
      mood,
      intensity: intensity || 5,
      notes,
      activities
    });

    res.status(200).json({
      message: 'Mood tracked successfully',
      mood: moodEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error tracking mood' });
  }
};

// @desc    Get mood history
// @route   GET /api/v1/mood-history
// @access  Private
const getMoodHistory = async (req, res) => {
  try {
    const { days } = req.query;
    const daysCount = days ? parseInt(days) : 30;

    // Calculate the date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);
    startDate.setHours(0, 0, 0, 0);

    const moodHistory = await Mood.find({ 
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: -1 });

    // Format for response
    const formattedHistory = moodHistory.map(entry => ({
      id: entry._id,
      date: entry.date.toISOString().split('T')[0],
      mood: entry.mood,
      intensity: entry.intensity,
      notes: entry.notes,
      activities: entry.activities
    }));

    res.json({
      success: true,
      count: formattedHistory.length,
      moodHistory: formattedHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching mood history' });
  }
};

// @desc    Get mood statistics
// @route   GET /api/v1/mood-tracking/stats
// @access  Private
const getMoodStats = async (req, res) => {
  try {
    const moodEntries = await Mood.find({ userId: req.user.id });

    // Calculate statistics
    const moodCounts = {};
    let totalIntensity = 0;

    moodEntries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      totalIntensity += entry.intensity;
    });

    const averageIntensity = moodEntries.length > 0 
      ? (totalIntensity / moodEntries.length).toFixed(2) 
      : 0;

    res.json({
      success: true,
      stats: {
        totalEntries: moodEntries.length,
        moodDistribution: moodCounts,
        averageIntensity: parseFloat(averageIntensity)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching mood statistics' });
  }
};

// @desc    Get today's mood
// @route   GET /api/v1/mood-tracking/today
// @access  Private
const getTodayMood = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMood = await Mood.findOne({
      userId: req.user.id,
      date: { $gte: today, $lt: tomorrow }
    }).sort({ date: -1 });

    res.json({
      success: true,
      mood: todayMood
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching today\'s mood' });
  }
};

// @desc    Get recommended exercises based on mood
// @route   GET /api/v1/mood-tracking/recommendations
// @access  Private
const getRecommendedExercises = async (req, res) => {
  try {
    const { mood } = req.query;

    if (!mood) {
      return res.status(400).json({ error: 'Please provide a mood' });
    }

    // Get recommended categories for this mood
    const recommendedCategories = moodExerciseMap[mood] || ['breathing', 'meditation'];

    // Fetch exercises from recommended categories
    const exercises = await MindfulnessExercise.find({
      category: { $in: recommendedCategories }
    }).limit(6).sort({ duration: 1 }); // Sort by duration, shorter first

    res.json({
      success: true,
      mood,
      count: exercises.length,
      exercises
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching recommendations' });
  }
};

module.exports = {
  trackMood,
  getMoodHistory,
  getMoodStats,
  getTodayMood,
  getRecommendedExercises
};