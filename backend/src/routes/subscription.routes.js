const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
