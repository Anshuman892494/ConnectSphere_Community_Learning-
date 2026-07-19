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
  sharePost,
  getPopularQuestions,
  getGlobalStats
} = require('../controllers/post.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Search (must be before /:id to avoid conflicts)
router.get('/search', protect, searchPosts);

// Tags aggregation
router.get('/tags', protect, getTags);

// Popular/trending questions for sidebar
router.get('/popular', protect, getPopularQuestions);

// Global stats (Public, no protect middleware)
router.get('/global-stats', getGlobalStats);

// Main CRUD
router.route('/')
  .post(protect, createPost)
  .get(protect, getPosts);

router.route('/:id')
  .get(protect, getPost)
  .delete(protect, deletePost);

// Voting & interactions
router.post('/upload', protect, upload.single('media'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

router.post('/:id/like', protect, likePost);
router.post('/:id/vote', protect, votePost);
router.post('/:id/share', protect, sharePost);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/comment', protect, addComment);
router.post('/:id/comment/:commentId/vote', protect, voteComment);
router.post('/:id/accept/:commentId', protect, acceptAnswer);
router.delete('/:id/comment/:comment_id', protect, deleteComment);

module.exports = router;
