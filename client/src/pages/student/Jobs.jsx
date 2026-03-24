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
        <div className="container page fade-in-up" style={{ padding: '100px 24px 60px', maxWidth: '1400px' }}>
            <div className="page-header" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>Job Market</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Discover the latest verified internships and graduate roles.</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading opportunities...</div>
            ) : jobs.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
                    <h3>No roles currently available</h3>
                    <p>Check back later for new opportunities posted by our career team.</p>
                </div>
            ) : (
                <div className="card-grid">
                    {jobs.map(job => {
                        const dl = new Date(job.deadline);
                        const isExpired = dl < new Date();
                        
                        return (
                            <div key={job._id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '32px', position: 'relative', overflow: 'hidden' }}>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <span className={`badge ${isExpired ? 'badge-rejected' : 'badge-open'}`}>
                                        {isExpired ? 'CLOSED' : job.status}
                                    </span>
                                </div>
                                
                                <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>{job.title}</h3>
                                
                                <div style={{ fontSize: '15px', color: 'var(--primary)', fontWeight: 600, marginBottom: '16px' }}>
                                    🏢 {job.company || job.employerName}
                                </div>
                                
                                <div style={{ backgroundColor: 'var(--bg-input)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', flexGrow: 1 }}>
                                    {job.venue && <div style={{ color: 'var(--text-main)', fontSize: '14px', marginBottom: '8px' }}>📍 <strong>Venue:</strong> {job.venue}</div>}
                                    <div style={{ color: 'var(--text-main)', fontSize: '14px' }}>📅 <strong>Deadline:</strong> {dl.toLocaleDateString()}</div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                                    <a 
                                        className="btn btn-outline" 
                                        style={{ flex: 1, textAlign: 'center' }} 
                                        href={job.applyLink} 
                                        target="_blank" 
                                        rel="noreferrer"
                                    >
                                        Visit Apply Site
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Jobs;
