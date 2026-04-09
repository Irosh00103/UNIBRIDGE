const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

const isAdmin = (req) => req.user?.role === 'admin';
const isStudent = (req) => req.user?.role === 'student';

const mapMaterialForUser = (material, userId) => {
  const obj = material.toObject();
  obj.likesCount = obj.likes?.length || 0;
  obj.dislikesCount = obj.dislikes?.length || 0;
  obj.userLiked = (obj.likes || []).some((id) => id.toString() === userId);
  obj.userDisliked = (obj.dislikes || []).some((id) => id.toString() === userId);
  return obj;
};

const buildSearchQuery = (search) => {
  if (!search) return {};
  return {
    $or: [
      { title: new RegExp(search, 'i') },
      { module: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { studentName: new RegExp(search, 'i') }
    ]
  };
};

// Student own submissions (pending/approved/rejected)
router.get('/my-submissions', async (req, res) => {
  try {
    if (!isStudent(req)) {
      return res.status(403).json({ success: false, message: 'Students only' });
    }

    const items = await Material.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items.map((m) => mapMaterialForUser(m, req.user.id)) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Pending submissions for admin review
router.get('/pending', async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admins only' });
    }

    const { search = '' } = req.query;
    const query = {
      ...buildSearchQuery(search),
      status: 'pending'
    };

    const materials = await Material.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: materials.map((m) => mapMaterialForUser(m, req.user.id)) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Browse materials
router.get('/', async (req, res) => {
  try {
    const { search = '', sort = 'newest', status } = req.query;
    const searchQuery = buildSearchQuery(search);

    let query = searchQuery;

    if (isAdmin(req)) {
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        query = { ...searchQuery, status };
      }
    } else {
      query = { ...searchQuery, status: 'approved' };
    }

    let sortOpt = { createdAt: -1 };
    if (sort === 'likes') sortOpt = { createdAt: -1 };
    if (sort === 'module') sortOpt = { module: 1, createdAt: -1 };

    const materialsRaw = await Material.find(query)
      .sort(sortOpt)
      .populate('comments.user', 'name avatarUrl')
      .populate('approvedBy', 'name');

    const mapped = materialsRaw.map((m) => mapMaterialForUser(m, req.user.id));
    const materials = sort === 'likes'
      ? mapped.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      : mapped;

    return res.status(200).json({ success: true, data: materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Student submit for review (pending)
router.post('/', async (req, res) => {
  try {
    if (!isStudent(req)) {
      return res.status(403).json({ success: false, message: 'Students only' });
    }

    const { title, module: reqModule, type, link, description, year, semester, category, tags } = req.body;

    if (!title || !reqModule || !type || !link) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!String(link).startsWith('http')) {
      return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
    }

    const material = await Material.create({
      studentId: req.user.id,
      studentName: req.user.name,
      title,
      module: reqModule,
      year: year ? Number(year) : undefined,
      semester: semester ? Number(semester) : undefined,
      category,
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      type,
      link,
      description,
      status: 'pending'
    });

    // Notify all admins about the new submission
    const User = require('../models/User');
    const admins = await User.find({ role: 'admin' });
    
    const notificationPromises = admins.map((admin) =>
      Notification.create({
        recipient: admin._id,
        actor: req.user.id,
        type: 'material_submitted',
        title: 'New material submitted for review',
        message: `${req.user.name} submitted "${material.title}" for review in ${reqModule}`,
        entityType: 'material',
        entityId: material._id
      })
    );

    await Promise.all(notificationPromises);

    return res.status(201).json({ success: true, data: material, message: 'Material submitted for review' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin direct publish
router.post('/admin/publish', async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admins only' });
    }

    const { title, module: reqModule, type, link, description, year, semester, category, tags } = req.body;

    if (!title || !reqModule || !type || !link) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!String(link).startsWith('http')) {
      return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
    }

    const material = await Material.create({
      studentId: req.user.id,
      studentName: req.user.name,
      title,
      module: reqModule,
      year: year ? Number(year) : undefined,
      semester: semester ? Number(semester) : undefined,
      category,
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      type,
      link,
      description,
      status: 'approved',
      approvedBy: req.user.id,
      approvedAt: new Date()
    });

    return res.status(201).json({ success: true, data: material, message: 'Material published' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin review action
router.patch('/:id/review', async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Admins only' });
    }

    const { action, reviewNotes = '' } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid review action' });
    }

    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    material.status = action === 'approve' ? 'approved' : 'rejected';
    material.reviewNotes = reviewNotes;
    material.approvedBy = action === 'approve' ? req.user.id : undefined;
    material.approvedAt = action === 'approve' ? new Date() : undefined;
    await material.save();

    if (material.studentId.toString() !== req.user.id) {
      await Notification.create({
        recipient: material.studentId,
        actor: req.user.id,
        type: 'material_review',
        title: action === 'approve' ? 'Material approved' : 'Material rejected',
        message: action === 'approve'
          ? `Your material "${material.title}" was approved.`
          : `Your material "${material.title}" was rejected.${reviewNotes ? ` Notes: ${reviewNotes}` : ''}`,
        entityType: 'material',
        entityId: material._id
      });
    }

    return res.json({ success: true, data: material });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const isOwner = material.studentId.toString() === req.user.id;
    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this material' });
    }

    if (isOwner && material.status === 'approved' && !isAdmin(req)) {
      return res.status(400).json({ success: false, message: 'Approved materials cannot be edited by students' });
    }

    const payload = req.body || {};
    if (payload.link && !String(payload.link).startsWith('http')) {
      return res.status(400).json({ success: false, message: 'Link must be a valid URL' });
    }

    const updated = await Material.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        ...(isOwner && !isAdmin(req) ? { status: 'pending', reviewNotes: '', approvedAt: undefined, approvedBy: undefined } : {})
      },
      { new: true }
    );

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const isOwner = material.studentId.toString() === req.user.id;
    if (!isOwner && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
    }

    await Material.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (material.status !== 'approved' && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Only approved materials can be liked' });
    }

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

    return res.json({
      success: true,
      likes: material.likes,
      dislikes: material.dislikes,
      likesCount: material.likes.length,
      dislikesCount: material.dislikes.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ success: false, message: 'Material not found' });

    if (material.status !== 'approved' && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Only approved materials can be disliked' });
    }

    const uid = req.user.id;
    const disliked = material.dislikes.some((id) => id.toString() === uid);
    material.dislikes = disliked ? material.dislikes.filter((id) => id.toString() !== uid) : [...material.dislikes, uid];
    material.likes = material.likes.filter((id) => id.toString() !== uid);
    await material.save();

    return res.json({
      success: true,
      likes: material.likes,
      dislikes: material.dislikes,
      likesCount: material.likes.length,
      dislikesCount: material.dislikes.length
    });
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

    if (material.status !== 'approved' && !isAdmin(req)) {
      return res.status(403).json({ success: false, message: 'Only approved materials can be commented on' });
    }

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
