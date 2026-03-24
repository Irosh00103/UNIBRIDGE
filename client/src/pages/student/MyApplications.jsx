import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/applications/mine');
                setApplications(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    return (
        <div className="container page">
            <div className="page-header">
                <h1>📋 My Applications</h1>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : applications.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't applied to any jobs yet.</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Company</th>
                                <th>Date Applied</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app._id}>
                                    <td style={{ fontWeight: '500' }}>{app.jobId?.title || 'Unknown Job'}</td>
                                    <td>{app.jobId?.employerName || 'Unknown Employer'}</td>
                                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${app.status.toLowerCase()}`}>
                                            {app.status}
                                        </span>
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

export default MyApplications;
