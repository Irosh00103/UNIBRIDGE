const mongoose = require('mongoose');

const kuppiSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String },
  title: { type: String, required: true },
  module: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Kuppi', kuppiSchema);
