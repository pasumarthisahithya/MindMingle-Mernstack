const Reminder = require('../models/Reminder');

// @desc    Set a reminder
// @route   POST /api/v1/reminders
// @access  Private
const setReminder = async (req, res) => {
  try {
    const { exerciseTitle, exerciseId, frequency, time, days } = req.body;

    if (!exerciseTitle || !frequency || !time) {
      return res.status(400).json({ 
        error: 'Please provide exercise title, frequency, and time' 
      });
    }

    // Validate time format
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;
    if (!timeRegex.test(time)) {
      return res.status(400).json({ 
        error: 'Invalid time format. Use HH:MM AM/PM' 
      });
    }

    const reminder = await Reminder.create({
      userId: req.user.id,
      exerciseTitle,
      exerciseId,
      frequency,
      time,
      days: days || [],
      isActive: true
    });

    res.status(200).json({
      message: 'Reminder set successfully',
      reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error setting reminder' });
  }
};

// @desc    Get user reminders
// @route   GET /api/v1/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching reminders' });
  }
};

// @desc    Update reminder
// @route   PUT /api/v1/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this reminder' });
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating reminder' });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/v1/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this reminder' });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting reminder' });
  }
};

module.exports = {
  setReminder,
  getReminders,
  updateReminder,
  deleteReminder
};