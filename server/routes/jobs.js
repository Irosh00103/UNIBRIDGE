const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');
const { mapJobToPortalCategory } = require('../utils/jobCategoryMapper');

// ── PUBLIC: Get all portal jobs (no auth needed for browsing) ──
router.get('/portal', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/', protect, async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'OPEN' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        if (!['admin', 'employer'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Employers and admins only' });
        }
        
        const {
            title, description, deadline, company, venue, applyLink,
            location, type, salary, category, workMode, experience,
            qualification, sideSummary, overview, postedDate,
            responsibilities, requirements, skills, screeningQuestions, logo,
            salaryRange, jobType, questions
        } = req.body;
        
        if (!title || !description) {
            return res.status(400).json({ success: false, message: 'Title and description are required' });
        }
        
        // Compute portal category from category field
        const portalCategory = mapJobToPortalCategory({ category: category || '' });
        
        const job = await Job.create({
            employerId: req.user.id,
            employerName: req.user.name,
            company,
            title,
            description,
            venue,
            applyLink: applyLink || '',
            deadline: deadline ? new Date(deadline) : undefined,
            location: location || '',
            type: type || '',
            jobType: jobType || type || '',
            salary: salary || '',
            salaryRange: salaryRange || '',
            category: category || '',
            portalCategory,
            workMode: workMode || '',
            experience: experience || '',
            qualification: qualification || '',
            sideSummary: sideSummary || '',
            overview: overview || description,
            postedDate: postedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            responsibilities: responsibilities || [],
            requirements: requirements || [],
            questions: questions || [],
            skills: skills || [],
            screeningQuestions: screeningQuestions || [],
            logo: logo || '',
        });
        
        res.status(201).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✏️ UPDATE JOB
router.put('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ❌ DELETE JOB
router.delete('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        res.status(200).json({ success: true, message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id/close', protect,async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admins only' });
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
