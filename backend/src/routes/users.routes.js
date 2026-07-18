const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getUsers, toggleFriend, transferPoints } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.put('/profile', protect, updateProfile);
router.post('/:id/friend', protect, toggleFriend);
router.post('/:id/transfer-points', protect, transferPoints);
router.get('/:username', protect, getUserProfile);

module.exports = router;
