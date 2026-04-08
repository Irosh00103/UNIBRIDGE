import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CreateJob = () => {
    const [formData, setFormData] = useState({ title: '', company: '', venue: '', applyLink: '', description: '', deadline: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.description) tempErrors.description = 'Description is required';
        if (!formData.applyLink) tempErrors.applyLink = 'Apply link is required';
        else if (!formData.applyLink.startsWith('http')) tempErrors.applyLink = 'Apply link must start with http:// or https://';
        if (!formData.deadline) {
            tempErrors.deadline = 'Deadline is required';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (deadlineDate <= today) {
                tempErrors.deadline = 'Deadline must be a future date';
            }
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setApiError('');
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/jobs', formData);
            if (res.data.success) {
                setSuccessMsg('Job posted successfully to the student market! 🚀');
                setFormData({ title: '', company: '', venue: '', applyLink: '', description: '', deadline: '' });
                setErrors({});
                setTimeout(() => {
                    navigate(user?.role === 'admin' ? '/admin/dashboard' : '/employer/dashboard');
                }, 2000);
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const handleFillSample = () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const formattedDate = futureDate.toISOString().split('T')[0];

        setFormData({
            title: "Full Stack Developer Intern",
            company: "UniBridge Partner Company",
            venue: "Colombo / Hybrid",
            applyLink: "https://company.example.com/jobs/123",
            description: "We are looking for an enthusiastic full stack developer intern to join our growing team. You will work on real projects using React and Node.js. Strong communication skills required.",
            deadline: formattedDate
        });
        setErrors({});
    };

    return (
        <div className="container page fade-in-up" style={{ padding: '100px 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600' }}>← Back to Command Center</Link>
            </div>
            
            <div className="page-header" style={{ marginBottom: '40px', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>Publish Job Opportunity</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Post internships and full-time roles directly to the student portal.</p>
                        <div className="auth-badge" style={{ marginTop: '14px' }}>Employers & Admins</div>
                </div>
            </div>

            <div className="card" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: '24px', borderStyle: 'dashed' }} onClick={handleFillSample}>✨ Auto-fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Job Title / Role</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Software Engineering Intern" />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Company Name</label>
                            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. UniBridge Partners" />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Venue / Format</label>
                            <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} placeholder="Remote / Hybrid / Colombo" />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>External Application Link *</label>
                        <input type="url" value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} placeholder="https://careers.google.com/..." />
                        {errors.applyLink && <span className="error-text">{errors.applyLink}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Role Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            style={{ minHeight: '160px' }}
                            placeholder="Describe the role, tech stack, requirements, and responsibilities..."
                        ></textarea>
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Application Deadline</label>
                        <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                        {errors.deadline && <span className="error-text">{errors.deadline}</span>}
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }} disabled={loading || !!successMsg}>
                        {loading ? 'Posting to Campus...' : 'Publish to Student Market'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
