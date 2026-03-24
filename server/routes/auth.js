const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        // Default all registrations strictly to students
        if (role !== 'student') {
            return res.status(400).json({ success: false, message: 'Only students can register. Admins are configured centrally.' });
        }
        
        const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const user = await User.create({ name, email, passwordHash, role });
        
        const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
        
        res.status(201).json({ success: true, token, user: payload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const payload = { id: user._id, name: user.name, email: user.email, role: user.role };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30m' });
        
        res.status(200).json({ success: true, token, user: payload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
