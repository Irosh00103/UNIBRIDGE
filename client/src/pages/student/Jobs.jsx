import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/jobs');
                setJobs(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    return (
        <div className="container page">
            <div className="page-header">
                <h1>💼 Available Jobs</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <p>No jobs available right now. Check back later!</p>
                </div>
            ) : (
                <div className="card-grid">
                    {jobs.map(job => (
                        <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{job.title}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '14px' }}>🏢 {job.employerName}</div>
                            <div style={{ color: 'var(--text)', fontSize: '13px' }}>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
                            <div>
                                <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                            </div>
                            <button 
                                className="btn btn-outline btn-sm" 
                                style={{ marginTop: 'auto' }}
                                onClick={() => navigate(`/student/jobs/${job._id}`, { state: job })}
                            >
                                View & Apply →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Jobs;
