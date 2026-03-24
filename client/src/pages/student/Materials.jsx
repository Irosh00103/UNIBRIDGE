import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/materials');
                setMaterials(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load materials');
            } finally {
                setLoading(false);
            }
        };

        fetchMaterials();
    }, []);

    const getTypeBadge = (type) => {
        const typeLower = type.toLowerCase();
        let badgeClass = 'badge-other';
        if (['pdf', 'ppt', 'docx', 'video'].includes(typeLower)) {
            badgeClass = `badge-${typeLower}`;
        }
        return <span className={`badge ${badgeClass}`}>{type}</span>;
    };

    return (
        <div className="container page">
            <div className="page-header">
                <h1>📚 Lecture Materials</h1>
                <button className="btn btn-primary" onClick={() => navigate('/student/materials/upload')}>Upload Material</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : materials.length === 0 ? (
                <div className="empty-state">
                    <p>No materials yet. Be the first to upload!</p>
                </div>
            ) : (
                <div className="card-grid">
                    {materials.map(mat => (
                        <div key={mat._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{mat.title}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{mat.module}</div>
                            <div>{getTypeBadge(mat.type)}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text)' }}>Uploaded by {mat.studentName}</div>
                            <a href={mat.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 'auto', textDecoration: 'none' }}>
                                🔗 Open Link
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Materials;
