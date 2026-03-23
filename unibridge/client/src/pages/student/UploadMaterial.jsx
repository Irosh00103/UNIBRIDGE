import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const types = ['PDF', 'PPT', 'DOCX', 'Video', 'Other'];

const UploadMaterial = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', module: '', type: '', link: '' });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.title) err.title = 'Title required';
    if (!form.module) err.module = 'Module required';
    if (!form.type) err.type = 'Type required';
    if (!form.link) err.link = 'Link required';
    else if (!form.link.startsWith('http')) err.link = 'Link must start with http';
    return err;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError({ ...error, [e.target.name]: '' });
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/materials', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Material uploaded!');
        setForm({ title: '', module: '', type: '', link: '' });
      } else {
        setError({ form: res.data.message });
      }
    } catch (err) {
      setError({ form: 'Failed to upload' });
    }
    setLoading(false);
  };

  const fillSample = () => setForm({
    title: 'Operating Systems Notes',
    module: 'CS2103',
    type: 'PDF',
    link: 'http://example.com/os-notes.pdf'
  });

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <form className="card" onSubmit={handleSubmit}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Upload Material</div>
        {success && <div className="form-success">{success}</div>}
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        {error.title && <div className="form-error">{error.title}</div>}
        <input name="module" placeholder="Module" value={form.module} onChange={handleChange} />
        {error.module && <div className="form-error">{error.module}</div>}
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="">Select Type</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {error.type && <div className="form-error">{error.type}</div>}
        <input name="link" placeholder="Link (http...)" value={form.link} onChange={handleChange} />
        {error.link && <div className="form-error">{error.link}</div>}
        {error.form && <div className="form-error">{error.form}</div>}
        <button className="button" type="submit" style={{ width: '100%' }} disabled={loading}>{loading ? 'Loading...' : 'Upload'}</button>
        <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--muted)' }} onClick={fillSample}>Fill Sample Data</button>
      </form>
    </div>
  );
};

export default UploadMaterial;
