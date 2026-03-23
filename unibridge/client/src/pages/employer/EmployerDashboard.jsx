import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const EmployerDashboard = () => {
  const { token, user } = useAuth();
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
        setJobs(res.data.data.filter(j => j.employerId === user.id));
      } catch (err) {
        setError('Failed to load jobs');
      }
      setLoading(false);
    };
    fetchJobs();
  }, [token, user]);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>Welcome, {user?.name}!</div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <Link to="/employer/jobs/create"><div className="card" style={{ minWidth: 180, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>➕</div>
          <div style={{ fontWeight: 600, fontSize: 18, margin: '8px 0' }}>Post a New Job</div>
        </div></Link>
        <div className="card" style={{ minWidth: 180, textAlign: 'center', opacity: 0.7 }}>
          <div style={{ fontSize: 32 }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: 18, margin: '8px 0' }}>View My Jobs</div>
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 12 }}>My Jobs</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Title</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Deadline</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Applicants</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id} className="card" style={{ boxShadow: 'none', border: 'none' }}>
                <td style={{ padding: 8 }}>{job.title}</td>
                <td style={{ padding: 8 }}>{new Date(job.deadline).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}><span className={`status-badge ${job.status}`}>{job.status}</span></td>
                <td style={{ padding: 8 }}>
                  <Link to={`/employer/jobs/${job._id}/applicants`}><button className="button">View Applicants</button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerDashboard;
