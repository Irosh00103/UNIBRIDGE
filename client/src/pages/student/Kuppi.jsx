import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/kuppi.css';

const API = 'http://localhost:5000/api/kuppi';

const TITLE_MAX_LENGTH = 120;
const MODULE_MAX_LENGTH = 20;
const LOCATION_MAX_LENGTH = 160;
const DESCRIPTION_MAX_LENGTH = 1000;
const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['Semester 1', 'Semester 2'];

const modulePattern = /^[A-Za-z]{2,6}\d{2,4}[A-Za-z]?$/;

const normalizeSpace = (value) => value.trim().replace(/\s+/g, ' ');

const isValidHttpUrl = (value) => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
        return false;
    }
};

const Kuppi = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showForm, setShowForm] = useState(false);
    const [commentText, setCommentText] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [editingPostId, setEditingPostId] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editFormErrors, setEditFormErrors] = useState({});
    const [editFormData, setEditFormData] = useState({
        title: '', module: '', year: '', semester: '', date: '', time: '', location: '', description: '', maxParticipants: ''
    });
    const [formData, setFormData] = useState({
        title: '', module: '', year: '', semester: '', date: '', time: '', location: '', description: '', maxParticipants: ''
    });
    const today = new Date().toISOString().split('T')[0];

    const validateKuppiForm = (data) => {
        const errors = {};
        const title = normalizeSpace(data.title || '');
        const moduleCode = (data.module || '').trim().toUpperCase();
        const location = normalizeSpace(data.location || '');
        const description = normalizeSpace(data.description || '');
        const maxParticipantsRaw = String(data.maxParticipants || '').trim();

        if (!title) {
            errors.title = 'Session title is required.';
        } else if (title.length < 5) {
            errors.title = 'Session title must be at least 5 characters.';
        } else if (title.length > TITLE_MAX_LENGTH) {
            errors.title = `Session title cannot exceed ${TITLE_MAX_LENGTH} characters.`;
        }

        if (!moduleCode) {
            errors.module = 'Module code is required.';
        } else if (!modulePattern.test(moduleCode)) {
            errors.module = 'Enter a valid module code like PHY101 or CS2040.';
        } else if (moduleCode.length > MODULE_MAX_LENGTH) {
            errors.module = `Module code cannot exceed ${MODULE_MAX_LENGTH} characters.`;
        }

        if (!YEAR_OPTIONS.includes(data.year)) {
            errors.year = 'Please select your academic year.';
        }

        if (!SEMESTER_OPTIONS.includes(data.semester)) {
            errors.semester = 'Please select your semester.';
        }

        if (!data.date) {
            errors.date = 'Date is required.';
        }

        if (!data.time) {
            errors.time = 'Time is required.';
        }

        if (data.date && data.time) {
            const sessionDateTime = new Date(`${data.date}T${data.time}:00`);
            if (Number.isNaN(sessionDateTime.getTime()) || sessionDateTime <= new Date()) {
                errors.date = 'Please select a future date and time for your Kuppi session.';
            }
        }

        if (!location) {
            errors.location = 'Kuppi link is required.';
        } else if (location.length > LOCATION_MAX_LENGTH) {
            errors.location = `Kuppi link cannot exceed ${LOCATION_MAX_LENGTH} characters.`;
        } else if (!isValidHttpUrl(location)) {
            errors.location = 'Kuppi link must be a valid http/https URL.';
        }

        if (maxParticipantsRaw) {
            if (!/^\d+$/.test(maxParticipantsRaw)) {
                errors.maxParticipants = 'Max participants must be a whole number.';
            } else {
                const maxParticipants = Number(maxParticipantsRaw);
                if (maxParticipants < 2 || maxParticipants > 500) {
                    errors.maxParticipants = 'Max participants must be between 2 and 500.';
                }
            }
        }

        if (!description) {
            errors.description = 'Description is required.';
        } else if (description.length < 10) {
            errors.description = 'Description must be at least 10 characters.';
        } else if (description.length > DESCRIPTION_MAX_LENGTH) {
            errors.description = `Description cannot exceed ${DESCRIPTION_MAX_LENGTH} characters.`;
        }

        return errors;
    };

    const handleFormChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const handleEditFormChange = (field, value) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }));
        setEditFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

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
        setError('');
        const validationErrors = validateKuppiForm(formData);
        setFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setError('Please correct the highlighted fields and try again.');
            return;
        }

        const payload = {
            title: normalizeSpace(formData.title),
            module: formData.module.trim().toUpperCase(),
            year: formData.year,
            semester: formData.semester,
            date: `${formData.date}T${formData.time}:00`,
            time: formData.time,
            location: normalizeSpace(formData.location),
            description: normalizeSpace(formData.description),
            maxParticipants: String(formData.maxParticipants).trim(),
        };

        try {
            await axios.post(`${API}/posts`, payload);
            setFormData({ title: '', module: '', year: '', semester: '', date: '', time: '', location: '', description: '', maxParticipants: '' });
            setFormErrors({});
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

    const startEditingPost = (post) => {
        const dateObj = new Date(post.date);
        const dateValue = Number.isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
        const timeValue = Number.isNaN(dateObj.getTime())
            ? ''
            : dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        setEditingPostId(post._id);
        setEditFormErrors({});
        setEditFormData({
            title: post.title || '',
            module: post.module || '',
            year: post.year || '',
            semester: post.semester || '',
            date: dateValue,
            time: timeValue,
            location: post.location || '',
            description: post.description || '',
            maxParticipants: post.maxParticipants ? String(post.maxParticipants) : ''
        });
    };

    const cancelEditingPost = () => {
        setEditingPostId('');
        setEditFormErrors({});
        setEditFormData({ title: '', module: '', year: '', semester: '', date: '', time: '', location: '', description: '', maxParticipants: '' });
    };

    const updatePost = async (postId) => {
        setError('');
        const validationErrors = validateKuppiForm(editFormData);
        setEditFormErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            setError('Please correct the highlighted fields in the edit form.');
            return;
        }

        const payload = {
            title: normalizeSpace(editFormData.title),
            module: editFormData.module.trim().toUpperCase(),
            year: editFormData.year,
            semester: editFormData.semester,
            date: `${editFormData.date}T${editFormData.time}:00`,
            time: editFormData.time,
            location: normalizeSpace(editFormData.location),
            description: normalizeSpace(editFormData.description),
            maxParticipants: String(editFormData.maxParticipants).trim(),
        };

        try {
            setEditSaving(true);
            await axios.put(`${API}/posts/${postId}`, payload);
            cancelEditingPost();
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update post');
        } finally {
            setEditSaving(false);
        }
    };

    const deletePost = async (postId) => {
        const confirmed = window.confirm('Delete this Kuppi session? This cannot be undone.');
        if (!confirmed) return;

        try {
            await axios.delete(`${API}/posts/${postId}`);
            if (editingPostId === postId) {
                cancelEditingPost();
            }
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete post');
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
                                <input required minLength={5} maxLength={TITLE_MAX_LENGTH} placeholder="e.g. Midterm Physics Review" value={formData.title} onChange={(e) => handleFormChange('title', e.target.value)} />
                                {formErrors.title && <small className="field-error">{formErrors.title}</small>}
                            </div>
                            <div className="form-group">
                                <label>Module</label>
                                <input required maxLength={MODULE_MAX_LENGTH} placeholder="e.g. PHY101" value={formData.module} onChange={(e) => handleFormChange('module', e.target.value)} />
                                {formErrors.module && <small className="field-error">{formErrors.module}</small>}
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <select required value={formData.year} onChange={(e) => handleFormChange('year', e.target.value)}>
                                    <option value="">Select year</option>
                                    {YEAR_OPTIONS.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {formErrors.year && <small className="field-error">{formErrors.year}</small>}
                            </div>
                            <div className="form-group">
                                <label>Semester</label>
                                <select required value={formData.semester} onChange={(e) => handleFormChange('semester', e.target.value)}>
                                    <option value="">Select semester</option>
                                    {SEMESTER_OPTIONS.map((semester) => (
                                        <option key={semester} value={semester}>{semester}</option>
                                    ))}
                                </select>
                                {formErrors.semester && <small className="field-error">{formErrors.semester}</small>}
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input required min={today} type="date" value={formData.date} onChange={(e) => handleFormChange('date', e.target.value)} />
                                {formErrors.date && <small className="field-error">{formErrors.date}</small>}
                            </div>
                            <div className="form-group">
                                <label>Time</label>
                                <input required type="time" value={formData.time} onChange={(e) => handleFormChange('time', e.target.value)} />
                                {formErrors.time && <small className="field-error">{formErrors.time}</small>}
                            </div>
                            <div className="form-group">
                                <label>Kuppi Link</label>
                                <input required type="url" maxLength={LOCATION_MAX_LENGTH} placeholder="https://zoom.us/j/123456789" value={formData.location} onChange={(e) => handleFormChange('location', e.target.value)} />
                                {formErrors.location && <small className="field-error">{formErrors.location}</small>}
                            </div>
                            <div className="form-group">
                                <label>Max Participants (Optional)</label>
                                <input type="number" min={2} max={500} step={1} placeholder="e.g. 10" value={formData.maxParticipants} onChange={(e) => handleFormChange('maxParticipants', e.target.value)} />
                                {formErrors.maxParticipants && <small className="field-error">{formErrors.maxParticipants}</small>}
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label>Description</label>
                            <textarea required minLength={10} maxLength={DESCRIPTION_MAX_LENGTH} placeholder="What topics will be covered?" value={formData.description} onChange={(e) => handleFormChange('description', e.target.value)} />
                            {formErrors.description && <small className="field-error">{formErrors.description}</small>}
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
                                    {post.year && <span className="badge badge-type">{post.year}</span>}
                                    {post.semester && <span className="badge badge-type">{post.semester}</span>}
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
                                        {post.location ? (
                                            <a href={post.location} target="_blank" rel="noreferrer">Join Link</a>
                                        ) : 'TBA'}
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

                                {isOwner && (
                                    <div className="owner-action-row">
                                        <button className="btn btn-outline" onClick={() => startEditingPost(post)} type="button">Edit</button>
                                        <button className="btn btn-owner-delete" onClick={() => deletePost(post._id)} type="button">Delete</button>
                                    </div>
                                )}

                                {isOwner && editingPostId === post._id && (
                                    <div className="owner-edit-panel">
                                        <h4 style={{ marginBottom: '12px', color: 'var(--text-main)' }}>Edit Your Kuppi</h4>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Session Title</label>
                                                <input value={editFormData.title} onChange={(e) => handleEditFormChange('title', e.target.value)} />
                                                {editFormErrors.title && <small className="field-error">{editFormErrors.title}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Module</label>
                                                <input value={editFormData.module} onChange={(e) => handleEditFormChange('module', e.target.value)} />
                                                {editFormErrors.module && <small className="field-error">{editFormErrors.module}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Year</label>
                                                <select value={editFormData.year} onChange={(e) => handleEditFormChange('year', e.target.value)}>
                                                    <option value="">Select year</option>
                                                    {YEAR_OPTIONS.map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                                {editFormErrors.year && <small className="field-error">{editFormErrors.year}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Semester</label>
                                                <select value={editFormData.semester} onChange={(e) => handleEditFormChange('semester', e.target.value)}>
                                                    <option value="">Select semester</option>
                                                    {SEMESTER_OPTIONS.map((semester) => (
                                                        <option key={semester} value={semester}>{semester}</option>
                                                    ))}
                                                </select>
                                                {editFormErrors.semester && <small className="field-error">{editFormErrors.semester}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Date</label>
                                                <input type="date" min={today} value={editFormData.date} onChange={(e) => handleEditFormChange('date', e.target.value)} />
                                                {editFormErrors.date && <small className="field-error">{editFormErrors.date}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Time</label>
                                                <input type="time" value={editFormData.time} onChange={(e) => handleEditFormChange('time', e.target.value)} />
                                                {editFormErrors.time && <small className="field-error">{editFormErrors.time}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Kuppi Link</label>
                                                <input type="url" value={editFormData.location} onChange={(e) => handleEditFormChange('location', e.target.value)} />
                                                {editFormErrors.location && <small className="field-error">{editFormErrors.location}</small>}
                                            </div>
                                            <div className="form-group">
                                                <label>Max Participants (Optional)</label>
                                                <input type="number" min={2} max={500} step={1} value={editFormData.maxParticipants} onChange={(e) => handleEditFormChange('maxParticipants', e.target.value)} />
                                                {editFormErrors.maxParticipants && <small className="field-error">{editFormErrors.maxParticipants}</small>}
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ marginTop: '10px' }}>
                                            <label>Description</label>
                                            <textarea value={editFormData.description} onChange={(e) => handleEditFormChange('description', e.target.value)} />
                                            {editFormErrors.description && <small className="field-error">{editFormErrors.description}</small>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                                            <button className="btn btn-outline" onClick={cancelEditingPost} type="button">Cancel</button>
                                            <button className="btn btn-primary" onClick={() => updatePost(post._id)} type="button" disabled={editSaving}>
                                                {editSaving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                
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
