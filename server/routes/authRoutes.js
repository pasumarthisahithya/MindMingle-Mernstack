const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middelware/auth');

/*router.post('/signup', signup);*/
router.post('/signup', (req, res) => {
  console.log("Signup route hit ✅");
  res.send("Signup working");
});
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;