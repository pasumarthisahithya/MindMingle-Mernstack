const express = require('express');
const router = express.Router();
const { sendSupportMessage, getSupportMessages } = require('../controllers/peerSupportController');
const { protect } = require('../middelware/auth');

router.post('/connect', protect, sendSupportMessage);
router.get('/messages', protect, getSupportMessages);

module.exports = router;