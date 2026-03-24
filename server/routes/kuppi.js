const express = require('express');
const router = express.Router();
const Kuppi = require('../models/Kuppi');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

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

// POST /api/kuppi/posts
router.post('/posts', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }

        const { title, module: mod, date, time, location, description, maxParticipants } = req.body;

        if (!title || !mod || !date) {
            return res.status(400).json({ success: false, message: 'Title, module, and date are required' });
        }

        const sessionDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sessionDate < today) {
            return res.status(400).json({ success: false, message: 'Date must be in the future' });
        }

        const post = await Kuppi.create({
            student: req.user.id,
            title,
            module: mod,
            date: sessionDate,
            location,
            description,
            maxParticipants: maxParticipants ? Number(maxParticipants) : undefined,
        });

        const populated = await Kuppi.findById(post._id)
            .populate('student', 'name avatarUrl')
            .populate('participants', 'name avatarUrl')
            .populate('comments.user', 'name avatarUrl');

        res.status(201).json({ success: true, data: serializePost(populated, req.user.id) });
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
