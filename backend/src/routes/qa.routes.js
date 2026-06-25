const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  voteQuestion,
  addAnswer,
  acceptAnswer,
  voteAnswer,
} = require('../controllers/qa.controller');
const { protect } = require('../middleware/auth');

router.route('/questions')
  .post(protect, createQuestion)
  .get(protect, getQuestions);

router.route('/questions/:id')
  .get(protect, getQuestionById);

router.post('/questions/:id/vote', protect, voteQuestion);
router.post('/questions/:id/answers', protect, addAnswer);
router.post('/answers/:id/accept', protect, acceptAnswer);
router.post('/answers/:id/vote', protect, voteAnswer);

module.exports = router;
