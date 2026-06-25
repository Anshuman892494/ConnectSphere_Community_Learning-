const crypto = require('crypto');
const Razorpay = require('razorpay');
const User = require('../models/User');
const SubscriptionTransaction = require('../models/SubscriptionTransaction');

// Initialize Razorpay
// If test/mock keys are specified, we skip initializing the SDK or handle it gracefully
let razorpay = null;
const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_mockkey123';

if (!isMock) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (error) {
    console.error('Razorpay initialization failed, using mock mode:', error.message);
  }
}

// Plan Prices in INR
const PLAN_PRICES = {
  silver: 199,
  gold: 499,
  platinum: 999,
};

// @desc    Create a payment order
// @route   POST /api/subscriptions/order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { planName } = req.body;
    const amount = PLAN_PRICES[planName.toLowerCase()];

    if (!amount) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const receiptId = `receipt_${req.user.id}_${Date.now()}`;
    let orderId = `order_mock_${Date.now()}`;

    if (razorpay && !isMock) {
      const options = {
        amount: amount * 100, // amount in paisa
        currency: 'INR',
        receipt: receiptId,
      };

      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Log the transaction in 'created' state
    await SubscriptionTransaction.create({
      user: req.user.id,
      razorpayOrderId: orderId,
      planName,
      amount,
      status: 'created',
    });

    res.json({
      orderId,
      amount: amount * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
      isMock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature
// @route   POST /api/subscriptions/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planName } = req.body;

    const transaction = await SubscriptionTransaction.findOne({
      razorpayOrderId,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction record not found' });
    }

    let isValid = false;

    if (isMock) {
      isValid = true; // Automatically validate mock transactions
    } else if (razorpay) {
      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
      const digest = shasum.digest('hex');

      if (digest === razorpaySignature) {
        isValid = true;
      }
    }

    if (!isValid) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update Transaction
    transaction.razorpayPaymentId = razorpayPaymentId || 'mock_pay_id';
    transaction.razorpaySignature = razorpaySignature || 'mock_sig';
    transaction.status = 'completed';
    await transaction.save();

    // Update User Subscription status
    const user = await User.findById(req.user.id);
    user.subscription = {
      status: 'premium',
      plan: planName.toLowerCase(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiration
    };
    
    // Give bonus points for subscribing!
    const pointsBonus = planName.toLowerCase() === 'platinum' ? 500 : planName.toLowerCase() === 'gold' ? 200 : 80;
    user.points += pointsBonus;

    await user.save();

    res.json({
      message: 'Subscription payment completed successfully!',
      subscription: user.subscription,
      points: user.points,
    });
  } catch (error) {
    next(error);
  }
};
