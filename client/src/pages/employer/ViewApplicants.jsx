import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft,
    FaUserCheck,
    FaUserClock,
    FaUserTimes,
    FaUsers,
    FaFileAlt,
    FaPaperPlane,
} from 'react-icons/fa';
import '../../styles/ViewApplicants.css';

const ViewApplicants = () => {
    const navigate = useNavigate();
    const { id: jobIdFromRoute } = useParams();
    const { state } = useLocation();
    const [job, setJob] = useState(state || { title: 'Job Position' });
    
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [emailSearch, setEmailSearch] = useState('');

    const token = localStorage.getItem('ub_token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    useEffect(() => {
        if (state?._origin !== 'employer-dashboard') {
            navigate('/employer/dashboard', { replace: true });
            return;
        }

        const fetchApplicants = async () => {
            try {
                let resolvedJob = state;
                const targetJobId = state?._id || jobIdFromRoute;

                if (!resolvedJob && targetJobId) {
                    const jobsRes = await axios.get('http://localhost:5000/api/jobs', { headers: authHeaders });
                    resolvedJob = (jobsRes.data?.data || []).find((item) => String(item._id) === String(targetJobId));
                }

                if (resolvedJob) {
                    setJob(resolvedJob);
                }

                if (!targetJobId) {
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`http://localhost:5000/api/applications/job/${targetJobId}`, { headers: authHeaders });
                setApplicants(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load applicants');
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [jobIdFromRoute, state, navigate]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this applicant?`)) return;
        
        try {
            const res = await axios.patch(`http://localhost:5000/api/applications/${id}/status`, { status }, { headers: authHeaders });
            if (res.data.success) {
                setApplicants(prev => prev.map(app => app._id === id ? { ...app, status } : app));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const pendingCount = applicants.filter((app) => String(app.status).toUpperCase() === 'PENDING').length;
    const selectedCount = applicants.filter((app) => String(app.status).toUpperCase() === 'SELECTED').length;
    const rejectedCount = applicants.filter((app) => String(app.status).toUpperCase() === 'REJECTED').length;

    const statCards = [
        { label: 'Total Applicants', value: applicants.length, icon: <FaUsers />, tone: 'neutral' },
        { label: 'Pending Review', value: pendingCount, icon: <FaUserClock />, tone: 'pending' },
        { label: 'Selected', value: selectedCount, icon: <FaUserCheck />, tone: 'selected' },
        { label: 'Rejected', value: rejectedCount, icon: <FaUserTimes />, tone: 'rejected' },
    ];

    const handleSearchProfile = (e) => {
        e.preventDefault();
        const email = emailSearch.trim().toLowerCase();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid student email to search profile');
            return;
        }

        setError('');
        navigate('/employer/students/profile', {
            state: {
                email,
                _origin: 'employer-applicants',
                jobId: job?._id || jobIdFromRoute,
            },
        });
    };

    const handleOpenProfile = (email) => {
        const cleanEmail = String(email || '').trim().toLowerCase();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            setError('Applicant email is missing or invalid');
            return;
        }

        setError('');
        navigate('/employer/students/profile', {
            state: {
                email: cleanEmail,
                _origin: 'employer-applicants',
                jobId: job?._id || jobIdFromRoute,
            },
        });
    };

    return (
        <div className="container page applicants-page">
            <div className="applicants-back-row">
                <Link to="/employer/dashboard" className="applicants-back-link">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>

            <section className="applicants-hero card">
                <div className="applicants-hero-tag">Talent Pipeline</div>
                <div className="applicants-hero-main">
                    <div>
                        <h1>Applicants for {job.title}</h1>
                        <p>Review candidate profiles, move decisions faster, and keep your hiring flow organized.</p>
                    </div>
                    <div className="applicants-hero-meta">
                        <span>{job.company || 'Company not specified'}</span>
                        <span>{job.location || job.venue || 'Location not specified'}</span>
                    </div>
                </div>
            </section>

            <section className="applicants-stats-grid">
                {statCards.map((item) => (
                    <article key={item.label} className={`applicants-stat-card ${item.tone}`}>
                        <div className="applicants-stat-icon">{item.icon}</div>
                        <div className="applicants-stat-content">
                            <h3>{item.value}</h3>
                            <p>{item.label}</p>
                        </div>
                    </article>
                ))}
            </section>

            <section className="card applicants-search-card">
                <div className="applicants-search-head">
                    <h2>Search Student Professional Profile</h2>
                    <p>Enter a student email from job applications to view their available professional profile.</p>
                </div>
                <form className="applicants-search-form" onSubmit={handleSearchProfile}>
                    <input
                        type="email"
                        value={emailSearch}
                        onChange={(e) => setEmailSearch(e.target.value)}
                        placeholder="student@email.com"
                    />
                    <button type="submit" className="btn btn-primary">Search Profile</button>
                </form>
            </section>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading applicants...</div>
            ) : applicants.length === 0 ? (
                <section className="applicants-empty card">
                    <div className="applicants-empty-graphic">
                        <FaFileAlt />
                    </div>
                    <h2>No Applications Yet</h2>
                    <p>
                        This listing is live, but no candidates have applied yet. Share the post, refresh your job summary,
                        and check back soon.
                    </p>
                    <div className="applicants-empty-hint">
                        <FaPaperPlane /> Tip: Add clear role responsibilities and requirements to improve conversion.
                    </div>
                </section>
            ) : (
                <section className="card applicants-table-shell">
                    <div className="applicants-table-header">
                        <h2>Candidate List</h2>
                        <span>{applicants.length} total</span>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>CV</th>
                                    <th>Note</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                    <th>Profile</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applicants.map(app => (
                                    <tr key={app._id}>
                                        <td>
                                            <div className="applicant-name-cell">
                                                <span className="applicant-avatar">
                                                    {(app.studentName || 'U').charAt(0).toUpperCase()}
                                                </span>
                                                <span style={{ fontWeight: '600' }}>{app.studentName || 'Unknown applicant'}</span>
                                            </div>
                                        </td>
                                        <td>{app.studentEmail || '-'}</td>
                                        <td>
                                            {app.cvLink ? (
                                                <a href={app.cvLink} target="_blank" rel="noopener noreferrer" className="applicants-cv-link">
                                                    View CV
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td title={app.note || ''}>
                                            {app.note ? (app.note.length > 70 ? app.note.substring(0, 70) + '...' : app.note) : '-'}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${String(app.status || 'PENDING').toLowerCase()}`}>
                                                {app.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="applicants-actions">
                                                {String(app.status).toUpperCase() === 'PENDING' ? (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleStatusUpdate(app._id, 'SELECTED')}
                                                        >
                                                            Select
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleStatusUpdate(app._id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="applicants-decided">Decision recorded</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleOpenProfile(app.studentEmail)}
                                            >
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ViewApplicants;
