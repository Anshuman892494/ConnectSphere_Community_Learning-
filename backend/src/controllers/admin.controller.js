const User = require('../models/User');
const Post = require('../models/Post');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const LoginHistory = require('../models/LoginHistory');

// @desc    Get dashboard metrics and trends
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const premiumUsers = await User.countDocuments({ 'subscription.status': 'premium' });
    const totalPosts = await Post.countDocuments({});
    const totalQuestions = await Question.countDocuments({});
    const totalAnswers = await Answer.countDocuments({});

    // Login stats
    const totalLogins = await LoginHistory.countDocuments({});
    const failedLogins = await LoginHistory.countDocuments({ status: 'failed' });

    // Recent user signups
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email role createdAt');

    // Recent login events
    const recentLogins = await LoginHistory.find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('user', 'username email');

    res.json({
      metrics: {
        totalUsers,
        premiumUsers,
        totalPosts,
        totalQuestions,
        totalAnswers,
        totalLogins,
        failedLogins,
      },
      recentUsers,
      recentLogins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block administrative users' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: `User block status toggled. Blocked: ${user.isBlocked}`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post by admin
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question by admin
// @route   DELETE /api/admin/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });
    await question.deleteOne();

    res.json({ message: 'Question and associated answers removed successfully' });
  } catch (error) {
    next(error);
  }
};
