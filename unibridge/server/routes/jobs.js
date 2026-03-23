const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET /api/jobs
router.get('/', protect, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'OPEN' }).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/jobs
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ success: false, message: 'Only employers can post jobs' });
  }
  const { title, description, deadline } = req.body;
  if (!title || !description || !deadline) {
    return res.status(400).json({ success: false, message: 'All fields required' });
  }
  if (new Date(deadline) <= new Date()) {
    return res.status(400).json({ success: false, message: 'Deadline must be a future date' });
  }
  try {
    const job = await Job.create({
      employerId: req.user.id,
      employerName: req.user.name,
      title,
      description,
      deadline,
    });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/jobs/:id/close
router.patch('/:id/close', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ success: false, message: 'Only employers can close jobs' });
  }
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not your job' });
    }
    job.status = 'CLOSED';
    await job.save();
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
