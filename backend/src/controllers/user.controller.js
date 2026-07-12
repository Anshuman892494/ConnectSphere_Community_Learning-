const User = require('../models/User');
const Post = require('../models/Post');

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -emailVerificationCode -phoneVerificationCode -refreshToken')
      .populate('friends', 'username avatar bio');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isOwnProfile = req.user && user._id.toString() === req.user.id.toString();
    const userObj = user.toObject();
    if (!isOwnProfile) {
      delete userObj.loginHistory;
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar reputation')
      .populate('comments.user', 'username avatar reputation');

    res.json({ user: userObj, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { avatar, coverImage, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (avatar !== undefined) user.avatar = avatar;
    if (coverImage !== undefined) user.coverImage = coverImage;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      reputation: user.reputation,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      language: user.language,
      avatar: user.avatar,
      coverImage: user.coverImage,
      bio: user.bio
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password -emailVerificationCode -phoneVerificationCode -refreshToken')
      .populate('friends', 'username avatar bio')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle friend status (add/remove)
// @route   POST /api/users/:id/friend
// @access  Private
exports.toggleFriend = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot friend yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize friends array if they don't exist
    if (!currentUser.friends) currentUser.friends = [];
    if (!targetUser.friends) targetUser.friends = [];

    const isAlreadyFriend = currentUser.friends.includes(targetUserId);

    if (isAlreadyFriend) {
      // Remove connection (mutual)
      currentUser.friends = currentUser.friends.filter(id => id.toString() !== targetUserId);
      targetUser.friends = targetUser.friends.filter(id => id.toString() !== currentUserId);
    } else {
      // Add connection (mutual)
      currentUser.friends.push(targetUserId);
      targetUser.friends.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      message: isAlreadyFriend ? 'Friend removed successfully' : 'Friend added successfully',
      isFriend: !isAlreadyFriend,
      friendsCount: currentUser.friends.length
    });
  } catch (error) {
    next(error);
  }
};
