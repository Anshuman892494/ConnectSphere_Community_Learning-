const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, addComment, deletePost } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;
