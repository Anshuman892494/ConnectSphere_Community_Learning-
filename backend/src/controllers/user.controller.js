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

    // Attach public lastSeenTime (the time of the most recent login)
    if (user.loginHistory && user.loginHistory.length > 0) {
      userObj.lastSeenTime = user.loginHistory[user.loginHistory.length - 1].loginTime;
    } else {
      userObj.lastSeenTime = user.updatedAt; // fallback
    }

    // Calculate total unique days visited from loginHistory
    let visitedDaysCount = 1;
    if (user.loginHistory && user.loginHistory.length > 0) {
      const uniqueDays = new Set(
        user.loginHistory.map(log => new Date(log.loginTime).toDateString())
      );
      visitedDaysCount = uniqueDays.size;
    }
    userObj.visitedDaysCount = visitedDaysCount;

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

// @desc    Transfer points to another user
// @route   POST /api/users/:id/transfer-points
// @access  Private
exports.transferPoints = async (req, res, next) => {
  try {
    const { points } = req.body;
    const senderId = req.user.id;
    const receiverId = req.params.id;

    // Validate points
    const transferAmount = parseInt(points, 10);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid positive number of points to transfer' });
    }

    // Cannot transfer to yourself
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot transfer points to yourself' });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check: sender must have MORE than 10 points
    if (sender.reputation <= 10) {
      return res.status(403).json({
        message: 'You need more than 10 points to transfer. Your current points: ' + sender.reputation
      });
    }

    // Cannot transfer more than sender has
    if (transferAmount > sender.reputation) {
      return res.status(400).json({
        message: 'Insufficient points. Your current balance: ' + sender.reputation
      });
    }

    // Perform transfer
    sender.reputation -= transferAmount;
    receiver.reputation += transferAmount;

    await sender.save();
    await receiver.save();

    res.json({
      message: `Successfully transferred ${transferAmount} points to ${receiver.username}`,
      senderReputation: sender.reputation,
      receiverReputation: receiver.reputation,
    });
  } catch (error) {
    next(error);
  }
};
