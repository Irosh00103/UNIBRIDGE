const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
    try {
        const { search = '', sort = 'newest' } = req.query;
        const query = search
            ? {
                $or: [
                    { title: new RegExp(search, 'i') },
                    { module: new RegExp(search, 'i') },
                    { description: new RegExp(search, 'i') }
                ]
            }
            : {};

        let sortOpt = { createdAt: -1 };
        if (sort === 'likes') sortOpt = { likesCount: -1, createdAt: -1 };
        if (sort === 'module') sortOpt = { module: 1, createdAt: -1 };

        const materialsRaw = await Material.find(query)
            .sort(sort === 'likes' ? { createdAt: -1 } : sortOpt)
            .populate('comments.user', 'name avatarUrl');

        const materials = materialsRaw
            .map((m) => {
                const obj = m.toObject();
                obj.likesCount = obj.likes?.length || 0;
                obj.dislikesCount = obj.dislikes?.length || 0;
                obj.userLiked = obj.likes.some((id) => id.toString() === req.user.id);
                obj.userDisliked = obj.dislikes.some((id) => id.toString() === req.user.id);
                return obj;
            })
            .sort((a, b) => (sort === 'likes' ? b.likesCount - a.likesCount : 0));

        res.status(200).json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Students only' });
        }
        
        const { title, module: reqModule, type, link, description } = req.body;
        
        if (!title || !reqModule || !type || !link) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }
        
        if (!link.startsWith('http')) {
            return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
        }
        
        const material = await Material.create({
            studentId: req.user.id,
            studentName: req.user.name,
            title,
            module: reqModule,
            type,
            link,
            description
        });
        
        res.status(201).json({ success: true, data: material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/like', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        const uid = req.user.id;
        const liked = material.likes.some((id) => id.toString() === uid);
        material.likes = liked ? material.likes.filter((id) => id.toString() !== uid) : [...material.likes, uid];
        material.dislikes = material.dislikes.filter((id) => id.toString() !== uid);
        await material.save();

        if (!liked && material.studentId.toString() !== uid) {
            await Notification.create({
                recipient: material.studentId,
                actor: uid,
                type: 'material_like',
                title: 'Material liked',
                message: `${req.user.name} liked your material "${material.title}"`,
                entityType: 'material',
                entityId: material._id
            });
        }

        return res.json({ success: true, likes: material.likes, dislikes: material.dislikes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/dislike', async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
        const uid = req.user.id;
        const disliked = material.dislikes.some((id) => id.toString() === uid);
        material.dislikes = disliked ? material.dislikes.filter((id) => id.toString() !== uid) : [...material.dislikes, uid];
        material.likes = material.likes.filter((id) => id.toString() !== uid);
        await material.save();
        return res.json({ success: true, likes: material.likes, dislikes: material.dislikes });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/:id/comments', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const material = await Material.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

        material.comments.push({ text: text.trim(), user: req.user.id });
        await material.save();
        const updated = await Material.findById(material._id).populate('comments.user', 'name avatarUrl');

        if (material.studentId.toString() !== req.user.id) {
            await Notification.create({
                recipient: material.studentId,
                actor: req.user.id,
                type: 'material_comment',
                title: 'New material comment',
                message: `${req.user.name} commented on your material "${material.title}"`,
                entityType: 'material',
                entityId: material._id
            });
        }

        return res.json({ success: true, comments: updated.comments });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
