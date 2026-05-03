const ProfessionalChat = require('../models/ProfessionalChat');
const User = require('../models/User');
const Mood = require('../models/Mood');

// @desc    Get available practitioners
// @route   GET /api/v1/professional-help/practitioners
// @access  Private
const getPractitioners = async (req, res) => {
  try {
    const practitioners = await User.find({ 
      userType: 'practitioner',
      isAvailable: true 
    }).select('name specialization email');

    res.json({
      success: true,
      count: practitioners.length,
      practitioners
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching practitioners' });
  }
};

// @desc    Start or get chat with practitioner
// @route   POST /api/v1/professional-help/chat/:practitionerId
// @access  Private
const startChat = async (req, res) => {
  try {
    const { practitionerId } = req.params;
    const userId = req.user.id;

    // Check if practitioner exists
    const practitioner = await User.findOne({ 
      _id: practitionerId, 
      userType: 'practitioner' 
    });

    if (!practitioner) {
      return res.status(404).json({ error: 'Practitioner not found' });
    }

    // Check if chat already exists
    let chat = await ProfessionalChat.findOne({
      userId,
      practitionerId,
      status: 'active'
    });

    if (!chat) {
      // Create new chat
      chat = await ProfessionalChat.create({
        userId,
        practitionerId,
        messages: []
      });
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error starting chat' });
  }
};

// @desc    Send message in professional chat
// @route   POST /api/v1/professional-help/chat/:chatId/message
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const chat = await ProfessionalChat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is part of this chat
    if (chat.userId.toString() !== userId && chat.practitionerId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Determine sender type
    const senderType = chat.practitionerId.toString() === userId ? 'practitioner' : 'user';

    // Add message to chat
    chat.messages.push({
      sender: userId,
      senderType,
      message,
      timestamp: new Date()
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    res.json({
      success: true,
      message: 'Message sent',
      chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

// @desc    Get user's chats
// @route   GET /api/v1/professional-help/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let chats;
    if (userType === 'practitioner') {
      chats = await ProfessionalChat.find({ practitionerId: userId })
        .populate('userId', 'name email createdAt')
        .sort('-lastMessageAt');
    } else {
      chats = await ProfessionalChat.find({ userId })
        .populate('practitionerId', 'name specialization')
        .sort('-lastMessageAt');
    }

    res.json({
      success: true,
      count: chats.length,
      chats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching chats' });
  }
};

// @desc    Get specific chat
// @route   GET /api/v1/professional-help/chat/:chatId
// @access  Private
const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await ProfessionalChat.findById(chatId)
      .populate('userId', 'name email')
      .populate('practitionerId', 'name specialization');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check authorization
    if (chat.userId._id.toString() !== userId && chat.practitionerId._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      success: true,
      chat
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching chat' });
  }
};

// @desc    Check if user needs professional help (mood analysis)
// @route   GET /api/v1/professional-help/check-mood
// @access  Private
const checkMoodSuggestion = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get mood entries from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMoods = await Mood.find({
      userId,
      date: { $gte: sevenDaysAgo }
    }).sort('-date');

    console.log('Mood check - Total moods found:', recentMoods.length);

    if (recentMoods.length === 0) {
      return res.json({
        success: true,
        needsHelp: false,
        message: 'Not enough data to analyze'
      });
    }

    // Count unique days with mood entries
    const uniqueDays = new Set(
      recentMoods.map(mood => mood.date.toISOString().split('T')[0])
    ).size;

    console.log('Unique days with moods:', uniqueDays, 'Total entries:', recentMoods.length);

    // Check for concerning patterns
    const concerningMoods = ['Anxious', 'Sad', 'Very Sad', 'Stressed'];
    const concerningCount = recentMoods.filter(mood => 
      concerningMoods.includes(mood.mood)
    ).length;

    // Check for low intensity consistently
    const lowIntensityCount = recentMoods.filter(mood => mood.intensity <= 3).length;

    console.log('Concerning moods:', concerningCount, 'Low intensity:', lowIntensityCount);

    // Suggest professional help if more than 50% of moods are concerning
    // OR more than 50% have low intensity (lowered from 60%)
    const needsHelp = (concerningCount / recentMoods.length) >= 0.5 || 
                      (lowIntensityCount / recentMoods.length) >= 0.5;

    console.log('Needs help:', needsHelp);

    let message = '';
    if (needsHelp) {
      message = `We've noticed you've been experiencing ${concerningCount} challenging mood${concerningCount !== 1 ? 's' : ''} over ${uniqueDays} day${uniqueDays !== 1 ? 's' : ''} recently. Consider reaching out to a mental health professional for personalized support.`;
    }

    res.json({
      success: true,
      needsHelp,
      message,
      stats: {
        totalMoods: recentMoods.length,
        concerningMoods: concerningCount,
        lowIntensityMoods: lowIntensityCount
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ 
      success: true,
      needsHelp: false,
      message: 'Error checking mood'
    });
  }
};

module.exports = {
  getPractitioners,
  startChat,
  sendMessage,
  getChats,
  getChat,
  checkMoodSuggestion
};