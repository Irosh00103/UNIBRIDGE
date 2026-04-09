const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { auth, requireRole } = require('../middleware/auth');

router.get('/profile', auth, requireRole('student'), async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      // Create a default profile if it doesn't exist
      const nameParts = req.user.name ? req.user.name.split(' ') : ['Student', ''];
      student = await Student.create({
        userId: req.user._id,
        firstName: nameParts[0] || 'Student',
        lastName: nameParts.slice(1).join(' ') || 'User',
        email: req.user.email
      });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', [auth, requireRole('student'), body('firstName').optional().trim()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Profile not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
