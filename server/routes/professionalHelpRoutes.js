const express = require('express');
const router = express.Router();
const { 
  getPractitioners, 
  startChat, 
  sendMessage, 
  getChats,
  getChat,
  checkMoodSuggestion 
} = require('../controllers/professionalHelpController');
const { protect } = require('../middelware/auth');

// Professional help routes
router.get('/practitioners', protect, getPractitioners);
router.get('/check-mood', protect, checkMoodSuggestion);
router.post('/chat/:practitionerId', protect, startChat);
router.get('/chats', protect, getChats);
router.get('/chat/:chatId', protect, getChat);
router.post('/chat/:chatId/message', protect, sendMessage);

module.exports = router;