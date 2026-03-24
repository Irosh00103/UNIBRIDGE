import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const CreateJob = () => {
    const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.description) tempErrors.description = 'Description is required';
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
                setSuccessMsg('Job posted successfully! ✅');
                setFormData({ title: '', description: '', deadline: '' });
                setErrors({});
                setTimeout(() => {
                    navigate('/employer/dashboard');
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
            description: "We are looking for an enthusiastic full stack developer intern to join our growing team. You will work on real projects using React and Node.js. Strong communication skills required.",
            deadline: formattedDate
        });
        setErrors({});
    };

    return (
        <div className="container page">
            <div style={{ marginBottom: '24px' }}>
                <Link to="/employer/dashboard" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>← Back to Dashboard</Link>
            </div>
            <div className="page-header">
                <h1>Post a New Job</h1>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <button type="button" className="fill-btn" onClick={handleFillSample}>Fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Job Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            style={{ minHeight: '120px' }}
                            placeholder="Describe the role, requirements and responsibilities..."
                        ></textarea>
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Deadline</label>
                        <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                        {errors.deadline && <span className="error-text">{errors.deadline}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading || !!successMsg}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
