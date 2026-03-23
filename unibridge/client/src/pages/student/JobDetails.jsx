import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [form, setForm] = useState({ cvLink: '', note: '' });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.data.find(j => j._id === id);
        setJob(found);
      } catch (err) {
        setJob(null);
      }
      setLoading(false);
    };
    fetchJob();
  }, [id, token]);

  const validate = () => {
    const err = {};
    if (!form.cvLink) err.cvLink = 'CV link required';
    else if (!form.cvLink.startsWith('http')) err.cvLink = 'CV link must start with http';
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
    setApplying(true);
    try {
      const res = await axios.post('/api/applications', { jobId: id, ...form }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSuccess('Application submitted!');
        setForm({ cvLink: '', note: '' });
      } else {
        setError({ form: res.data.message });
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message === 'Already applied') {
        setError({ form: 'Already applied' });
      } else {
        setError({ form: 'Failed to apply' });
      }
    }
    setApplying(false);
  };

  const fillSample = () => setForm({
    cvLink: 'http://example.com/my-cv.pdf',
    note: 'Excited to apply!'
  });

  if (loading) return <div>Loading...</div>;
  if (!job) return <div className="form-error">Job not found</div>;

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 22 }}>{job.title}</div>
        <div style={{ color: 'var(--muted)', marginBottom: 8 }}>By {job.employerName}</div>
        <div style={{ marginBottom: 8 }}>{job.description}</div>
        <div style={{ color: 'var(--muted)', marginBottom: 8 }}>Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
        <form onSubmit={handleSubmit}>
          <input name="cvLink" placeholder="CV Link (http...)" value={form.cvLink} onChange={handleChange} />
          {error.cvLink && <div className="form-error">{error.cvLink}</div>}
          <textarea name="note" placeholder="Note (optional)" value={form.note} onChange={handleChange} />
          {error.form && <div className="form-error">{error.form}</div>}
          {success && <div className="form-success">{success}</div>}
          <button className="button" type="submit" style={{ width: '100%' }} disabled={applying}>{applying ? 'Loading...' : 'Apply'}</button>
          <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--muted)' }} onClick={fillSample}>Fill Sample Data</button>
        </form>
      </div>
    </div>
  );
};

export default JobDetails;
