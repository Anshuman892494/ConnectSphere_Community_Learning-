const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');

// @desc    Create a question
// @route   POST /api/qa/questions
// @access  Private
exports.createQuestion = async (req, res, next) => {
  try {
    const { title, body, tags } = req.body;

    const question = await Question.create({
      user: req.user.id,
      title,
      body,
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    });

    // Reward points for asking
    const user = await User.findById(req.user.id);
    user.points += 5;
    await user.save();

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all questions (with optional search/tags filter)
// @route   GET /api/qa/questions
// @access  Private
exports.getQuestions = async (req, res, next) => {
  try {
    const { tag, search } = req.query;
    let query = {};

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar points reputation');

    res.json(questions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get question by ID with answers
// @route   GET /api/qa/questions/:id
// @access  Private
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('user', 'username avatar points reputation')
      .populate('acceptedAnswer');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.find({ question: req.params.id })
      .sort({ accepted: -1, upvotes: -1, createdAt: 1 })
      .populate('user', 'username avatar points reputation');

    res.json({ question, answers });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on a question
// @route   POST /api/qa/questions/:id/vote
// @access  Private
exports.voteQuestion = async (req, res, next) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const questionOwner = await User.findById(question.user);

    if (voteType === 'upvote') {
      const upIndex = question.upvotes.indexOf(req.user.id);
      const downIndex = question.downvotes.indexOf(req.user.id);

      if (upIndex > -1) {
        // Undo upvote
        question.upvotes.splice(upIndex, 1);
        if (questionOwner) questionOwner.reputation -= 10;
      } else {
        // Do upvote
        question.upvotes.push(req.user.id);
        if (questionOwner) questionOwner.reputation += 10;

        // Remove downvote if any
        if (downIndex > -1) {
          question.downvotes.splice(downIndex, 1);
          if (questionOwner) questionOwner.reputation += 2; // refund downvote rep penalty
        }
      }
    } else if (voteType === 'downvote') {
      const upIndex = question.upvotes.indexOf(req.user.id);
      const downIndex = question.downvotes.indexOf(req.user.id);

      if (downIndex > -1) {
        // Undo downvote
        question.downvotes.splice(downIndex, 1);
        if (questionOwner) questionOwner.reputation += 2;
      } else {
        // Do downvote
        question.downvotes.push(req.user.id);
        if (questionOwner) questionOwner.reputation -= 2;

        // Remove upvote if any
        if (upIndex > -1) {
          question.upvotes.splice(upIndex, 1);
          if (questionOwner) questionOwner.reputation -= 10;
        }
      }
    }

    await question.save();
    if (questionOwner) await questionOwner.save();

    res.json({
      upvotes: question.upvotes,
      downvotes: question.downvotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an answer to a question
// @route   POST /api/qa/questions/:id/answers
// @access  Private
exports.addAnswer = async (req, res, next) => {
  try {
    const { body } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      user: req.user.id,
      question: req.params.id,
      body,
    });

    // Reward points for answering
    const user = await User.findById(req.user.id);
    user.points += 5;
    await user.save();

    const populatedAnswer = await Answer.findById(answer._id).populate(
      'user',
      'username avatar points reputation'
    );

    res.status(201).json(populatedAnswer);
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an answer
// @route   POST /api/qa/answers/:id/accept
// @access  Private
exports.acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Only question owner can accept answers
    if (question.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the question creator can accept an answer' });
    }

    // Unaccept any previous accepted answers for this question
    await Answer.updateMany(
      { question: question._id, accepted: true },
      { accepted: false }
    );

    // Accept this answer
    answer.accepted = true;
    await answer.save();

    // Mark question as resolved
    question.resolved = true;
    question.acceptedAnswer = answer._id;
    await question.save();

    // Reward answerer
    const answerOwner = await User.findById(answer.user);
    if (answerOwner) {
      answerOwner.points += 20;
      answerOwner.reputation += 15;
      await answerOwner.save();
    }

    res.json({ message: 'Answer accepted successfully', answer });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote on an answer
// @route   POST /api/qa/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res, next) => {
  try {
    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const answerOwner = await User.findById(answer.user);

    if (voteType === 'upvote') {
      const upIndex = answer.upvotes.indexOf(req.user.id);
      const downIndex = answer.downvotes.indexOf(req.user.id);

      if (upIndex > -1) {
        answer.upvotes.splice(upIndex, 1);
        if (answerOwner) answerOwner.reputation -= 10;
      } else {
        answer.upvotes.push(req.user.id);
        if (answerOwner) answerOwner.reputation += 10;

        if (downIndex > -1) {
          answer.downvotes.splice(downIndex, 1);
          if (answerOwner) answerOwner.reputation += 2;
        }
      }
    } else if (voteType === 'downvote') {
      const upIndex = answer.upvotes.indexOf(req.user.id);
      const downIndex = answer.downvotes.indexOf(req.user.id);

      if (downIndex > -1) {
        answer.downvotes.splice(downIndex, 1);
        if (answerOwner) answerOwner.reputation += 2;
      } else {
        answer.downvotes.push(req.user.id);
        if (answerOwner) answerOwner.reputation -= 2;

        if (upIndex > -1) {
          answer.upvotes.splice(upIndex, 1);
          if (answerOwner) answerOwner.reputation -= 10;
        }
      }
    }

    await answer.save();
    if (answerOwner) await answerOwner.save();

    res.json({
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
    });
  } catch (error) {
    next(error);
  }
};
