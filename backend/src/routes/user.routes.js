const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendsList,
  getLeaderboard,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/friends', protect, getFriendsList);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/search', protect, searchUsers);
router.get('/profile/:id', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/friend-request/:id', protect, sendFriendRequest);
router.post('/friend-accept/:id', protect, acceptFriendRequest);

module.exports = router;
