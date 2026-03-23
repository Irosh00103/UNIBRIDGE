import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Materials = () => {
  const { token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/materials', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterials(res.data.data);
      } catch (err) {
        setError('Failed to load materials');
      }
      setLoading(false);
    };
    fetchMaterials();
  }, [token]);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 20 }}>Lecture Materials</div>
      {loading && <div>Loading...</div>}
      {error && <div className="form-error">{error}</div>}
      {!loading && materials.length === 0 && <div>No materials yet</div>}
      <div style={{ display: 'grid', gap: 18 }}>
        {materials.map(mat => (
          <div className="card" key={mat._id}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{mat.title}</div>
            <div style={{ color: 'var(--muted)' }}>{mat.module}</div>
            <span className={`status-badge ${mat.type}`}>{mat.type}</span>
            <div style={{ marginTop: 8, color: 'var(--muted)' }}>By {mat.studentName}</div>
            <a href={mat.link} target="_blank" rel="noopener noreferrer"><button className="button" style={{ marginTop: 10 }}>View</button></a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materials;
