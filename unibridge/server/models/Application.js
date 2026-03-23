const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String },
  studentEmail: { type: String },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  cvLink: { type: String, required: true },
  note: { type: String },
  status: { type: String, enum: ['PENDING','SELECTED','REJECTED'], default: 'PENDING' },
  appliedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Application', applicationSchema);
