const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getUsers,
  blockUser,
  deletePost,
  deleteQuestion,
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:id/block', blockUser);
router.delete('/posts/:id', deletePost);
router.delete('/questions/:id', deleteQuestion);

module.exports = router;
