const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/me', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/me', async (req, res) => {
  try {
    const payload = req.body || {};
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      {
        ...payload,
        userId: req.user.id,
        email: payload.email || req.user.email || '',
      },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ success: true, data: profile, message: 'Profile saved successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
