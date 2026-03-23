import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Kuppi = () => {
  const { token } = useAuth();
  const [kuppis, setKuppis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', module: '', date: '', description: '' });
  const [formError, setFormError] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchKuppis = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/kuppi', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKuppis(res.data.data);
      } catch (err) {
        setError('Failed to load sessions');
      }
      setLoading(false);
    };
    fetchKuppis();
  }, [token, success]);

  const validate = () => {
    const err = {};
    if (!form.title) err.title = 'Title required';
    if (!form.module) err.module = 'Module required';
    if (!form.date) err.date = 'Date required';
    else if (new Date(form.date) <= new Date()) err.date = 'Date must be in the future';
    return err;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError({ ...formError, [e.target.name]: '' });
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) {
      setFormError(err);
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('/api/kuppi', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Session created!');
        setForm({ title: '', module: '', date: '', description: '' });
      } else {
        setFormError({ form: res.data.message });
      }
    } catch (err) {
      setFormError({ form: 'Failed to create session' });
    }
    setSubmitting(false);
  };

  const fillSample = () => setForm({
    title: 'Algebra Group Study',
    module: 'MATH201',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    description: 'Let’s revise together!'
  });

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Upcoming Sessions</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      <div style={{ display: 'grid', gap: 18, marginBottom: 32 }}>
        {kuppis.map(k => (
          <div className="card" key={k._id}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{k.title}</div>
            <div style={{ color: 'var(--muted)' }}>{k.module}</div>
            <div>Date: {new Date(k.date).toLocaleDateString()}</div>
            <div style={{ color: 'var(--muted)' }}>Host: {k.studentName}</div>
            {k.description && <div style={{ marginTop: 8 }}>{k.description}</div>}
          </div>
        ))}
      </div>
      <form className="card" style={{ maxWidth: 400, margin: '0 auto' }} onSubmit={handleSubmit}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Create Session</div>
        {success && <div className="form-success">{success}</div>}
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
        {formError.title && <div className="form-error">{formError.title}</div>}
        <input name="module" placeholder="Module" value={form.module} onChange={handleChange} />
        {formError.module && <div className="form-error">{formError.module}</div>}
        <input name="date" type="date" value={form.date} onChange={handleChange} />
        {formError.date && <div className="form-error">{formError.date}</div>}
        <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
        {formError.form && <div className="form-error">{formError.form}</div>}
        <button className="button" type="submit" style={{ width: '100%' }} disabled={submitting}>{submitting ? 'Loading...' : 'Create'}</button>
        <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--muted)' }} onClick={fillSample}>Fill Sample Data</button>
      </form>
    </div>
  );
};

export default Kuppi;
