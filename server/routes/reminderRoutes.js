const express = require('express');
const router = express.Router();
const { 
  setReminder, 
  getReminders, 
  updateReminder, 
  deleteReminder 
} = require('../controllers/reminderController');
const { protect } = require('../middelware/auth');

router.route('/')
  .get(protect, getReminders)
  .post(protect, setReminder);

router.route('/:id')
  .put(protect, updateReminder)
  .delete(protect, deleteReminder);

module.exports = router;