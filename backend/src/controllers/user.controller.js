const User = require('../models/User');

// @desc    Get user profile by ID
// @route   GET /api/users/profile/:id
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends', 'username avatar points reputation');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id },
    }).select('username avatar points reputation');

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Send friend request
// @route   POST /api/users/friend-request/:id
// @access  Private
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.id) {
      return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (currentUser.friends.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request is already sent
    if (targetUser.friendRequests.includes(req.user.id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Add to target user's friend requests
    targetUser.friendRequests.push(req.user.id);
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept friend request
// @route   POST /api/users/friend-accept/:id
// @access  Private
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;
    const currentUser = await User.findById(req.user.id);

    // Check if request exists
    if (!currentUser.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove from request list
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (id) => id.toString() !== requesterId
    );

    // Add to friends lists for both
    currentUser.friends.push(requesterId);
    requester.friends.push(req.user.id);

    // Reward points for making a connection!
    currentUser.points += 10;
    requester.points += 10;

    await currentUser.save();
    await requester.save();

    res.json({ message: 'Friend request accepted', friends: currentUser.friends });
  } catch (error) {
    next(error);
  }
};

// @desc    Get friends list for current user
// @route   GET /api/users/friends
// @access  Private
exports.getFriendsList = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username avatar points reputation')
      .populate('friendRequests', 'username avatar points reputation');
    
    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top users sorted by points / reputation
// @route   GET /api/users/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({})
      .sort({ points: -1 })
      .limit(10)
      .select('username avatar points reputation');
    res.json(users);
  } catch (error) {
    next(error);
  }
};
