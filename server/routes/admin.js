const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Material = require('../models/Material');
const Kuppi = require('../models/Kuppi');
const User = require('../models/User');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { protect } = require('../middleware/auth');

router.use(protect);

router.use((req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admins only' });
    }
    return next();
});

// Analytics
router.get('/analytics', async (req, res) => {
    try {
        const [users, students, jobs, applications, materials, kuppis, savedJobs] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'student' }),
            Job.countDocuments(),
            Application.countDocuments(),
            Material.countDocuments(),
            Kuppi.countDocuments(),
            SavedJob.countDocuments()
        ]);
        res.json({
            success: true,
            data: { users, students, employers: users - students - 1, jobs, applications, materials, kuppis, savedJobs }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Users CRUD
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { name, role, bio } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { name, role, bio }, { new: true, runValidators: true });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Jobs CRUD
router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/jobs/:id', async (req, res) => {
    try {
        const {
            title, company, status, deadline, applyLink, venue,
            location, type, salary, category, portalCategory, workMode,
            experience, qualification, sideSummary, overview, description,
            responsibilities, requirements, skills, screeningQuestions, logo
        } = req.body;
        const update = {
            title, company, status, deadline, applyLink, venue,
            location, type, salary, category, portalCategory, workMode,
            experience, qualification, sideSummary, overview, description,
            responsibilities, requirements, skills, screeningQuestions, logo
        };
        // Remove undefined keys
        Object.keys(update).forEach(k => update[k] === undefined && delete update[k]);
        const job = await Job.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        res.json({ success: true, data: job });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/jobs/:id', async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Materials CRUD
router.get('/materials', async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/materials/:id', async (req, res) => {
    try {
        const { title, module, type, link } = req.body;
        const material = await Material.findByIdAndUpdate(req.params.id, { title, module, type, link }, { new: true, runValidators: true });
        res.json({ success: true, data: material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/materials/:id', async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Kuppis CRUD
router.get('/kuppis', async (req, res) => {
    try {
        const kuppis = await Kuppi.find().populate('student', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, data: kuppis });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/kuppis/:id', async (req, res) => {
    try {
        const { title, module, year, semester, date, location, maxParticipants } = req.body;
        const kuppi = await Kuppi.findByIdAndUpdate(
            req.params.id,
            { title, module, year, semester, date, location, maxParticipants },
            { new: true, runValidators: true }
        );
        res.json({ success: true, data: kuppi });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/kuppis/:id', async (req, res) => {
    try {
        await Kuppi.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kuppi deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
