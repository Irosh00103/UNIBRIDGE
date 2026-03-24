const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user by email (case insensitive)
        const user = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET);
        
        res.status(200).json({ success: true, token, user: payload });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
