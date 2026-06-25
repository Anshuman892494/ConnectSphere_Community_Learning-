const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, addComment } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
