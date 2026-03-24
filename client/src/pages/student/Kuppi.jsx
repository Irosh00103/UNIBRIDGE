import React, { useState, useEffect, useRef } from 'react';
// Modal for detailed post view
const KuppiPostModal = ({ post, onClose }) => {
  if (!post) return null;
  return (
    <div className="kuppi-modal-overlay" onClick={onClose}>
      <div className="kuppi-modal" onClick={e => e.stopPropagation()}>
        <button className="kuppi-modal-close" onClick={onClose}>&times;</button>
        <div className="kuppi-modal-header">
          <div className="host-avatar modal-avatar">
            {post.student?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2>{post.title}</h2>
            <div className="host-name">
              <span>👤 {post.student?.name}</span>
              <span className="post-date">📅 {new Date(post.date).toLocaleDateString()} at {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              {post.module && <span className="badge module">{post.module}</span>}
              {post.location && <span className="badge location">📍 {post.location}</span>}
            </div>
          </div>
        </div>
        <div className="kuppi-modal-body">
          <p>{post.description || 'No description provided.'}</p>
          {post.maxParticipants && (
            <div className="participants">
              👥 {post.participants?.length || 0} / {post.maxParticipants} joined
            </div>
          )}
          {Array.isArray(post.participants) && post.participants.length > 0 && (
            <div className="kuppi-participant-list" style={{ marginTop: 10 }}>
              {post.participants.map((p) => (
                <div className="kuppi-avatar" key={p._id} title={p.name}>
                  {p.avatarUrl ? (
                    <img src={p.avatarUrl} alt={p.name} />
                  ) : (
                    <span>{p.name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="kuppi-modal-comments">
          <h4>💬 Comments ({post.comments?.length || 0})</h4>
          <div className="comments-list">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="comment-item">
                <div className="comment-avatar">
                  {comment.user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="comment-content">
                  <div className="comment-meta">
                    <strong>{comment.user?.name}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
// ...existing code...
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/kuppi.css'; // new styles

const Kuppi = () => {
  const [modalPost, setModalPost] = useState(null);
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, likes, upcoming

  // New post form
  const [formData, setFormData] = useState({
    title: '',
    module: '',
    date: '',
    time: '',
    location: '',
    description: '',
    maxParticipants: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Comment input refs
  const [commentText, setCommentText] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/kuppi/posts');
      setPosts(res.data.data);
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Sorting
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0);
    if (sortBy === 'upcoming') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.module.trim()) errors.module = 'Module code is required';
    if (!formData.date) errors.date = 'Date is required';
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) errors.date = 'Date must be in the future';
    }
    if (formData.maxParticipants && (formData.maxParticipants < 1 || isNaN(formData.maxParticipants))) {
      errors.maxParticipants = 'Must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/kuppi/posts', {
        ...formData,
        date: `${formData.date}T${formData.time || '12:00'}:00`,
      });
      if (res.data.success) {
        setSuccessMsg('Session created successfully! 🎉');
        setFormData({
          title: '', module: '', date: '', time: '', location: '', description: '', maxParticipants: ''
        });
        setFormErrors({});
        setShowForm(false);
        fetchPosts(); // refresh list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillSample = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const formattedDate = futureDate.toISOString().split('T')[0];
    setFormData({
      title: "Software Engineering Finals Prep",
      module: "IT3010",
      date: formattedDate,
      time: "18:00",
      location: "Library Study Room 3",
      description: "Covering UML diagrams, design patterns, and system architecture. Bring your notes!",
      maxParticipants: "10",
    });
    setFormErrors({});
  };

  // Like / Dislike
  const handleLike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/kuppi/posts/${postId}/like`);
      if (res.data.success) {
        // Update local state optimistically
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                  userLiked: res.data.userLiked,
                  userDisliked: res.data.userDisliked,
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Like error', err);
    }
  };

  const handleDislike = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/kuppi/posts/${postId}/dislike`);
      if (res.data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? {
                  ...post,
                  likes: res.data.likes,
                  dislikes: res.data.dislikes,
                  userLiked: res.data.userLiked,
                  userDisliked: res.data.userDisliked,
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Dislike error', err);
    }
  };

  // Join / Leave
  const handleJoin = async (postId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/kuppi/posts/${postId}/join`);
      if (res.data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? { ...post, participants: res.data.participants, userJoined: res.data.userJoined }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Join error', err);
    }
  };

  // Comments
  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) {
      setCommentErrors({ ...commentErrors, [postId]: 'Comment cannot be empty' });
      return;
    }
    setSubmittingComment({ ...submittingComment, [postId]: true });
    try {
      const res = await axios.post(`http://localhost:5000/api/kuppi/posts/${postId}/comments`, { text });
      if (res.data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? { ...post, comments: res.data.comments }
              : post
          )
        );
        setCommentText({ ...commentText, [postId]: '' });
        setCommentErrors({ ...commentErrors, [postId]: '' });
      }
    } catch (err) {
      setCommentErrors({ ...commentErrors, [postId]: err.response?.data?.message || 'Failed to add comment' });
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await axios.delete(`http://localhost:5000/api/kuppi/comments/${commentId}`);
      if (res.data.success) {
        setPosts(prev =>
          prev.map(post =>
            post._id === postId
              ? { ...post, comments: post.comments.filter(c => c._id !== commentId) }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Delete comment error', err);
    }
  };

  if (loading) return (
    <div className="kuppi-loading">
      <div className="kuppi-spinner" aria-label="Loading..." />
      <div className="kuppi-skeletons">
        {[...Array(3)].map((_, i) => (
          <div className="post-card kuppi-skeleton-card" key={i}>
            <div className="skeleton skeleton-header" />
            <div className="skeleton skeleton-content" />
            <div className="skeleton skeleton-actions" />
          </div>
        ))}
      </div>
    </div>
  );
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="kuppi-container">
      {/* Header */}
      <div className="kuppi-header">
        <div>
          <h1 className="kuppi-title">📚 Kuppi Hub</h1>
          <p className="kuppi-subtitle">Connect, collaborate, and study together</p>
        </div>
        <button
          className="btn btn-primary create-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Create Session'}
        </button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <div className="create-post-card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Session Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Database Systems Study Group"
                />
                {formErrors.title && <span className="error-text">{formErrors.title}</span>}
              </div>
              <div className="form-group">
                <label>Module Code *</label>
                <input
                  type="text"
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  placeholder="e.g., CS3042"
                />
                {formErrors.module && <span className="error-text">{formErrors.module}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                {formErrors.date && <span className="error-text">{formErrors.date}</span>}
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Room / Online link"
                />
              </div>
              <div className="form-group">
                <label>Max Participants</label>
                <input
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                  placeholder="Optional"
                />
                {formErrors.maxParticipants && <span className="error-text">{formErrors.maxParticipants}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will you cover? Any materials needed?"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleFillSample}>
                Sample Data
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Session'}
              </button>
            </div>
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
          </form>
        </div>
      )}

      {/* Sorting Bar */}
      <div className="sorting-bar">
        <span className="sort-label">Sort by:</span>
        <button
          className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
          onClick={() => setSortBy('newest')}
        >
          Newest
        </button>
        <button
          className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`}
          onClick={() => setSortBy('likes')}
        >
          Most Liked
        </button>
        <button
          className={`sort-btn ${sortBy === 'upcoming' ? 'active' : ''}`}
          onClick={() => setSortBy('upcoming')}
        >
          Upcoming
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        {sortedPosts.length === 0 ? (
          <div className="empty-state">
            <p>No sessions yet. Be the first to create one!</p>
          </div>
        ) : (
          sortedPosts.map((post, idx) => (
            <div
              key={post._id}
              className="post-card kuppi-fadein"
              style={{ animationDelay: `${idx * 60}ms` }}
              onClick={() => setModalPost(post)}
              tabIndex={0}
              role="button"
              aria-label="View details"
            >
                    {/* Modal for post details */}
                    {modalPost && (
                      <KuppiPostModal post={modalPost} onClose={() => setModalPost(null)} />
                    )}
              <div className="post-header">
                <div className="post-host">
                  <div className="host-avatar">
                    {post.student?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3>{post.title}</h3>
                    <div className="host-name">
                      <span>👤 {post.student?.name}</span>
                      <span className="post-date">📅 {new Date(post.date).toLocaleDateString()} at {new Date(post.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="post-badges">
                  {post.module && <span className="badge module">{post.module}</span>}
                  {post.location && <span className="badge location">📍 {post.location}</span>}
                </div>
              </div>

              <div className="post-content">
                <p>{post.description || 'No description provided.'}</p>
                {post.maxParticipants && (
                  <div className="participants">
                    👥 {post.participants?.length || 0} / {post.maxParticipants} joined
                  </div>
                )}
                {Array.isArray(post.participants) && post.participants.length > 0 && (
                  <div className="kuppi-participant-list">
                    {post.participants.slice(0, 8).map((p) => (
                      <div className="kuppi-avatar kuppi-avatar-tooltip" key={p._id} tabIndex={0} title={p.name}>
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} />
                        ) : (
                          <span>{p.name?.[0]?.toUpperCase() || '?'}</span>
                        )}
                        <span className="kuppi-tooltip">{p.name}</span>
                      </div>
                    ))}
                    {post.participants.length > 8 && (
                      <span className="kuppi-more">+{post.participants.length - 8} more</span>
                    )}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <div className="like-dislike">
                  <button
                    className={`action-btn like-btn kuppi-anim-btn ${post.userLiked ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); handleLike(post._id); }}
                    title={post.userLiked ? 'Unlike' : 'Like'}
                  >
                    <span className="kuppi-anim-icon">👍</span> {post.likes?.length || 0}
                  </button>
                  <button
                    className={`action-btn dislike-btn kuppi-anim-btn ${post.userDisliked ? 'active' : ''}`}
                    onClick={e => { e.stopPropagation(); handleDislike(post._id); }}
                    title={post.userDisliked ? 'Remove dislike' : 'Dislike'}
                  >
                    <span className="kuppi-anim-icon">👎</span> {post.dislikes?.length || 0}
                  </button>
                </div>
                <button
                  className={`join-btn kuppi-anim-btn ${post.userJoined ? 'joined' : ''}`}
                  onClick={e => { e.stopPropagation(); handleJoin(post._id); }}
                  title={post.userJoined ? 'Leave session' : 'Join session'}
                >
                  {post.userJoined ? <span className="kuppi-anim-icon">✓ Joined</span> : <span className="kuppi-anim-icon">➕ Join Session</span>}
                </button>
              </div>

              {/* Comments Section */}
              <div className="comments-section">
                <h4>💬 Comments ({post.comments?.length || 0})</h4>
                <div className="comments-list">
                  {post.comments?.map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div className="comment-avatar">
                        {comment.user?.name?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div className="comment-content">
                        <div className="comment-meta">
                          <strong>{comment.user?.name}</strong>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                      {(comment.user?._id === user?.id || post.student?._id === user?.id) && (
                        <button
                          className="delete-comment"
                          onClick={() => handleDeleteComment(post._id, comment._id)}
                          aria-label="Delete comment"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="add-comment">
                  <textarea
                    rows="2"
                    placeholder="Write a comment..."
                    value={commentText[post._id] || ''}
                    onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAddComment(post._id)}
                    disabled={submittingComment[post._id]}
                  >
                    {submittingComment[post._id] ? 'Posting...' : 'Post Comment'}
                  </button>
                  {commentErrors[post._id] && (
                    <div className="error-text">{commentErrors[post._id]}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Kuppi;