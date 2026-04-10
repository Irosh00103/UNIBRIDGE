const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, sparse: true },
    year: { type: Number, required: true, enum: [1, 2, 3, 4] },
    semester: { type: Number, required: true, enum: [1, 2] },
    description: { type: String, default: '' },
    credits: { type: Number, default: 4 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate year-semester combinations
moduleSchema.index({ year: 1, semester: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Module', moduleSchema);
