import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data.data);
      } catch (err) {
        setError('Failed to load jobs');
      }
      setLoading(false);
    };
    fetchJobs();
  }, [token]);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Available Jobs</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      {!loading && jobs.length === 0 && <div>No jobs available</div>}
      <div style={{ display: 'grid', gap: 18 }}>
        {jobs.map(job => (
          <div className="card" key={job._id}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{job.title}</div>
            <div style={{ color: 'var(--muted)' }}>By {job.employerName}</div>
            <div style={{ margin: '8px 0' }}>Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
            <span className="status-badge OPEN">OPEN</span>
            <Link to={`/student/jobs/${job._id}`}><button className="button" style={{ marginTop: 10 }}>View &amp; Apply</button></Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
