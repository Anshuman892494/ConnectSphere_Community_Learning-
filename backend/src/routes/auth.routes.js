const express = require('express');
const router = express.Router();
const { register, login, getMe, getSecurityLogs } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/security-logs', protect, getSecurityLogs);

module.exports = router;
