import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/materials.css';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [commentInput, setCommentInput] = useState({});
    const navigate = useNavigate();

    const fetchMaterials = async (q = search, s = sort) => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/materials', { params: { search: q, sort: s } });
            setMaterials(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials('', 'newest');
    }, []);

    const getTypeIcon = (type) => {
        const t = type.toLowerCase();
        if (t === 'pdf') return '📄';
        if (t === 'ppt') return '📊';
        if (t === 'docx') return '📝';
        if (t === 'video') return '🎬';
        return '📁';
    };

    const reactMaterial = async (id, action) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/materials/${id}/${action}`);
            setMaterials((prev) => prev.map((m) => (
                m._id === id ? { ...m, likes: res.data.likes, dislikes: res.data.dislikes, userLiked: action === 'like' && !m.userLiked, userDisliked: action === 'dislike' && !m.userDisliked } : m
            )));
            fetchMaterials();
        } catch (err) {
            setError(err.response?.data?.message || 'Action failed');
        }
    };

    const commentMaterial = async (id) => {
        const text = (commentInput[id] || '').trim();
        if (!text) return;
        try {
            const res = await axios.post(`http://localhost:5000/api/materials/${id}/comments`, { text });
            setMaterials((prev) => prev.map((m) => (
                m._id === id ? { ...m, comments: res.data.comments } : m
            )));
            setCommentInput((prev) => ({ ...prev, [id]: '' }));
        } catch (err) {
            setError(err.response?.data?.message || 'Comment failed');
        }
    };

    return (
        <div className="materials-container fade-in-up">
            <div className="materials-header">
                <div>
                    <h1 className="materials-title">Study Materials</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Access and share lecture notes, past papers, and video resources.</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/student/materials/upload')}>+ Upload Material</button>
            </div>
            
            <div className="filter-bar">
                <input
                    className="search-input"
                    placeholder="Search by title, module, keyword..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') fetchMaterials(search, sort); }}
                />
                <select className="sort-select" value={sort} onChange={(e) => {
                    setSort(e.target.value);
                    fetchMaterials(search, e.target.value);
                }}>
                    <option value="newest">Newest First</option>
                    <option value="likes">Most Liked</option>
                    <option value="module">Sort by Module</option>
                </select>
                <button className="btn btn-primary filter-btn" onClick={() => fetchMaterials(search, sort)}>Search</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading materials...</div>
            ) : materials.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                    <h3>No materials found</h3>
                    <p>Be the first to upload a resource for your peers!</p>
                </div>
            ) : (
                <div className="materials-grid">
                    {materials.map(mat => (
                        <div key={mat._id} className="material-card">
                            <div className="material-header">
                                <span className={`badge badge-type badge-${mat.type.toLowerCase()}`}>{mat.type}</span>
                                <div className="material-type-icon">{getTypeIcon(mat.type)}</div>
                            </div>
                            
                            <h3 className="material-title">{mat.title}</h3>
                            <div className="material-module">{mat.module}</div>
                            
                            <p className="material-desc">{mat.description || 'No description provided.'}</p>
                            
                            <div className="material-footer">
                                <div className="uploader-avatar">
                                    {mat.studentName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                Uploaded by {mat.studentName || 'Student'}
                            </div>

                            <a href={mat.link} target="_blank" rel="noopener noreferrer" className="link-btn">
                                🔗 Open External Link
                            </a>

                            <div className="interaction-row">
                                <button className={`react-btn ${mat.userLiked ? 'liked' : ''}`} onClick={() => reactMaterial(mat._id, 'like')}>
                                    👍 {mat.likesCount || mat.likes?.length || 0}
                                </button>
                                <button className={`react-btn ${mat.userDisliked ? 'disliked' : ''}`} onClick={() => reactMaterial(mat._id, 'dislike')}>
                                    👎 {mat.dislikesCount || mat.dislikes?.length || 0}
                                </button>
                            </div>

                            <div className="comments-section" style={{ marginTop: '0', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                                <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-main)' }}>Comments</h4>
                                
                                {mat.comments?.length > 0 && (
                                    <div className="comment-list" style={{ maxHeight: '120px' }}>
                                        {mat.comments.slice(-3).map((c) => (
                                            <div className="comment-item" key={c._id} style={{ padding: '8px' }}>
                                                <div className="comment-content">
                                                    <div className="comment-author" style={{ fontSize: '12px' }}>{c.user?.name || 'User'}</div>
                                                    <div className="comment-text" style={{ fontSize: '13px' }}>{c.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="comment-input-area" style={{ marginTop: '8px' }}>
                                    <input 
                                        className="comment-input" 
                                        placeholder="Add a comment..." 
                                        value={commentInput[mat._id] || ''} 
                                        onChange={(e) => setCommentInput((prev) => ({ ...prev, [mat._id]: e.target.value }))}
                                        onKeyDown={(e) => { if (e.key === 'Enter') commentMaterial(mat._id); }}
                                    />
                                    <button className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={() => commentMaterial(mat._id)}>Post</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Materials;
