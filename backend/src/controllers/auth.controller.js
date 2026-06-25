const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

// Generate Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'connectsphere_jwt_secret_token_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already registered' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      // First registered user is Admin (convenient for setup)
      role: (await User.countDocuments({})) === 0 ? 'admin' : 'user',
    });

    if (user) {
      // Record initial success login history
      await LoginHistory.create({
        user: user._id,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown',
        userAgent: req.headers['user-agent'] || 'Unknown',
        status: 'success',
      });

      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        reputation: user.reputation,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been suspended by an Administrator' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Log failed attempt
      await LoginHistory.create({
        user: user._id,
        ipAddress,
        userAgent,
        status: 'failed',
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Log success attempt
    await LoginHistory.create({
      user: user._id,
      ipAddress,
      userAgent,
      status: 'success',
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points,
      reputation: user.reputation,
      subscription: user.subscription,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get login history for current user
// @route   GET /api/auth/security-logs
// @access  Private
exports.getSecurityLogs = async (req, res, next) => {
  try {
    const logs = await LoginHistory.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
