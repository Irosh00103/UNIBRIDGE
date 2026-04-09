const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({
            $or: [{ recipient: req.user.id }, { userId: req.user.id }]
        })
            .sort({ createdAt: -1 })
            .limit(30)
            .populate('actor', 'name avatarUrl');
        const unreadCount = await Notification.countDocuments({
            $and: [{ $or: [{ recipient: req.user.id }, { userId: req.user.id }] }, { isRead: false }]
        });
        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { $and: [{ $or: [{ recipient: req.user.id }, { userId: req.user.id }] }, { isRead: false }] },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/:id/read', async (req, res) => {
    try {
        const updated = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                $or: [{ recipient: req.user.id }, { userId: req.user.id }]
            },
            { isRead: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/bulk-delete', async (req, res) => {
    try {
        const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
        if (ids.length === 0) {
            return res.status(400).json({ success: false, message: 'No notification IDs provided' });
        }

        await Notification.deleteMany({
            _id: { $in: ids },
            $or: [{ recipient: req.user.id }, { userId: req.user.id }]
        });

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Notification.findOneAndDelete({
            _id: req.params.id,
            $or: [{ recipient: req.user.id }, { userId: req.user.id }]
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
