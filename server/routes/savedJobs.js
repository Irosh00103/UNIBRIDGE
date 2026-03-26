const express = require('express');
const router = express.Router();
const SavedJob = require('../models/SavedJob');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET saved jobs for the logged-in user
router.get('/', async (req, res) => {
    try {
        const savedJobs = await SavedJob.find({ userId: req.user.id })
            .populate('jobId')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: savedJobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// SAVE a job
router.post('/', async (req, res) => {
    try {
        const { jobId } = req.body;
        if (!jobId) {
            return res.status(400).json({ success: false, message: 'jobId is required' });
        }

        const existing = await SavedJob.findOne({ jobId, userId: req.user.id });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Job already saved' });
        }

        const savedJob = await SavedJob.create({ jobId, userId: req.user.id });
        res.status(201).json({ success: true, data: savedJob });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// UNSAVE a job
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await SavedJob.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Saved job not found' });
        }

        res.status(200).json({ success: true, message: 'Saved job removed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
