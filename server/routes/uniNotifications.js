const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ userId: req.user._id }, { recipient: req.user._id }]
    }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $and: [
        { $or: [{ userId: req.user._id }, { recipient: req.user._id }] },
        { isRead: false }
      ]
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ userId: req.user._id }, { recipient: req.user._id }]
      },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { $and: [{ $or: [{ userId: req.user._id }, { recipient: req.user._id }] }, { isRead: false }] },
      { isRead: true }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
