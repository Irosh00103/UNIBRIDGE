const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { auth, requireRole } = require('../middleware/auth');

const VALID_AVAILABILITY_STATUSES = new Set([
  'not-available',
  'open-opportunities',
  'actively-job-hunting',
]);

const normalizeAvailabilityStatus = (value, isAvailable = false) => {
  if (typeof value === 'string' && VALID_AVAILABILITY_STATUSES.has(value)) {
    if (value === 'not-available' && isAvailable) {
      return 'open-opportunities';
    }
    return value;
  }

  return isAvailable ? 'open-opportunities' : 'not-available';
};

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
        email: req.user.email,
        isAvailable: false,
        availabilityStatus: 'not-available',
      });
    }

    const normalizedStatus = normalizeAvailabilityStatus(
      student.availabilityStatus,
      student.isAvailable
    );

    if (
      student.availabilityStatus !== normalizedStatus ||
      student.isAvailable !== (normalizedStatus !== 'not-available')
    ) {
      student.availabilityStatus = normalizedStatus;
      student.isAvailable = normalizedStatus !== 'not-available';
      student.updatedAt = Date.now();
      await student.save();
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

    const updates = { ...req.body, updatedAt: Date.now() };

    if (Object.prototype.hasOwnProperty.call(updates, 'availabilityStatus')) {
      const normalizedStatus = normalizeAvailabilityStatus(
        updates.availabilityStatus,
        updates.isAvailable
      );
      updates.availabilityStatus = normalizedStatus;
      updates.isAvailable = normalizedStatus !== 'not-available';
    } else if (Object.prototype.hasOwnProperty.call(updates, 'isAvailable')) {
      updates.availabilityStatus = normalizeAvailabilityStatus(
        undefined,
        Boolean(updates.isAvailable)
      );
      updates.isAvailable = updates.availabilityStatus !== 'not-available';
    }

    const student = await Student.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true }
    );
    if (!student) return res.status(404).json({ message: 'Profile not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
