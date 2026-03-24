const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }
        
        const { jobId, cvLink, note } = req.body;
        
        if (!jobId || !cvLink) {
            return res.status(400).json({ success: false, message: 'Job ID and CV Link are required' });
        }
        
        if (!cvLink.startsWith('http')) {
            return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
        }
        
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        
        if (new Date(job.deadline) < new Date()) {
            return res.status(400).json({ success: false, message: 'Job deadline has passed' });
        }
        
        const existingApp = await Application.findOne({ studentId: req.user.id, jobId });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'You already applied to this job' });
        }
        
        const application = await Application.create({
            studentId: req.user.id,
            studentName: req.user.name,
            studentEmail: req.user.email,
            jobId,
            cvLink,
            note
        });
        
        res.status(201).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/mine', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }
        
        const applications = await Application.find({ studentId: req.user.id }).populate('jobId', 'title employerName');
        res.status(200).json({ success: true, data: applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/job/:jobId', async (req, res) => {
    try {
        if (!['employer', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Employers or admins only' });
        }
        
        const applications = await Application.find({ jobId: req.params.jobId });
        res.status(200).json({ success: true, data: applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        if (!['employer', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Employers or admins only' });
        }
        
        const { status } = req.body;
        if (status !== 'SELECTED' && status !== 'REJECTED') {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }
        
        res.status(200).json({ success: true, data: application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
