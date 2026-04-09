const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Employer = require('../models/Employer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendStatusEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');

router.post('/', [auth, requireRole('student'), upload.single('cv')], async (req, res) => {
  try {
    const { jobId, answers } = req.body;
    if (!req.file) return res.status(400).json({ message: 'CV upload is required' });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });
    const existing = await Application.findOne({ jobId, studentId: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });
    const parsedAnswers = answers ? JSON.parse(answers) : [];
    const application = await Application.create({
      jobId,
      studentId: req.user._id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      studentEmail: req.user.email,
      answers: parsedAnswers,
      cvFileName: req.file.originalname,
      cvFilePath: req.file.path,
      status: 'pending',
      updatedAt: Date.now()
    });
    const employer = await Employer.findById(job.employerId);
    if (employer) {
      await Notification.create({
        userId: employer.userId,
        recipient: employer.userId,
        type: 'new_application',
        title: 'New Application',
        message: `${student.firstName} ${student.lastName} applied for "${job.title}"`,
        relatedId: application._id,
        entityType: 'job',
        entityId: job._id
      });
    }
    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let applications;
    if (req.user.role === 'employer') {
      const employer = await Employer.findOne({ userId: req.user._id });
      const jobs = await Job.find({ employerId: employer?._id });
      applications = await Application.find({ jobId: { $in: jobs.map((j) => j._id) } }).sort({ appliedAt: -1 });
    } else {
      applications = await Application.find({ studentId: req.user._id }).sort({ appliedAt: -1 });
    }
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/status', [auth, requireRole('employer'), body('status').isIn(['pending', 'selected', 'rejected'])], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = req.body.status;
    application.updatedAt = Date.now();
    await application.save();
    const studentUser = await User.findById(application.studentId);
    const job = await Job.findById(application.jobId);
    if (studentUser && job) {
      await sendStatusEmail(studentUser.email, studentUser.name || 'Student', job.title, req.body.status);
      await Notification.create({
        userId: studentUser._id,
        recipient: studentUser._id,
        type: 'application_status',
        title: 'Application Status Updated',
        message: `Your application for "${job.title}" is now ${req.body.status.toUpperCase()}`,
        relatedId: application._id,
        entityType: 'job',
        entityId: job._id
      });
    }
    res.json({ message: 'Status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/cv', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application?.cvFilePath) return res.status(404).json({ message: 'CV file not found' });
    const filePath = path.resolve(application.cvFilePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'CV file not found' });
    res.download(filePath, application.cvFileName || 'cv.pdf');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
