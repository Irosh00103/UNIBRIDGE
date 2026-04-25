const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Employer = require('../models/Employer');
const User = require('../models/User');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, requireRole } = require('../middleware/auth');

const isStudentOpenToOpportunities = (studentProfile) => {
  return Boolean(studentProfile?.isAvailable) || (
    typeof studentProfile?.availabilityStatus === 'string' &&
    studentProfile.availabilityStatus !== 'not-available'
  );
};

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

router.get('/students/search', auth, async (req, res) => {
  try {
    if (!['employer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Employers and admins only' });
    }

    const email = String(req.query.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid student email is required' });
    }

    const studentUser = await User.findOne({ email, role: 'student' }).select('_id email name role');
    if (!studentUser) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentProfile = await Student.findOne({ userId: studentUser._id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (!isStudentOpenToOpportunities(studentProfile)) {
      return res.status(403).json({ message: 'Student is currently not available for opportunities' });
    }

    if (req.user.role === 'employer') {
      const employerJobs = await Job.find({ employerId: req.user._id }).select('_id');
      const employerJobIds = employerJobs.map((job) => job._id);

      if (employerJobIds.length === 0) {
        return res.status(403).json({ message: 'You do not have posted jobs yet' });
      }

      const hasAppliedToEmployer = await Application.exists({
        jobId: { $in: employerJobIds },
        studentId: studentUser._id,
      });

      if (!hasAppliedToEmployer) {
        return res.status(403).json({
          message: 'Access denied. This student has not applied for your job postings',
        });
      }
    }

    return res.json({
      success: true,
      data: {
        ...studentProfile.toObject(),
        email: studentUser.email,
        name: studentUser.name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
