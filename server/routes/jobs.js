const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'OPEN' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ success: false, message: 'Employers only' });
        }
        
        const { title, description, deadline } = req.body;
        
        if (!title || !description || !deadline) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        
        const deadlineDate = new Date(deadline);
        if (deadlineDate <= new Date()) {
            return res.status(400).json({ success: false, message: 'Deadline must be a future date' });
        }
        
        const job = await Job.create({
            employerId: req.user.id,
            employerName: req.user.name,
            title,
            description,
            deadline: deadlineDate
        });
        
        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id/close', async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ success: false, message: 'Employers only' });
        }
        
        const job = await Job.findByIdAndUpdate(req.params.id, { status: 'CLOSED' }, { new: true });
        
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
