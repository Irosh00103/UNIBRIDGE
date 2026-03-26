const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employer = require('../models/Employer');
const { auth, requireRole } = require('../middleware/auth');

router.get('/all', async (req, res) => {
  try {
    const employers = await Employer.find().populate('userId', 'email').select('-__v');
    res.json(employers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', auth, requireRole('employer'), async (req, res) => {
  try {
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) return res.status(404).json({ message: 'Profile not found' });
    res.json(employer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', [auth, requireRole('employer'), body('companyName').optional().trim()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const employer = await Employer.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!employer) return res.status(404).json({ message: 'Profile not found' });
    res.json(employer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
