const User = require('../models/User');
const PointTransfer = require('../models/PointTransfer');

// @desc    Transfer points to another user
// @route   POST /api/transfers
// @access  Private
exports.transferPoints = async (req, res, next) => {
  try {
    const { receiverUsername, points, description } = req.body;
    const pointsToTransfer = parseInt(points);

    if (isNaN(pointsToTransfer) || pointsToTransfer <= 0) {
      return res.status(400).json({ message: 'Please specify a valid positive points value to transfer' });
    }

    const sender = await User.findById(req.user.id);

    if (sender.points < pointsToTransfer) {
      return res.status(400).json({ message: `Insufficient points. You only have ${sender.points} points` });
    }

    if (sender.username.toLowerCase() === receiverUsername.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot transfer points to yourself' });
    }

    const receiver = await User.findOne({
      username: { $regex: new RegExp(`^${receiverUsername}$`, 'i') },
    });

    if (!receiver) {
      return res.status(404).json({ message: `Receiver username "${receiverUsername}" not found` });
    }

    // Deduct and Add
    sender.points -= pointsToTransfer;
    receiver.points += pointsToTransfer;

    await sender.save();
    await receiver.save();

    // Log the transaction
    const transfer = await PointTransfer.create({
      sender: sender._id,
      receiver: receiver._id,
      points: pointsToTransfer,
      description: description || 'Points transfer',
    });

    res.json({
      message: `Successfully transferred ${pointsToTransfer} points to ${receiver.username}`,
      senderPoints: sender.points,
      transfer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer history for current user
// @route   GET /api/transfers/history
// @access  Private
exports.getTransferHistory = async (req, res, next) => {
  try {
    const history = await PointTransfer.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.json(history);
  } catch (error) {
    next(error);
  }
};
