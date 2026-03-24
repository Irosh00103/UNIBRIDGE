import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('analytics');
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/admin/analytics');
            setStats(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const fetchList = async (endpoint) => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/admin/${endpoint}`);
            setListData(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to load ${endpoint}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'analytics') fetchStats();
        else fetchList(activeTab);
    }, [activeTab]);

    const handleDelete = async (endpoint, id) => {
        if (!window.confirm('Are you absolutely sure you want to delete this?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/${endpoint}/${id}`);
            if (activeTab === 'analytics') fetchStats();
            else fetchList(activeTab);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    const tabOptions = ['analytics', 'users', 'jobs', 'materials', 'kuppis'];

    return (
        <div className="admin-container fade-in-up">
            <div className="admin-header">
                <h1 className="admin-title">Command Center</h1>
                <button className="btn btn-primary" onClick={() => navigate('/employer/jobs/create')}>+ Post Job Market</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="admin-tabs">
                {tabOptions.map((tab) => (
                    <button
                        key={tab}
                        className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading">Loading data...</div> : (
                <div className="admin-panel">
                    {activeTab === 'analytics' && stats && (
                        <div>
                            <h2 style={{ marginBottom: '24px', fontWeight: 700, color: 'var(--text-main)' }}>Platform Overview</h2>
                            <div className="admin-stats-grid">
                                {Object.entries(stats).map(([key, value]) => (
                                    <div className="stat-box" key={key}>
                                        <div className="stat-box-title">{key}</div>
                                        <div className="stat-box-value">{value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.map(u => (
                                        <tr key={u._id}>
                                            <td>{u.name}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td><button className="btn-delete" onClick={() => handleDelete('users', u._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Company</th>
                                        <th>Status</th>
                                        <th>Deadline</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.map(j => (
                                        <tr key={j._id}>
                                            <td>{j.title}</td>
                                            <td>{j.company || j.employerName}</td>
                                            <td>{j.status}</td>
                                            <td>{new Date(j.deadline).toLocaleDateString()}</td>
                                            <td><button className="btn-delete" onClick={() => handleDelete('jobs', j._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Module</th>
                                        <th>Type</th>
                                        <th>Uploader</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.map(m => (
                                        <tr key={m._id}>
                                            <td>{m.title}</td>
                                            <td>{m.module}</td>
                                            <td>{m.type}</td>
                                            <td>{m.studentName}</td>
                                            <td><button className="btn-delete" onClick={() => handleDelete('materials', m._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'kuppis' && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Module</th>
                                        <th>Date</th>
                                        <th>Host Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.map(k => (
                                        <tr key={k._id}>
                                            <td>{k.title}</td>
                                            <td>{k.module}</td>
                                            <td>{new Date(k.date).toLocaleString()}</td>
                                            <td>{k.student?.email || 'N/A'}</td>
                                            <td><button className="btn-delete" onClick={() => handleDelete('kuppis', k._id)}>Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
