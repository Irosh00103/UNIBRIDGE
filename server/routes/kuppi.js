const express = require('express');
const router = express.Router();
const Kuppi = require('../models/Kuppi');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const sessions = await Kuppi.find().sort({ date: 1 });
        res.status(200).json({ success: true, data: sessions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }
        
        const { title, module: reqModule, date, description } = req.body;
        
        if (!title || !reqModule || !date) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        
        const sessionDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (sessionDate < today) {
            return res.status(400).json({ success: false, message: 'Session date must be in the future' });
        }
        
        const session = await Kuppi.create({
            studentId: req.user.id,
            studentName: req.user.name,
            title,
            module: reqModule,
            date: sessionDate,
            description
        });
        
        res.status(201).json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
