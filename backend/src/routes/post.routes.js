const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  likePost,
  votePost,
  voteComment,
  acceptAnswer,
  toggleBookmark,
  addComment,
  deleteComment,
  deletePost,
  searchPosts,
  getTags,
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');

// Search (must be before /:id to avoid conflicts)
router.get('/search', protect, searchPosts);

// Tags aggregation
router.get('/tags', protect, getTags);

// Main CRUD
router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/:id')
  .get(protect, getPost)
  .delete(protect, deletePost);

// Voting & interactions
router.post('/:id/like', protect, likePost);
router.post('/:id/vote', protect, votePost);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, addComment);
router.post('/:id/comment/:commentId/vote', protect, voteComment);
router.post('/:id/accept/:commentId', protect, acceptAnswer);
router.delete('/:id/comment/:comment_id', protect, deleteComment);

module.exports = router;
