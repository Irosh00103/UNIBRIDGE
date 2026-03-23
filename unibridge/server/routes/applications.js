const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// POST /api/applications
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can apply' });
  }
  const { jobId, cvLink, note } = req.body;
  if (!jobId || !cvLink) {
    return res.status(400).json({ success: false, message: 'Job and CV link required' });
  }
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (new Date(job.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Job deadline has passed' });
    }
    const existing = await Application.findOne({ studentId: req.user.id, jobId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    const app = await Application.create({
      studentId: req.user.id,
      studentName: req.user.name,
      studentEmail: req.user.email,
      jobId,
      cvLink,
      note,
    });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/applications/job/:jobId
router.get('/job/:jobId', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ success: false, message: 'Only employers can view applicants' });
  }
  try {
    const apps = await Application.find({ jobId: req.params.jobId });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/applications/mine
router.get('/mine', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ success: false, message: 'Only students can view their applications' });
  }
  try {
    const apps = await Application.find({ studentId: req.user.id }).populate('jobId', 'title');
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/applications/:id/status
router.patch('/:id/status', protect, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ success: false, message: 'Only employers can update status' });
  }
  const { status } = req.body;
  if (!['SELECTED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    app.status = status;
    await app.save();
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
