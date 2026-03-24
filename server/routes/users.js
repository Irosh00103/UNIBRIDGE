const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/me', async (req, res) => {
    try {
        const { name, bio, avatarUrl, password } = req.body;
        const update = {};
        if (name) update.name = name;
        if (typeof bio === 'string') update.bio = bio;
        if (typeof avatarUrl === 'string') update.avatarUrl = avatarUrl;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            update.passwordHash = await bcrypt.hash(password, salt);
        }
        const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-passwordHash');
        return res.json({ success: true, data: user });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/me', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        return res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
