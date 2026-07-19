const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getUsers, toggleFriend, transferPoints } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', protect, getUsers);
router.put('/profile', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
router.post('/:id/friend', protect, toggleFriend);
router.post('/:id/transfer-points', protect, transferPoints);
router.get('/:username', protect, getUserProfile);

module.exports = router;
