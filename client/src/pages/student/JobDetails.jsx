import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';

const JobDetails = () => {
    const { state } = useLocation();
    const { id } = useParams();
    // navigate is unused but imported
    
    const job = state || { _id: id, title: 'Job Details', employerName: 'Employer', deadline: new Date(), description: 'Loading...', status: 'OPEN', applyLink: '#' };

    const [formData, setFormData] = useState({ cvLink: '', note: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        let tempErrors = {};
        if (!formData.cvLink) {
            tempErrors.cvLink = 'CV Link is required';
        } else if (!formData.cvLink.startsWith('http')) {
            tempErrors.cvLink = 'Link must be a valid URL starting with http';
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
            const res = await axios.post('http://localhost:5000/api/applications', {
                jobId: job._id,
                cvLink: formData.cvLink,
                note: formData.note
            });
            if (res.data.success) {
                setSuccessMsg('Application submitted successfully! ✅');
                setFormData({ cvLink: '', note: '' });
                setErrors({});
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to submit application';
            if (errorMsg.includes('already applied')) {
                setApiError('You have already applied to this job');
            } else if (errorMsg.includes('deadline')) {
                setApiError('Sorry, the deadline for this job has passed');
            } else {
                setApiError(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFillSample = () => {
        setFormData({
            cvLink: "https://drive.google.com/cv-sample-student",
            note: "I am highly motivated and eager to contribute to your team. I have strong skills in React and Node.js."
        });
        setErrors({});
    };

    return (
        <div className="container page">
            <div style={{ marginBottom: '24px' }}>
                <Link to="/student/jobs" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>← Back to Jobs</Link>
            </div>
            
            <div className="card" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>{job.title}</h1>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
                    <span>🏢 {job.employerName}</span>
                    <span>|</span>
                    <span>📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    <span>|</span>
                    <span className={`badge badge-${job.status.toLowerCase()}`}>{job.status}</span>
                </div>
                
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>About this role</h2>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
                    {job.description}
                </div>
                {job.applyLink && (
                    <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>
                        Visit Official Apply Link
                    </a>
                )}
            </div>

            <div className="card">
                <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Apply Now</h2>
                
                <button type="button" className="fill-btn" onClick={handleFillSample}>Fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>CV Link</label>
                        <input 
                            type="text" 
                            value={formData.cvLink} 
                            onChange={e => setFormData({...formData, cvLink: e.target.value})} 
                            placeholder="https://drive.google.com/your-cv" 
                            disabled={!!successMsg}
                        />
                        {errors.cvLink && <span className="error-text">{errors.cvLink}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Note (Optional)</label>
                        <textarea 
                            value={formData.note} 
                            onChange={e => setFormData({...formData, note: e.target.value})} 
                            placeholder="Tell the employer why you're a great fit..."
                            disabled={!!successMsg}
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading || !!successMsg}>
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JobDetails;
