const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Employer = require('../models/Employer');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

router.get('/all', async (req, res) => {
  try {
    const jobs = await Job.find().populate('employerId', 'companyName').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', [auth, requireRole('employer'), body('title').notEmpty().trim(), body('description').notEmpty().trim(), body('deadline').isISO8601()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description, requirements, location, jobType, salaryRange, deadline, questions } = req.body;
    const employer = await Employer.findOne({ userId: req.user._id });
    if (!employer) return res.status(404).json({ message: 'Employer profile not found' });
    const job = await Job.create({
      employerId: employer._id,
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? [requirements] : []),
      location,
      jobType,
      salaryRange,
      deadline: new Date(deadline),
      status: 'open',
      questions: (questions || []).map((q, idx) => ({ ...q, order: idx })),
      updatedAt: Date.now()
    });
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let jobs;
    if (req.user.role === 'employer') {
      const employer = await Employer.findOne({ userId: req.user._id });
      jobs = await Job.find({ employerId: employer._id }).sort({ createdAt: -1 });
    } else {
      jobs = await Job.find({ status: { $in: ['open', 'OPEN'] }, deadline: { $gt: new Date() } }).sort({ createdAt: -1 });
    }
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/close', [auth, requireRole('employer')], async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.status = 'closed';
    job.updatedAt = Date.now();
    await job.save();
    const applications = await Application.find({ jobId: job._id });
    for (const app of applications) {
      await Notification.create({
        userId: app.studentId,
        recipient: app.studentId,
        type: 'job_closed',
        title: 'Job Closed',
        message: `The job "${job.title}" has been closed.`,
        relatedId: job._id,
        entityType: 'job',
        entityId: job._id
      });
    }
    res.json({ message: 'Job closed successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
