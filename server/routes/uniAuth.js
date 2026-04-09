const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Employer = require('../models/Employer');
const Student = require('../models/Student');
const { auth } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register/employer', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('companyName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, companyName, industry, location, website, description, contactPerson, contactPhone } = req.body;
    const existing = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: companyName, email, passwordHash, role: 'employer' });
    const profile = await Employer.create({ userId: user._id, companyName, industry, location, website, description, contactPerson, contactPhone });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role }, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register/student', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, firstName, lastName, phone, education, major, graduationYear, skills, bio, linkedin, portfolio } = req.body;
    const existing = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name: `${firstName} ${lastName}`.trim(), email, passwordHash, role: 'student' });
    const profile = await Student.create({ userId: user._id, firstName, lastName, phone, education, major, graduationYear, skills: skills || [], bio, linkedin, portfolio });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role }, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    let profile = null;
    if (user.role === 'employer') profile = await Employer.findOne({ userId: user._id });
    if (user.role === 'student') profile = await Student.findOne({ userId: user._id });
    const token = generateToken(user._id);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name }, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'employer') profile = await Employer.findOne({ userId: req.user._id });
    if (req.user.role === 'student') profile = await Student.findOne({ userId: req.user._id });
    res.json({ user: { id: req.user._id, email: req.user.email, role: req.user.role, name: req.user.name }, profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
