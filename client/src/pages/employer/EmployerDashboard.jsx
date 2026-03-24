import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EmployerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/jobs');
            const employerJobs = user.role === 'admin'
                ? res.data.data
                : res.data.data.filter(j => String(j.employerId) === String(user.id));
            setJobs(employerJobs);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line
    }, []);

    const handleCloseJob = async (id) => {
        if (!window.confirm('Are you sure you want to close this job listing?')) return;
        try {
            await axios.patch(`http://localhost:5000/api/jobs/${id}/close`);
            fetchJobs();
        } catch (err) {
            alert('Failed to close job');
        }
    };

    return (
        <div className="container page fade-in-up" style={{ padding: '100px 24px 60px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '40px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>Welcome, {user?.name} 👋</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Manage your job listings and track applicants.</p>
            </div>

            <div className="card-grid" style={{ marginBottom: '48px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '32px' }}>
                    <div style={{ fontSize: '40px' }}>📝</div>
                    <div style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-main)' }}>Post New Job</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Create a new listing for students.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/employer/jobs/create')} style={{ width: '100%' }}>Create Job →</button>
                </div>
                
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px', padding: '32px' }}>
                    <div style={{ fontSize: '40px' }}>📊</div>
                    <div style={{ fontWeight: 800, fontSize: '36px', color: 'var(--primary)', lineHeight: 1 }}>{jobs.length}</div>
                    <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-main)' }}>Active Listings</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Currently posted by your company</div>
                </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-main)' }}>Your Job Portal</h2>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading dashboard data...</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                    <h3>No listings yet</h3>
                    <p>Post a job to connect with top student talent.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '16px 24px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)' }}>Job Title</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)' }}>Deadline</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid var(--border-light)' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '600', color: 'var(--text-main)' }}>{job.title}</td>
                                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{new Date(job.deadline).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span className={`badge badge-${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => navigate(`/employer/jobs/${job._id}/applicants`, { state: job })}
                                                style={{ padding: '6px 12px', fontSize: '13px' }}
                                            >
                                                View Applicants
                                            </button>
                                            {job.status === 'OPEN' && (
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleCloseJob(job._id)}
                                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                                >
                                                    Close Listing
                                                </button>
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

export default EmployerDashboard;
