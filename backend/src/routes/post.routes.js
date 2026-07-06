const express = require('express');
const router = express.Router();
const { createPost, getPosts, getPost, likePost, votePost, addComment, deleteComment, deletePost } = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/:id')
  .get(protect, getPost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, likePost);
router.post('/:id/vote', protect, votePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:comment_id', protect, deleteComment);

module.exports = router;
