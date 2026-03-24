import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Kuppi = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');

    const [formData, setFormData] = useState({ title: '', module: '', date: '', description: '' });
    const [formErrors, setFormErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/kuppi');
            setSessions(res.data.data);
        } catch (err) {
            setPageError('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.module) tempErrors.module = 'Module is required';
        if (!formData.date) {
            tempErrors.date = 'Date is required';
        } else {
            const sessionDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (sessionDate < today) {
                tempErrors.date = 'Session date must be in the future';
            }
        }
        setFormErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setApiError('');
        
        if (!validate()) return;
        
        setSubmitting(true);
        try {
            const res = await axios.post('http://localhost:5000/api/kuppi', formData);
            if (res.data.success) {
                setSuccessMsg('Session created successfully! ✅');
                setFormData({ title: '', module: '', date: '', description: '' });
                setFormErrors({});
                fetchSessions(); // Refresh list
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to create session');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFillSample = () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const formattedDate = futureDate.toISOString().split('T')[0];

        setFormData({
            title: "Software Engineering Finals Prep",
            module: "IT3010",
            date: formattedDate,
            description: "Covering UML diagrams and design patterns"
        });
        setFormErrors({});
    };

    return (
        <div className="container page">
            <div className="page-header">
                <h1>🎓 Upcoming Sessions</h1>
            </div>

            {pageError && <div className="alert alert-error">{pageError}</div>}

            {loading ? (
                <div className="loading">Loading...</div>
            ) : sessions.length === 0 ? (
                <div className="empty-state">
                    <p>No upcoming sessions.</p>
                </div>
            ) : (
                <div className="card-grid" style={{ marginBottom: '40px' }}>
                    {sessions.map(session => (
                        <div key={session._id} className="card" style={{ background: 'var(--primary-light)', borderColor: '#bfdbfe', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{session.title}</div>
                            <div style={{ color: 'var(--text)', fontSize: '14px' }}>📚 {session.module}</div>
                            <div style={{ color: 'var(--text)', fontSize: '14px' }}>📅 {new Date(session.date).toLocaleDateString()}</div>
                            <div style={{ color: 'var(--muted)', fontSize: '13px' }}>👤 Hosted by {session.studentName}</div>
                            {session.description && <div style={{ fontSize: '13px', marginTop: '8px' }}>{session.description}</div>}
                        </div>
                    ))}
                </div>
            )}

            <div className="page-header">
                <h2>Create a Session</h2>
            </div>
            
            <div className="card" style={{ maxWidth: '600px' }}>
                <button type="button" className="fill-btn" onClick={handleFillSample}>Fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        {formErrors.title && <span className="error-text">{formErrors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label>Module</label>
                        <input type="text" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})} placeholder="e.g. IT3040" />
                        {formErrors.module && <span className="error-text">{formErrors.module}</span>}
                    </div>
                    <div className="form-group">
                        <label>Date</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                        {formErrors.date && <span className="error-text">{formErrors.date}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Description (Optional)</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Creating...' : 'Create Session'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Kuppi;
