const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ipAddress: {
    type: String,
    default: 'Unknown',
  },
  userAgent: {
    type: String,
    default: 'Unknown',
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
