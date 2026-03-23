import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const statusColors = {
  PENDING: 'PENDING',
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
};

const MyApplications = () => {
  const { token } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/applications/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApps(res.data.data);
      } catch (err) {
        setError('Failed to load applications');
      }
      setLoading(false);
    };
    fetchApps();
  }, [token]);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>My Applications</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      {!loading && apps.length === 0 && <div>No applications yet</div>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Job Title</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Date Applied</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map(app => (
              <tr key={app._id} className="card" style={{ boxShadow: 'none', border: 'none' }}>
                <td style={{ padding: 8 }}>{app.jobId?.title || '-'}</td>
                <td style={{ padding: 8 }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}><span className={`status-badge ${statusColors[app.status]}`}>{app.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyApplications;
