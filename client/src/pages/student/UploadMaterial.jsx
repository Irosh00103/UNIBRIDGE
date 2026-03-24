import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../../styles/materials.css';

const UploadMaterial = () => {
    const [formData, setFormData] = useState({ title: '', module: '', description: '', type: 'PDF', link: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.module) tempErrors.module = 'Module is required';
        if (!formData.type) tempErrors.type = 'Type is required';
        if (!formData.link) {
            tempErrors.link = 'Link is required';
        } else if (!formData.link.startsWith('http')) {
            tempErrors.link = 'Please enter a valid URL (starting with http:// or https://)';
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
            const res = await axios.post('http://localhost:5000/api/materials', formData);
            if (res.data.success) {
                setSuccessMsg('Material uploaded successfully!');
                setFormData({ title: '', module: '', description: '', type: 'PDF', link: '' });
                setErrors({});
                setTimeout(() => navigate('/student/materials'), 1500);
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to upload material');
        } finally {
            setLoading(false);
        }
    };

    const handleFillSample = () => {
        setFormData({
            title: "Operating Systems Exam Notes",
            module: "IT2060",
            description: "Concise exam revision notes with expected questions and diagrams.",
            type: "PDF",
            link: "https://onedrive.live.com/sample-os-notes"
        });
        setErrors({});
    };

    return (
        <div className="materials-container fade-in-up">
            <div style={{ marginBottom: '24px' }}>
                <Link to="/student/materials" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600' }}>← Back to Materials</Link>
            </div>
            
            <div className="materials-header" style={{ justifyContent: 'center', marginBottom: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="materials-title">Share Knowledge</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Upload your study materials or reference links to help your peers succeed.</p>
                </div>
            </div>

            <div className="upload-card">
                <button type="button" className="sample-fill-btn" onClick={handleFillSample}>✨ Auto-fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Material Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Midterm Flashcards" />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Module Code</label>
                            <input type="text" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})} placeholder="e.g. CS101" />
                            {errors.module && <span className="error-text">{errors.module}</span>}
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>File Type</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="PDF">📄 PDF</option>
                                <option value="PPT">📊 PowerPoint</option>
                                <option value="DOCX">📝 Word Document</option>
                                <option value="Video">🎬 Video Link</option>
                                <option value="Other">📁 Other Resource</option>
                            </select>
                            {errors.type && <span className="error-text">{errors.type}</span>}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Content Link (OneDrive, Drive, etc.)</label>
                        <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://onedrive.live.com/..." />
                        {errors.link && <span className="error-text">{errors.link}</span>}
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Make sure the link sharing permissions are set correctly.</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Description (Optional)</label>
                        <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Give a brief summary of what this material contains to help others..." />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
                        {loading ? 'Uploading safely...' : 'Publish Material'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadMaterial;
