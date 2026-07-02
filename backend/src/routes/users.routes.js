const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.get('/:username', protect, getUserProfile);

module.exports = router;
