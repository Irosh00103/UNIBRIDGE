const express = require('express');
const router = express.Router();
const Kuppi = require('../models/Kuppi');
const { protect } = require('../middleware/auth');

// GET /api/kuppi
router.get('/', protect, async (req, res) => {
  try {
    const kuppis = await Kuppi.find().sort({ date: 1 });
    res.json({ success: true, data: kuppis });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/kuppi
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can create sessions' });
  }
  const { title, module, date, description } = req.body;
  if (!title || !module || !date) {
    return res.status(400).json({ success: false, message: 'Title, module, and date required' });
  }
  if (new Date(date) <= new Date()) {
    return res.status(400).json({ success: false, message: 'Date must be in the future' });
  }
  try {
    const kuppi = await Kuppi.create({
      studentId: req.user.id,
      studentName: req.user.name,
      title,
      module,
      date,
      description,
    });
    res.json({ success: true, data: kuppi });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
