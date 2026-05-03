const Goal = require('../models/Goal');
const Mood = require('../models/Mood');

// Helper function to calculate goal progress
const calculateProgress = async (goal, userId) => {
  try {
    if (!goal.targetMood || !goal.isActive) {
      return 0;
    }

    const now = new Date();
    let startDate = goal.createdAt;
    let endDate = now;
    let targetDays = 0;

    // Determine date range based on frequency
    if (goal.targetFrequency === 'Daily') {
      // Check last 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      targetDays = 7;
    } else if (goal.targetFrequency === 'Weekly') {
      // Check last 4 weeks (28 days)
      startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      targetDays = 4; // 4 weeks
    } else if (goal.targetFrequency === 'Monthly') {
      // Check last 3 months (90 days)
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      targetDays = 3; // 3 months
    }

    // Use goal creation date if it's more recent than calculated start date
    if (goal.createdAt > startDate) {
      startDate = goal.createdAt;
      // Recalculate target days based on actual days since creation
      const daysSinceCreation = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
      if (goal.targetFrequency === 'Daily') {
        targetDays = Math.min(daysSinceCreation, 7);
      } else if (goal.targetFrequency === 'Weekly') {
        targetDays = Math.min(Math.ceil(daysSinceCreation / 7), 4);
      } else if (goal.targetFrequency === 'Monthly') {
        targetDays = Math.min(Math.ceil(daysSinceCreation / 30), 3);
      }
    }

    // Query mood entries matching the target mood
    const matchingMoods = await Mood.find({
      userId: userId,
      mood: goal.targetMood,
      date: { $gte: startDate, $lte: endDate }
    });

    let achievedCount = 0;

    if (goal.targetFrequency === 'Daily') {
      // Count unique days with target mood
      const uniqueDays = new Set();
      matchingMoods.forEach(mood => {
        const dateStr = mood.date.toISOString().split('T')[0];
        uniqueDays.add(dateStr);
      });
      achievedCount = uniqueDays.size;
    } else if (goal.targetFrequency === 'Weekly') {
      // Count unique weeks with target mood
      const uniqueWeeks = new Set();
      matchingMoods.forEach(mood => {
        const weekNumber = getWeekNumber(mood.date);
        uniqueWeeks.add(weekNumber);
      });
      achievedCount = uniqueWeeks.size;
    } else if (goal.targetFrequency === 'Monthly') {
      // Count unique months with target mood
      const uniqueMonths = new Set();
      matchingMoods.forEach(mood => {
        const monthStr = `${mood.date.getFullYear()}-${mood.date.getMonth()}`;
        uniqueMonths.add(monthStr);
      });
      achievedCount = uniqueMonths.size;
    }

    // Calculate progress percentage
    const progress = targetDays > 0 ? Math.min(Math.round((achievedCount / targetDays) * 100), 100) : 0;
    return progress;

  } catch (error) {
    console.error('Error calculating progress:', error);
    return 0;
  }
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

// @desc    Create a new goal
// @route   POST /api/v1/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { title, description, targetMood, targetFrequency } = req.body;

    const goal = await Goal.create({
      user: req.user.id,
      title,
      description,
      targetMood,
      targetFrequency
    });

    res.status(201).json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user's goals
// @route   GET /api/v1/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort('-createdAt');

    // Calculate and update progress for each goal
    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        const progress = await calculateProgress(goal, req.user.id);
        
        // Update progress in database if it changed
        if (goal.progress !== progress) {
          goal.progress = progress;
          await goal.save();
        }

        return goal;
      })
    );

    res.status(200).json({
      success: true,
      count: goalsWithProgress.length,
      goals: goalsWithProgress
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update a goal
// @route   PUT /api/v1/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/v1/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Check ownership
    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal
};