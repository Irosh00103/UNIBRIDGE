import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';

const ViewApplicants = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const [apps, setApps] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/applications/job/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApps(res.data.data);
        // Get job title from jobs endpoint
        const jobsRes = await axios.get('/api/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const job = jobsRes.data.data.find(j => j._id === id);
        setJobTitle(job ? job.title : '');
      } catch (err) {
        setError('Failed to load applicants');
      }
      setLoading(false);
    };
    fetchApps();
  }, [id, token]);

  const updateStatus = async (appId, status) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await axios.patch(`/api/applications/${appId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApps(apps => apps.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Applicants for: {jobTitle}</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>CV Link</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Note</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="card" style={{ boxShadow: 'none', border: 'none' }}>
                <td style={{ padding: 8 }}>{app.studentName}</td>
                <td style={{ padding: 8 }}>{app.studentEmail}</td>
                <td style={{ padding: 8 }}><a href={app.cvLink} target="_blank" rel="noopener noreferrer">CV</a></td>
                <td style={{ padding: 8 }}>{app.note}</td>
                <td style={{ padding: 8 }}><span className={`status-badge ${app.status}`}>{app.status}</span></td>
                <td style={{ padding: 8 }}>
                  <button className="button" style={{ marginRight: 8 }} disabled={app.status !== 'PENDING'} onClick={() => updateStatus(app._id, 'SELECTED')}>SELECT</button>
                  <button className="button" style={{ background: 'var(--danger)' }} disabled={app.status !== 'PENDING'} onClick={() => updateStatus(app._id, 'REJECTED')}>REJECT</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewApplicants;
