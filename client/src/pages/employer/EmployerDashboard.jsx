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
            const employerJobs = res.data.data.filter(j => j.employerId === user.id);
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
        try {
            await axios.patch(`http://localhost:5000/api/jobs/${id}/close`);
            fetchJobs();
        } catch (err) {
            alert('Failed to close job');
        }
    };

    return (
        <div className="container page">
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <h1>Welcome, {user?.name} 👋</h1>
                <p style={{ color: 'var(--muted)' }}>Manage your job listings</p>
            </div>

            <div className="card-grid" style={{ marginBottom: '32px' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px' }}>📝</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Post New Job</div>
                    <button className="btn btn-primary" onClick={() => navigate('/employer/jobs/create')}>Create Job →</button>
                </div>
                
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '32px' }}>📊</div>
                    <div style={{ fontWeight: 'bold', fontSize: '24px' }}>{jobs.length} Active Jobs</div>
                    <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Currently posted by you</div>
                </div>
            </div>

            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Your Job Listings</h2>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't posted any jobs yet.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job._id}>
                                    <td style={{ fontWeight: '500' }}>{job.title}</td>
                                    <td>{new Date(job.deadline).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => navigate(`/employer/jobs/${job._id}/applicants`, { state: job })}
                                            >
                                                View Applicants
                                            </button>
                                            {job.status === 'OPEN' && (
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleCloseJob(job._id)}
                                                >
                                                    Close Job
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
