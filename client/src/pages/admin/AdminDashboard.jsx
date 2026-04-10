import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('analytics');
    const [listData, setListData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Edit Modal State
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

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
            let url = `http://localhost:5000/api/admin/${endpoint}`;
            
            // Use dedicated endpoint for modules
            if (endpoint === 'modules') {
                url = `http://localhost:5000/api/modules`;
            }
            
            const res = await axios.get(url);
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
        if (!window.confirm(`Are you absolutely sure you want to delete this ${endpoint.slice(0, -1)}?`)) return;
        try {
            let url = `http://localhost:5000/api/admin/${endpoint}/${id}`;
            
            // Use dedicated endpoint for modules
            if (endpoint === 'modules') {
                url = `http://localhost:5000/api/modules/${id}`;
            }
            
            await axios.delete(url);
            if (activeTab === 'analytics') fetchStats();
            else fetchList(activeTab);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete');
        }
    };

    // Modal Operations
    const handleEditClick = (item) => {
        setEditingItem(item);
        // Pre-fill form state
        if (activeTab === 'users') {
            setEditForm({ name: item.name, role: item.role, bio: item.bio || '' });
        } else if (activeTab === 'jobs') {
            setEditForm({ 
                title: item.title, 
                company: item.company || item.employerName || '', 
                status: item.status, 
                deadline: item.deadline ? new Date(item.deadline).toISOString().split('T')[0] : '',
                applyLink: item.applyLink || '',
                venue: item.venue || ''
            });
        } else if (activeTab === 'materials') {
            setEditForm({ title: item.title, module: item.module, type: item.type, link: item.link });
        } else if (activeTab === 'kuppis') {
            setEditForm({ 
                title: item.title, 
                module: item.module, 
                date: item.date ? new Date(item.date).toISOString().slice(0, 16) : '', 
                location: item.location || '',
                maxParticipants: item.maxParticipants || ''
            });
        } else if (activeTab === 'modules') {
            setEditForm({ 
                name: item.name, 
                year: String(item.year), 
                semester: String(item.semester),
                code: item.code || '',
                description: item.description || ''
            });
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let url = `http://localhost:5000/api/admin/${activeTab}/${editingItem._id}`;
            
            // Use dedicated endpoint for modules
            if (activeTab === 'modules') {
                url = `http://localhost:5000/api/modules/${editingItem._id}`;
            }
            
            await axios.put(url, editForm);
            setEditingItem(null);
            fetchList(activeTab); // refresh table
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update record');
        } finally {
            setIsSaving(false);
        }
    };

    const tabOptions = ['analytics', 'users', 'jobs', 'materials', 'kuppis', 'modules'];

    return (
        <div className="admin-container fade-in-up">
            <div className="admin-header">
                <h1 className="admin-title">Command Center</h1>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/profile')} style={{ background: 'var(--bg-card)' }}>⚙️ Account Settings</button>
                    <button className="btn btn-primary" onClick={() => navigate('/employer/jobs/create')}>+ Post Job Market</button>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="admin-tabs">
                {tabOptions.map((tab) => (
                    <button
                        key={tab}
                        className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab(tab);
                            setEditingItem(null);
                        }}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading">Loading database records...</div> : (
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
                                            <td style={{ fontWeight: 600 }}>{u.name}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                                            <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                                            <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }} onClick={() => handleEditClick(u)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete('users', u._id)}>Delete</button>
                                            </td>
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
                                            <td style={{ fontWeight: 600 }}>{j.title}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{j.company || j.employerName}</td>
                                            <td><span className={`badge badge-${(j.status || 'open').toLowerCase()}`}>{j.status || 'OPEN'}</span></td>
                                            <td>{new Date(j.deadline).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }} onClick={() => handleEditClick(j)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete('jobs', j._id)}>Delete</button>
                                            </td>
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
                                            <td style={{ fontWeight: 600 }}>{m.title}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{m.module}</td>
                                            <td><span className={`badge`} style={{ background: 'var(--bg-input)' }}>{m.type}</span></td>
                                            <td>{m.studentName}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }} onClick={() => handleEditClick(m)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete('materials', m._id)}>Delete</button>
                                            </td>
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
                                            <td style={{ fontWeight: 600 }}>{k.title}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{k.module}</td>
                                            <td>{new Date(k.date).toLocaleString()}</td>
                                            <td>{k.student?.email || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }} onClick={() => handleEditClick(k)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete('kuppis', k._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'modules' && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Year</th>
                                        <th>Semester</th>
                                        <th>Code</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.map(m => (
                                        <tr key={m._id}>
                                            <td style={{ fontWeight: 600 }}>{m.name}</td>
                                            <td>{m.year}</td>
                                            <td>{m.semester}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{m.code || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-sm btn-outline" style={{ marginRight: '8px' }} onClick={() => handleEditClick(m)}>Edit</button>
                                                <button className="btn-delete" onClick={() => handleDelete('modules', m._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Editing Glassmorphism Modal Portaled to Body */}
            {editingItem && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', zIndex: 999999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div className="card fade-in-up" style={{ 
                        width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', 
                        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', 
                        border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: 'var(--radius-lg)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0 }}>Edit Record</h2>
                            <button className="btn-delete" style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: 'none' }} onClick={() => setEditingItem(null)}>✕ Close</button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            
                            {/* User Editor */}
                            {activeTab === 'users' && (
                                <>
                                    <div className="form-group"><label>Name</label><input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                                    <div className="form-group"><label>Role</label>
                                        <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                                            <option value="student">Student</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Bio</label><textarea value={editForm.bio} onChange={e => setEditForm({...editForm, bio: e.target.value})} /></div>
                                </>
                            )}

                            {/* Job Editor */}
                            {activeTab === 'jobs' && (
                                <>
                                    <div className="form-group"><label>Job Title</label><input required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                                    <div className="form-group"><label>Company/Institution</label><input value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} /></div>
                                    <div className="form-group"><label>Status</label>
                                        <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                                            <option value="OPEN">OPEN</option>
                                            <option value="CLOSED">CLOSED</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Application Link</label><input required type="url" value={editForm.applyLink} onChange={e => setEditForm({...editForm, applyLink: e.target.value})} /></div>
                                    <div className="form-group"><label>Deadline</label><input required type="date" value={editForm.deadline} onChange={e => setEditForm({...editForm, deadline: e.target.value})} /></div>
                                    <div className="form-group"><label>Venue (Optional)</label><input value={editForm.venue} onChange={e => setEditForm({...editForm, venue: e.target.value})} /></div>
                                </>
                            )}

                            {/* Materials Editor */}
                            {activeTab === 'materials' && (
                                <>
                                    <div className="form-group"><label>Material Title</label><input required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                                    <div className="form-group"><label>Module Code</label><input required value={editForm.module} onChange={e => setEditForm({...editForm, module: e.target.value})} /></div>
                                    <div className="form-group"><label>Type</label>
                                        <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                                            <option value="PDF">PDF Document</option>
                                            <option value="Video">Video Link</option>
                                            <option value="PPT">Presentation</option>
                                            <option value="Doc">Word Document</option>
                                            <option value="Link">External Link</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>OneDrive/G-Drive Link</label><input required type="url" value={editForm.link} onChange={e => setEditForm({...editForm, link: e.target.value})} /></div>
                                </>
                            )}

                            {/* Kuppi Editor */}
                            {activeTab === 'kuppis' && (
                                <>
                                    <div className="form-group"><label>Session Title</label><input required value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} /></div>
                                    <div className="form-group"><label>Module Code</label><input required value={editForm.module} onChange={e => setEditForm({...editForm, module: e.target.value})} /></div>
                                    <div className="form-group"><label>Date & Time</label><input required type="datetime-local" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} /></div>
                                    <div className="form-group"><label>Location/Meeting Link</label><input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} /></div>
                                    <div className="form-group"><label>Max Participants Limit (Optional)</label><input type="number" min="1" value={editForm.maxParticipants} onChange={e => setEditForm({...editForm, maxParticipants: e.target.value})} /></div>
                                </>
                            )}

                            {/* Module Editor */}
                            {activeTab === 'modules' && (
                                <>
                                    <div className="form-group"><label>Module Name</label><input required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                                    <div className="form-group"><label>Code (Optional)</label><input value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} /></div>
                                    <div className="form-group"><label>Year</label>
                                        <select required value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})}>
                                            <option value="">Select Year</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                            <option value="3">3</option>
                                            <option value="4">4</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Semester</label>
                                        <select required value={editForm.semester} onChange={e => setEditForm({...editForm, semester: e.target.value})}>
                                            <option value="">Select Semester</option>
                                            <option value="1">1</option>
                                            <option value="2">2</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Description (Optional)</label><textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} /></div>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingItem(null)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>, 
                document.body
            )}
        </div>
    );
};

export default AdminDashboard;
