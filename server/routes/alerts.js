const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, company, message, time, isRead } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'title and message are required' });
    }
    const alert = await Alert.create({
      userId: req.user.id,
      title,
      company: company || '',
      message,
      time: time || '',
      isRead: !!isRead,
    });
    return res.status(201).json({ success: true, data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/read', async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.status(200).json({ success: true, data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/read-all', async (req, res) => {
  try {
    await Alert.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All alerts marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    return res.status(200).json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    await Alert.deleteMany({ _id: { $in: ids }, userId: req.user.id });
    return res.status(200).json({ success: true, message: 'Selected alerts deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
