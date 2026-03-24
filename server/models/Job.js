const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerName: String,
    company: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    venue: { type: String, default: '' },
    applyLink: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['OPEN','CLOSED'], default: 'OPEN' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
