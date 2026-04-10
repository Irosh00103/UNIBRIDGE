const express = require('express');
const router = express.Router();
const Kuppi = require('../models/Kuppi');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

const MODULE_CODE_PATTERN = /^[A-Z]{2,6}\d{2,4}[A-Z]?$/;
const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['Semester 1', 'Semester 2'];

const normalizeSpace = (value = '') => value.trim().replace(/\s+/g, ' ');

const isValidHttpUrl = (value = '') => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
        return false;
    }
};

const formatValidationError = (err) => {
    if (!err || err.name !== 'ValidationError' || !err.errors) {
        return null;
    }

    const messages = Object.values(err.errors)
        .map((fieldError) => fieldError.message)
        .filter(Boolean);

    return messages.length > 0 ? messages.join('. ') : 'Invalid Kuppi session data';
};

// Helper: serialize a post with per-user flags
const serializePost = (post, userId) => {
    const obj = post.toObject ? post.toObject() : post;
    obj.userLiked = obj.likes.some(id => id.toString() === userId);
    obj.userDisliked = obj.dislikes.some(id => id.toString() === userId);
    obj.userJoined = obj.participants.some(p =>
        (p._id || p).toString() === userId
    );
    return obj;
};

// GET /api/kuppi/posts
router.get('/posts', async (req, res) => {
    try {
        const posts = await Kuppi.find()
            .sort({ createdAt: -1 })
            .populate('student', 'name avatarUrl')
            .populate('participants', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');

        const data = posts.map(p => serializePost(p, req.user.id));
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/kuppi/posts/mine
router.get('/posts/mine', async (req, res) => {
    try {
        const posts = await Kuppi.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .populate('student', 'name avatarUrl')
            .populate('participants', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');

        const data = posts.map(p => serializePost(p, req.user.id));
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/kuppi/posts
router.post('/posts', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }

        const { title, module: mod, year, semester, date, time, location, description, maxParticipants } = req.body;

        const normalizedTitle = normalizeSpace(title || '');
        const normalizedModule = String(mod || '').trim().toUpperCase();
        const normalizedLocation = normalizeSpace(location || '');
        const normalizedDescription = normalizeSpace(description || '');
        const maxParticipantsRaw = String(maxParticipants || '').trim();

        if (!normalizedTitle) {
            return res.status(400).json({ success: false, message: 'Session title is required' });
        }
        if (normalizedTitle.length < 5 || normalizedTitle.length > 120) {
            return res.status(400).json({ success: false, message: 'Session title must be between 5 and 120 characters' });
        }

        if (!normalizedModule) {
            return res.status(400).json({ success: false, message: 'Module code is required' });
        }
        if (normalizedModule.length > 20 || !MODULE_CODE_PATTERN.test(normalizedModule)) {
            return res.status(400).json({ success: false, message: 'Module code must look like PHY101 or CS2040' });
        }

        const normalizedYear = normalizeSpace(String(year || ''));
        if (!YEAR_OPTIONS.includes(normalizedYear)) {
            return res.status(400).json({ success: false, message: 'Please select a valid academic year' });
        }

        const normalizedSemester = normalizeSpace(String(semester || ''));
        if (!SEMESTER_OPTIONS.includes(normalizedSemester)) {
            return res.status(400).json({ success: false, message: 'Please select a valid semester' });
        }

        if (!normalizedDescription) {
            return res.status(400).json({ success: false, message: 'Description is required' });
        }
        if (normalizedDescription.length < 10 || normalizedDescription.length > 1000) {
            return res.status(400).json({ success: false, message: 'Description must be between 10 and 1000 characters' });
        }

        if (!normalizedLocation) {
            return res.status(400).json({ success: false, message: 'Kuppi link is required' });
        }
        if (normalizedLocation.length > 160) {
            return res.status(400).json({ success: false, message: 'Kuppi link cannot exceed 160 characters' });
        }
        if (!isValidHttpUrl(normalizedLocation)) {
            return res.status(400).json({ success: false, message: 'Kuppi link must be a valid http/https URL' });
        }

        let parsedMaxParticipants;
        if (maxParticipantsRaw) {
            if (!/^\d+$/.test(maxParticipantsRaw)) {
                return res.status(400).json({ success: false, message: 'Max participants must be a whole number' });
            }
            parsedMaxParticipants = Number(maxParticipantsRaw);
            if (parsedMaxParticipants < 2 || parsedMaxParticipants > 500) {
                return res.status(400).json({ success: false, message: 'Max participants must be between 2 and 500' });
            }
        }

        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        const sessionDate = new Date(date);
        if (Number.isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
            return res.status(400).json({ success: false, message: 'Date and time must be in the future' });
        }

        const post = await Kuppi.create({
            student: req.user.id,
            title: normalizedTitle,
            module: normalizedModule,
            year: normalizedYear,
            semester: normalizedSemester,
            date: sessionDate,
            location: normalizedLocation || undefined,
            description: normalizedDescription,
            maxParticipants: parsedMaxParticipants,
        });

        const populated = await Kuppi.findById(post._id)
            .populate('student', 'name avatarUrl')
            .populate('participants', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');

        res.status(201).json({ success: true, data: serializePost(populated, req.user.id) });
    } catch (err) {
        const validationMessage = formatValidationError(err);
        if (validationMessage) {
            return res.status(400).json({ success: false, message: validationMessage });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/kuppi/posts/:id
router.put('/posts/:id', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const isOwner = post.student.toString() === req.user.id;
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
        }

        const { title, module: mod, year, semester, date, location, description, maxParticipants } = req.body;

        const normalizedTitle = normalizeSpace(title || '');
        const normalizedModule = String(mod || '').trim().toUpperCase();
        const normalizedLocation = normalizeSpace(location || '');
        const normalizedDescription = normalizeSpace(description || '');
        const maxParticipantsRaw = String(maxParticipants || '').trim();

        if (!normalizedTitle || normalizedTitle.length < 5 || normalizedTitle.length > 120) {
            return res.status(400).json({ success: false, message: 'Session title must be between 5 and 120 characters' });
        }

        if (!normalizedModule || normalizedModule.length > 20 || !MODULE_CODE_PATTERN.test(normalizedModule)) {
            return res.status(400).json({ success: false, message: 'Module code must look like PHY101 or CS2040' });
        }

        const normalizedYear = normalizeSpace(String(year || ''));
        if (!YEAR_OPTIONS.includes(normalizedYear)) {
            return res.status(400).json({ success: false, message: 'Please select a valid academic year' });
        }

        const normalizedSemester = normalizeSpace(String(semester || ''));
        if (!SEMESTER_OPTIONS.includes(normalizedSemester)) {
            return res.status(400).json({ success: false, message: 'Please select a valid semester' });
        }

        if (!normalizedDescription || normalizedDescription.length < 10 || normalizedDescription.length > 1000) {
            return res.status(400).json({ success: false, message: 'Description must be between 10 and 1000 characters' });
        }

        if (!normalizedLocation) {
            return res.status(400).json({ success: false, message: 'Kuppi link is required' });
        }
        if (normalizedLocation.length > 160) {
            return res.status(400).json({ success: false, message: 'Kuppi link cannot exceed 160 characters' });
        }
        if (!isValidHttpUrl(normalizedLocation)) {
            return res.status(400).json({ success: false, message: 'Kuppi link must be a valid http/https URL' });
        }

        const sessionDate = new Date(date);
        if (Number.isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
            return res.status(400).json({ success: false, message: 'Date and time must be in the future' });
        }

        let parsedMaxParticipants;
        if (maxParticipantsRaw) {
            if (!/^\d+$/.test(maxParticipantsRaw)) {
                return res.status(400).json({ success: false, message: 'Max participants must be a whole number' });
            }
            parsedMaxParticipants = Number(maxParticipantsRaw);
            if (parsedMaxParticipants < 2 || parsedMaxParticipants > 500) {
                return res.status(400).json({ success: false, message: 'Max participants must be between 2 and 500' });
            }
        }

        post.title = normalizedTitle;
        post.module = normalizedModule;
        post.year = normalizedYear;
        post.semester = normalizedSemester;
        post.date = sessionDate;
        post.location = normalizedLocation;
        post.description = normalizedDescription;
        post.maxParticipants = parsedMaxParticipants;
        await post.save();

        const updated = await Kuppi.findById(post._id)
            .populate('student', 'name avatarUrl')
            .populate('participants', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');

        res.json({ success: true, data: serializePost(updated, req.user.id) });
    } catch (err) {
        const validationMessage = formatValidationError(err);
        if (validationMessage) {
            return res.status(400).json({ success: false, message: validationMessage });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/kuppi/posts/:id
router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const isOwner = post.student.toString() === req.user.id;
        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
        }

        await Kuppi.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Kuppi session deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/kuppi/posts/:id/like
router.post('/posts/:id/like', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const uid = req.user.id;
        const likedIdx = post.likes.indexOf(uid);
        const dislikedIdx = post.dislikes.indexOf(uid);

        if (likedIdx > -1) {
            post.likes.splice(likedIdx, 1);
        } else {
            post.likes.push(uid);
            if (dislikedIdx > -1) post.dislikes.splice(dislikedIdx, 1);
        }
        await post.save();

        res.json({
            success: true,
            likes: post.likes,
            dislikes: post.dislikes,
            userLiked: post.likes.some(id => id.toString() === uid),
            userDisliked: post.dislikes.some(id => id.toString() === uid),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/kuppi/posts/:id/dislike
router.post('/posts/:id/dislike', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const uid = req.user.id;
        const dislikedIdx = post.dislikes.indexOf(uid);
        const likedIdx = post.likes.indexOf(uid);

        if (dislikedIdx > -1) {
            post.dislikes.splice(dislikedIdx, 1);
        } else {
            post.dislikes.push(uid);
            if (likedIdx > -1) post.likes.splice(likedIdx, 1);
        }
        await post.save();

        res.json({
            success: true,
            likes: post.likes,
            dislikes: post.dislikes,
            userLiked: post.likes.some(id => id.toString() === uid),
            userDisliked: post.dislikes.some(id => id.toString() === uid),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/kuppi/posts/:id/join
router.post('/posts/:id/join', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id).populate('participants', 'name avatarUrl');
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const uid = req.user.id;

        if (post.student.toString() === uid) {
            return res.status(400).json({ success: false, message: 'You cannot join your own session' });
        }

        const joinedIdx = post.participants.findIndex(p => p._id.toString() === uid);

        if (joinedIdx > -1) {
            post.participants.splice(joinedIdx, 1);
        } else {
            if (post.maxParticipants && post.participants.length >= post.maxParticipants) {
                return res.status(400).json({ success: false, message: 'Session is full' });
            }
            post.participants.push(uid);
            if (post.student.toString() !== uid) {
                await Notification.create({
                    recipient: post.student,
                    actor: uid,
                    type: 'kuppi_join',
                    title: 'New Kuppi application',
                    message: `${req.user.name} joined your Kuppi session "${post.title}"`,
                    entityType: 'kuppi',
                    entityId: post._id
                });
            }
        }
        await post.save();

        const updated = await Kuppi.findById(post._id).populate('participants', 'name avatarUrl');
        res.json({
            success: true,
            participants: updated.participants,
            userJoined: updated.participants.some(p => p._id.toString() === uid),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/kuppi/posts/:id/comments
router.post('/posts/:id/comments', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const post = await Kuppi.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({ text: text.trim(), user: req.user.id });
        await post.save();

        if (post.student.toString() !== req.user.id) {
            await Notification.create({
                recipient: post.student,
                actor: req.user.id,
                type: 'kuppi_comment',
                title: 'New comment on your Kuppi',
                message: `${req.user.name} commented on "${post.title}"`,
                entityType: 'kuppi',
                entityId: post._id
            });
        }

        const updated = await Kuppi.findById(post._id).populate('comments.user', 'name avatarUrl');
        res.json({ success: true, comments: updated.comments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET /api/kuppi/posts/:id/applicants/export
router.get('/posts/:id/applicants/export', async (req, res) => {
    try {
        const post = await Kuppi.findById(req.params.id)
            .populate('student', 'name')
            .populate('participants', 'name email');

        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        if (post.student._id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Only the post owner can export applicants' });
        }

        const xlsx = require('xlsx');
        const data = post.participants.map(p => ({
            Name: p.name || 'N/A',
            Email: p.email || 'N/A'
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Applicants');

        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const filename = `kuppi-${post._id}-applicants.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/kuppi/comments/:commentId
router.delete('/comments/:commentId', async (req, res) => {
    try {
        const post = await Kuppi.findOne({ 'comments._id': req.params.commentId });
        if (!post) return res.status(404).json({ success: false, message: 'Comment not found' });

        const comment = post.comments.id(req.params.commentId);
        const uid = req.user.id;

        if (comment.user.toString() !== uid && post.student.toString() !== uid) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        post.comments.pull(req.params.commentId);
        await post.save();

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
