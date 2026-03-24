import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/kuppi.css';

const API = 'http://localhost:5000/api/kuppi';

const Kuppi = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showForm, setShowForm] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [formData, setFormData] = useState({
        title: '', module: '', date: '', time: '', location: '', description: '', maxParticipants: ''
    });

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/posts`);
            setPosts(res.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load kuppi posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const createPost = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/posts`, { ...formData, date: `${formData.date}T${formData.time || '12:00'}:00` });
            setFormData({ title: '', module: '', date: '', time: '', location: '', description: '', maxParticipants: '' });
            setShowForm(false);
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post');
        }
    };

    const doAction = async (postId, action) => {
        try {
            await axios.post(`${API}/posts/${postId}/${action}`);
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const postComment = async (postId) => {
        const text = (commentText[postId] || '').trim();
        if (!text) return;
        try {
            await axios.post(`${API}/posts/${postId}/comments`, { text });
            setCommentText((prev) => ({ ...prev, [postId]: '' }));
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Comment failed');
        }
    };

    const downloadApplicants = async (postId) => {
        try {
            const res = await axios.get(`${API}/posts/${postId}/applicants/export`, { responseType: 'blob' });
            // Now downloading an xlsx file from the backend!
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `kuppi-${postId}-applicants.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.message || 'Export failed');
        }
    };

    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0);
        return new Date(a.date) - new Date(b.date);
    });

    return (
        <div className="kuppi-container fade-in-up">
            <div className="kuppi-header">
                <div>
                    <h1 className="kuppi-title">Kuppi Hub</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Join or host peer study sessions to conquer your modules together.</p>
                </div>
                <button className={`btn ${showForm ? 'btn-outline' : 'btn-primary'} create-btn`} onClick={() => setShowForm((p) => !p)}>
                    {showForm ? 'Cancel' : '+ Host a Kuppi'}
                </button>
            </div>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            {showForm && (
                <div className="create-post-card">
                    <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>Host a Study Session</h2>
                    <form onSubmit={createPost}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Session Title</label>
                                <input required placeholder="e.g. Midterm Physics Review" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Module</label>
                                <input required placeholder="e.g. PHY101" value={formData.module} onChange={(e) => setFormData({ ...formData, module: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input required type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Location / Link</label>
                                <input placeholder="Zoom link or Room C302" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Max Participants (Optional)</label>
                                <input type="number" placeholder="e.g. 10" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Description</label>
                            <textarea required placeholder="What topics will be covered?" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="btn btn-primary" type="submit" style={{ padding: '12px 32px' }}>Publish Kuppi</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="sorting-bar">
                <button className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`} onClick={() => setSortBy('newest')}>Newest Posted</button>
                <button className={`sort-btn ${sortBy === 'upcoming' ? 'active' : ''}`} onClick={() => setSortBy('upcoming')}>Upcoming Sessions</button>
                <button className={`sort-btn ${sortBy === 'likes' ? 'active' : ''}`} onClick={() => setSortBy('likes')}>Most Liked</button>
            </div>
            
            {loading ? <div className="loading">Loading sessions...</div> : (
                <div className="posts-grid">
                    {sortedPosts.length === 0 && !error && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                            <h3>No sessions found</h3>
                            <p>Be the first to host a Kuppi session!</p>
                        </div>
                    )}
                    
                    {sortedPosts.map((post) => {
                        const isOwner = post.student?._id === user?.id;
                        const dateObj = new Date(post.date);
                        
                        return (
                            <div className="post-card" key={post._id}>
                                <div className="post-header">
                                    <div className="post-author">
                                        <div className="author-pic">
                                            {post.student?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="author-meta">
                                            <span className="author-name">{post.student?.name || 'Unknown Student'}</span>
                                            <span className="post-time">Posted {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="badge badge-open">Open</div>
                                </div>
                                
                                <h3 className="post-title">{post.title}</h3>
                                
                                <div className="post-tags">
                                    <span className="badge badge-type">{post.module}</span>
                                    {post.maxParticipants && (
                                        <span className="badge badge-type">Max: {post.maxParticipants}</span>
                                    )}
                                </div>
                                
                                <p className="post-desc">{post.description}</p>
                                
                                <div className="post-details">
                                    <div className="detail-row">
                                        <span className="detail-icon">📅</span>
                                        {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-icon">📍</span>
                                        {post.location || 'TBA'}
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-icon">👥</span>
                                        {post.participants?.length || 0} / {post.maxParticipants || 'Unlimited'} Participants
                                    </div>
                                </div>
                                
                                <div className="post-actions">
                                    <button 
                                        className={`action-btn ${post.userLiked ? 'active-like' : ''}`} 
                                        onClick={() => doAction(post._id, 'like')}
                                    >
                                        👍 {post.likes?.length || 0}
                                    </button>
                                    <button 
                                        className={`action-btn ${post.userDisliked ? 'active-dislike' : ''}`} 
                                        onClick={() => doAction(post._id, 'dislike')}
                                    >
                                        👎 {post.dislikes?.length || 0}
                                    </button>
                                </div>
                                
                                <div className="join-btn-container">
                                    {isOwner ? (
                                        <>
                                            <button className="btn btn-primary btn-join" disabled style={{ cursor: 'not-allowed', opacity: 0.7 }}>
                                                Your Session
                                            </button>
                                            <button className="btn btn-download" onClick={() => downloadApplicants(post._id)} title="Export Applicants as Excel">
                                                📊 Export .xlsx
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            className={`btn ${post.userJoined ? 'btn-danger' : 'btn-primary'} btn-join`} 
                                            onClick={() => doAction(post._id, 'join')}
                                        >
                                            {post.userJoined ? 'Leave Session' : 'Apply / Join'}
                                        </button>
                                    )}
                                </div>
                                
                                <hr style={{ marginTop: '24px', marginBottom: '16px', border: 'none', borderTop: '1px solid var(--border-light)' }} />
                                
                                <div className="comments-section">
                                    <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--text-main)' }}>Comments ({post.comments?.length || 0})</h4>
                                    
                                    {post.comments?.length > 0 && (
                                        <div className="comment-list">
                                            {post.comments.map((c) => (
                                                <div className="comment-item" key={c._id}>
                                                    <div className="comment-avatar">
                                                        {c.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="comment-content">
                                                        <div className="comment-author">{c.user?.name || 'User'}</div>
                                                        <div className="comment-text">{c.text}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <div className="comment-input-area">
                                        <input 
                                            className="comment-input" 
                                            placeholder="Add a comment..." 
                                            value={commentText[post._id] || ''} 
                                            onChange={(e) => setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') postComment(post._id); }}
                                        />
                                        <button className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => postComment(post._id)}>Reply</button>
                                    </div>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Kuppi;
