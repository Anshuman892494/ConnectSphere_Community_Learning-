const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'connectsphere_jwt_secret_token_key_12345';

// Helper: Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper: Generate Access Token (short-lived)
const generateAccessToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
};

// Helper: Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Helper: Extract refresh token from cookies
const getRefreshToken = (req) => {
  if (req.cookies && req.cookies.refreshToken) {
    return req.cookies.refreshToken;
  }
  if (req.headers.cookie) {
    const rawCookies = req.headers.cookie.split('; ');
    for (const c of rawCookies) {
      const [name, val] = c.split('=');
      if (name === 'refreshToken') return val;
    }
  }
  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;

    // Check if username, email, or phone already exists
    const orConditions = [{ email }, { username }];
    if (phone) {
      orConditions.push({ phone });
    }

    const userExists = await User.findOne({ $or: orConditions });
    if (userExists) {
      return res.status(400).json({ message: 'Username, email, or phone number already registered' });
    }

    // Generate simple 6-digit OTPs
    const emailOtp = generateOTP();
    const phoneOtp = generateOTP();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Determine role (first user is admin, else user)
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'user';

    // Create User
    const user = await User.create({
      username,
      email,
      phone: phone || undefined,
      password,
      role,
      emailVerificationCode: emailOtp,
      emailVerificationExpires: otpExpiry,
      phoneVerificationCode: phoneOtp,
      phoneVerificationExpires: otpExpiry,
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    // Send email verification OTP
    await sendOTPEmail(email, emailOtp, username);

    // Print OTPs to server console for testing
    console.log('\n=========================================');
    console.log(`[DEV ONLY] OTP codes for ${username}:`);
    console.log(`Email OTP: ${emailOtp}`);
    console.log(`Phone OTP: ${phoneOtp}`);
    console.log('=========================================\n');

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      token: accessToken,
      _devEmailOtp: emailOtp,
      _devPhoneOtp: phoneOtp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'This account has been suspended' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set cookie expiry
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 1 day

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      token: accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const token = getRefreshToken(req);
    if (!token) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Token is invalid or revoked' });
    }

    // Generate new pair
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token: newAccessToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const token = getRefreshToken(req);
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Phone OTP
// @route   POST /api/auth/verify-phone
exports.verifyPhone = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone number is already verified' });
    }

    if (!user.phoneVerificationCode || user.phoneVerificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.phoneVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.json({
      message: 'Phone number verified successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Email OTP
// @route   POST /api/auth/resend-email
exports.resendEmailCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = generateOTP();
    user.emailVerificationCode = code;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email verification OTP
    await sendOTPEmail(user.email, code, user.username);

    console.log(`[DEV ONLY] Resent Email OTP: ${code}`);

    res.json({
      message: 'Verification code sent to your email',
      _devEmailOtp: code,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend Phone OTP
// @route   POST /api/auth/resend-phone
exports.resendPhoneCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const code = generateOTP();
    user.phoneVerificationCode = code;
    user.phoneVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    console.log(`[DEV ONLY] Resent SMS OTP: ${code}`);

    res.json({
      message: 'Verification code sent via SMS',
      _devPhoneOtp: code,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Contact Details
// @route   POST /api/auth/update-contacts
exports.updateVerificationContacts = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new details belong to someone else
    const filter = [];
    if (email && email !== user.email) filter.push({ email });
    if (phone && phone !== user.phone) filter.push({ phone });

    if (filter.length > 0) {
      const exists = await User.findOne({ $or: filter, _id: { $ne: user._id } });
      if (exists) {
        return res.status(400).json({ message: 'Email or phone number already in use' });
      }
    }

    const devOtp = {};
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    let emailChanged = false;

    if (email && email !== user.email) {
      user.email = email;
      user.isEmailVerified = false;
      user.emailVerificationCode = generateOTP();
      user.emailVerificationExpires = expiry;
      devOtp.emailOtp = user.emailVerificationCode;
      emailChanged = true;
    }

    if (phone && phone !== user.phone) {
      user.phone = phone;
      user.isPhoneVerified = false;
      user.phoneVerificationCode = generateOTP();
      user.phoneVerificationExpires = expiry;
      devOtp.phoneOtp = user.phoneVerificationCode;
    }

    await user.save();

    // Send email verification OTP if updated
    if (emailChanged) {
      await sendOTPEmail(user.email, user.emailVerificationCode, user.username);
    }

    res.json({
      message: 'Contact details updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      _devEmailOtp: devOtp.emailOtp,
      _devPhoneOtp: devOtp.phoneOtp,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'username email phone role isEmailVerified isPhoneVerified avatar bio createdAt'
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Reset password with email/phone
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ message: 'Please provide registered email address or phone number' });
    }

    // Search for user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone },
        { phone: emailOrPhone }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email or phone number' });
    }

    // Rate Limit Check: once per day (24 hours check)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (user.lastForgotPasswordRequest && user.lastForgotPasswordRequest > oneDayAgo) {
      return res.status(400).json({ message: 'You can use this option only one time per day.' });
    }

    // Generate random password: uppercase and lowercase letters only
    const generateLettersOnlyPassword = (length = 10) => {
      const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(Math.random() * letters.length));
      }
      return result;
    };

    const tempPassword = generateLettersOnlyPassword(10);

    // Save user password (which will be automatically hashed by pre-save hook)
    user.password = tempPassword;
    user.lastForgotPasswordRequest = new Date();
    await user.save();

    // Trigger email send if user has email
    if (user.email) {
      await sendPasswordResetEmail(user.email, tempPassword, user.username);
    }

    // Log the generated password to server console for testing/verification
    console.log('\n=========================================');
    console.log(`[PASSWORD RESET] For user: ${user.username}`);
    console.log(`New generated password: ${tempPassword}`);
    console.log('=========================================\n');

    res.json({
      message: 'Your password has been successfully reset. The new password has been sent to your registered email/phone number.',
      tempPassword, // Include for dev-testing convenience in the UI
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    // Set new password (will be hashed automatically by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};
