const mongoose = require('mongoose');

const isValidHttpUrl = (value = '') => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
        return false;
    }
};

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const kuppiSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 120 },
    module: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        maxlength: 20,
        match: [/^[A-Z]{2,6}\d{2,4}[A-Z]?$/, 'Module code must look like PHY101 or CS2040']
    },
    year: {
        type: String,
        enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4']
    },
    semester: {
        type: String,
        enum: ['Semester 1', 'Semester 2']
    },
    date: { type: Date, required: true },
    location: {
        type: String,
        trim: true,
        maxlength: 160,
        validate: {
            validator: (value) => !value || isValidHttpUrl(value),
            message: 'Kuppi link must be a valid http/https URL'
        }
    },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    // Keep backward compatibility for legacy records that stored 0 as "unlimited".
    maxParticipants: { type: Number, min: 0, max: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Kuppi', kuppiSchema);
