import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';

const ViewApplicants = () => {
    const { state } = useLocation();
    const job = state || { title: 'Job' };
    
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!job._id) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`http://localhost:5000/api/applications/job/${job._id}`);
                setApplicants(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load applicants');
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [job._id]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this applicant?`)) return;
        
        try {
            const res = await axios.patch(`http://localhost:5000/api/applications/${id}/status`, { status });
            if (res.data.success) {
                setApplicants(prev => prev.map(app => app._id === id ? { ...app, status } : app));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="container page">
            <div style={{ marginBottom: '24px' }}>
                <Link to="/employer/dashboard" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>← Back to Dashboard</Link>
            </div>

            <div className="page-header">
                <h1>Applicants for: {job.title}</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : applicants.length === 0 ? (
                <div className="empty-state">
                    <p>No applications received yet.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>CV</th>
                                <th>Note</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map(app => (
                                <tr key={app._id}>
                                    <td style={{ fontWeight: '500' }}>{app.studentName}</td>
                                    <td>{app.studentEmail}</td>
                                    <td>
                                        <a href={app.cvLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                                            View CV
                                        </a>
                                    </td>
                                    <td title={app.note || ''}>
                                        {app.note ? (app.note.length > 60 ? app.note.substring(0, 60) + '...' : app.note) : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${app.status.toLowerCase()}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {app.status === 'PENDING' ? (
                                                <>
                                                    <button 
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleStatusUpdate(app._id, 'SELECTED')}
                                                    >
                                                        ✓ Select
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleStatusUpdate(app._id, 'REJECTED')}
                                                    >
                                                        ✗ Reject
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Decided</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ViewApplicants;
