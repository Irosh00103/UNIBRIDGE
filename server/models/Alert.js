const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, default: '', trim: true },
    message: { type: String, required: true, trim: true },
    time: { type: String, default: '', trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
