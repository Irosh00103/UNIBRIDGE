const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');

// GET /api/materials
router.get('/', protect, async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/materials
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can upload materials' });
  }
  const { title, module, type, link } = req.body;
  if (!title || !module || !type || !link) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  try {
    const material = await Material.create({
      studentId: req.user.id,
      studentName: req.user.name,
      title,
      module,
      type,
      link,
    });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
