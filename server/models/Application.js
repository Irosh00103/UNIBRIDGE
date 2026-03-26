const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    // ── existing UNIBRIDGE fields ──
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: String,
    studentEmail: String,
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    cvLink: { type: String, default: '' },
    note: String,
    status: { type: String, enum: ['PENDING','SELECTED','REJECTED','Pending','Accepted','Rejected', 'pending', 'selected', 'rejected'], default: 'PENDING' },

    // ── Job Portal enrichment fields ──
    applicantPhone: { type: String, default: '' },
    resume: { type: String, default: '' },
    screeningAnswers: { type: Object, default: {} },
    answers: {
      type: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
          answerText: { type: String, required: true },
        },
      ],
      default: [],
    },
    cvFileName: { type: String, default: '' },
    cvFilePath: { type: String, default: '' },
    assignment: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      deadline: { type: Date },
      instructions: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },

    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Application', applicationSchema);
