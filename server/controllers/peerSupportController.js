const PeerSupportMessage = require('../models/PeerSupportMessage');

// @desc    Send support message
// @route   POST /api/v1/peer-support/connect
// @access  Private
const sendSupportMessage = async (req, res) => {
  try {
    const { message, supportType } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Please provide a message' });
    }

    if (message.length > 1000) {
      return res.status(400).json({ error: 'Message cannot exceed 1000 characters' });
    }

    const supportMessage = await PeerSupportMessage.create({
      userId: req.user.id,
      message,
      supportType: supportType || 'general',
      anonymous: true
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to('support-room').emit('new-message', {
      id: supportMessage._id,
      message: supportMessage.message,
      timestamp: supportMessage.timestamp,
      anonymous: true,
      supportType: supportMessage.supportType
    });

    res.status(200).json({
      message: 'Message sent successfully',
      supportMessage: {
        id: supportMessage._id,
        timestamp: supportMessage.timestamp
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error sending message' });
  }
};

// @desc    Get recent support messages
// @route   GET /api/v1/peer-support/messages
// @access  Private
const getSupportMessages = async (req, res) => {
  try {
    const { limit = 50, supportType } = req.query;

    const query = supportType ? { supportType } : {};

    const messages = await PeerSupportMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select('-userId'); // Don't expose user IDs

    res.json({
      success: true,
      count: messages.length,
      messages: messages.map(msg => ({
        id: msg._id,
        message: msg.message,
        timestamp: msg.timestamp,
        supportType: msg.supportType,
        anonymous: msg.anonymous
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
};

module.exports = {
  sendSupportMessage,
  getSupportMessages
};