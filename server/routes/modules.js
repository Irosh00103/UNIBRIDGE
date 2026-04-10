const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Authorization check - admin only
const checkAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
};

// GET all modules
router.get('/', async (req, res) => {
    try {
        const { year, semester, search } = req.query;
        let query = {};

        if (year) query.year = Number(year);
        if (semester) query.semester = Number(semester);
        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { code: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        const modules = await Module.find(query).sort({ year: 1, semester: 1, name: 1 });
        res.json({ success: true, data: modules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET modules by year
router.get('/year/:year', async (req, res) => {
    try {
        const modules = await Module.find({ year: Number(req.params.year) }).sort({ semester: 1, name: 1 });
        res.json({ success: true, data: modules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET modules by year and semester
router.get('/year/:year/semester/:semester', async (req, res) => {
    try {
        const modules = await Module.find({
            year: Number(req.params.year),
            semester: Number(req.params.semester)
        }).sort({ name: 1 });
        res.json({ success: true, data: modules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single module
router.get('/:id', async (req, res) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        res.json({ success: true, data: module });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE module (admin only)
router.post('/', checkAdmin, async (req, res) => {
    try {
        const { name, code, year, semester, description, credits } = req.body;

        if (!name || !year || !semester) {
            return res.status(400).json({ success: false, message: 'Name, year, and semester are required' });
        }

        // Check for duplicate
        const existing = await Module.findOne({ 
            year: Number(year), 
            semester: Number(semester), 
            name: name.trim() 
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Module already exists for this year-semester combination' });
        }

        const module = new Module({
            name: name.trim(),
            code: code?.trim(),
            year: Number(year),
            semester: Number(semester),
            description: description?.trim() || '',
            credits: credits || 4
        });

        await module.save();
        res.status(201).json({ success: true, data: module, message: 'Module created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE module (admin only)
router.put('/:id', checkAdmin, async (req, res) => {
    try {
        const { name, code, year, semester, description, credits } = req.body;
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Check for duplicate if year/semester/name changed
        if ((name && name !== module.name) || year !== undefined || semester !== undefined) {
            const newYear = year !== undefined ? year : module.year;
            const newSemester = semester !== undefined ? semester : module.semester;
            const newName = name ? name.trim() : module.name;

            const existing = await Module.findOne({
                _id: { $ne: module._id },
                year: Number(newYear),
                semester: Number(newSemester),
                name: newName
            });

            if (existing) {
                return res.status(400).json({ success: false, message: 'Module already exists for this year-semester combination' });
            }
        }

        if (name) module.name = name.trim();
        if (code) module.code = code.trim();
        if (year !== undefined) module.year = Number(year);
        if (semester !== undefined) module.semester = Number(semester);
        if (description !== undefined) module.description = description.trim();
        if (credits !== undefined) module.credits = credits;
        module.updatedAt = Date.now();

        await module.save();
        res.json({ success: true, data: module, message: 'Module updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE module (admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
    try {
        const module = await Module.findByIdAndDelete(req.params.id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        res.json({ success: true, data: module, message: 'Module deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
