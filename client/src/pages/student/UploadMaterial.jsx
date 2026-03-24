import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const UploadMaterial = () => {
    const [formData, setFormData] = useState({ title: '', module: '', type: 'PDF', link: '' });
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.module) tempErrors.module = 'Module is required';
        if (!formData.type) tempErrors.type = 'Type is required';
        if (!formData.link) {
            tempErrors.link = 'Link is required';
        } else if (!formData.link.startsWith('http')) {
            tempErrors.link = 'Please enter a valid URL starting with http';
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
                setFormData({ title: '', module: '', type: 'PDF', link: '' });
                setErrors({});
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
            type: "PDF",
            link: "https://drive.google.com/file/sample-os-notes"
        });
        setErrors({});
    };

    return (
        <div className="container page">
            <div style={{ marginBottom: '24px' }}>
                <Link to="/student/materials" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '14px', fontWeight: '500' }}>← Back to Materials</Link>
            </div>
            <div className="page-header">
                <h1>Upload Material</h1>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <button type="button" className="fill-btn" onClick={handleFillSample}>Fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    <div className="form-group">
                        <label>Module</label>
                        <input type="text" value={formData.module} onChange={e => setFormData({...formData, module: e.target.value})} placeholder="e.g. IT3040" />
                        {errors.module && <span className="error-text">{errors.module}</span>}
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                            <option value="PDF">PDF</option>
                            <option value="PPT">PPT</option>
                            <option value="DOCX">DOCX</option>
                            <option value="Video">Video</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.type && <span className="error-text">{errors.type}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Link</label>
                        <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://drive.google.com/..." />
                        {errors.link && <span className="error-text">{errors.link}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Material'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadMaterial;
