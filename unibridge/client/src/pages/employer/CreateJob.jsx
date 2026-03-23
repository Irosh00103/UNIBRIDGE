import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const err = {};
    if (!form.title) err.title = 'Title required';
    if (!form.description) err.description = 'Description required';
    if (!form.deadline) err.deadline = 'Deadline required';
    else if (new Date(form.deadline) <= new Date()) err.deadline = 'Deadline must be a future date';
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
      const res = await axios.post('/api/jobs', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Job posted!');
        setTimeout(() => navigate('/employer/dashboard'), 2000);
      } else {
        setError({ form: res.data.message });
      }
    } catch (err) {
      setError({ form: 'Failed to post job' });
    }
    setLoading(false);
  };

  const fillSample = () => setForm({
    title: 'Frontend Developer',
    description: 'Build React apps for our team.',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  });

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <form className="card" onSubmit={handleSubmit}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Post a New Job</div>
        {success && <div className="form-success">{success}</div>}
        <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} />
        {error.title && <div className="form-error">{error.title}</div>}
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        {error.description && <div className="form-error">{error.description}</div>}
        <input name="deadline" type="date" value={form.deadline} onChange={handleChange} />
        {error.deadline && <div className="form-error">{error.deadline}</div>}
        {error.form && <div className="form-error">{error.form}</div>}
        <button className="button" type="submit" style={{ width: '100%' }} disabled={loading}>{loading ? 'Loading...' : 'Post'}</button>
        <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--muted)' }} onClick={fillSample}>Fill Sample Data</button>
      </form>
    </div>
  );
};

export default CreateJob;
