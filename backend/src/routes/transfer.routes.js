const express = require('express');
const router = express.Router();
const { transferPoints, getTransferHistory } = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', transferPoints);
router.get('/history', getTransferHistory);

module.exports = router;
