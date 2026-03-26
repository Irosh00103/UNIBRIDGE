const mongoose = require('mongoose');

const screeningQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema({
    // ── existing UNIBRIDGE fields ──
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerName: String,
    company: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    venue: { type: String, default: '' },
    applyLink: { type: String, default: '' },
    deadline: { type: Date },
    status: { type: String, enum: ['OPEN','CLOSED', 'open', 'closed'], default: 'OPEN' },

    // ── Job Portal enrichment fields ──
    location: { type: String, default: '' },
    type: { type: String, default: '' },              // Internship, Graduate Role, Entry Level, etc.
    salary: { type: String, default: '' },
    category: { type: String, default: '' },
    portalCategory: { type: String, default: 'other' },
    workMode: { type: String, default: '' },           // On-site, Hybrid, Remote
    experience: { type: String, default: '' },
    qualification: { type: String, default: '' },
    sideSummary: { type: String, default: '' },
    overview: { type: String, default: '' },
    postedDate: { type: String, default: '' },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    salaryRange: { type: String, default: '' },
    jobType: { type: String, default: '' },
    questions: {
      type: [
        {
          questionText: { type: String, required: true },
          isRequired: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    skills: { type: [String], default: [] },
    screeningQuestions: { type: [screeningQuestionSchema], default: [] },
    logo: { type: String, default: '' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
