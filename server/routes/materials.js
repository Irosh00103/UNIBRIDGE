const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const materials = await Material.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }
        
        const { title, module: reqModule, type, link } = req.body;
        
        if (!title || !reqModule || !type || !link) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        
        if (!link.startsWith('http')) {
            return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
        }
        
        const material = await Material.create({
            studentId: req.user.id,
            studentName: req.user.name,
            title,
            module: reqModule,
            type,
            link
        });
        
        res.status(201).json({ success: true, data: material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
