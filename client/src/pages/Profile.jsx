import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const [form, setForm] = useState({ name: '', bio: '', avatarUrl: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/me');
                const data = res.data.data;
                setForm({
                    name: data.name || '',
                    bio: data.bio || '',
                    avatarUrl: data.avatarUrl || '',
                    password: ''
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile details');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const saveProfile = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;

            const res = await axios.put('http://localhost:5000/api/users/me', payload);
            updateUser({ ...user, ...res.data.data }); // update context
            setForm((prev) => ({ ...prev, password: '' })); // clear password field
            setMessage('Profile updated successfully! ✨');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const deleteAccount = async () => {
        const confirm1 = window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.');
        if (!confirm1) return;
        const confirm2 = window.prompt('Type "DELETE" to confirm account deletion:');
        if (confirm2 !== 'DELETE') return;

        try {
            setLoading(true);
            await axios.delete('http://localhost:5000/api/users/me');
            logout();
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="container page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="loading">Loading your profile...</div>
            </div>
        );
    }

    return (
        <div className="container page fade-in-up" style={{ padding: '80px 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '40px', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>Account Settings</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage your personal information and preferences.</p>
                </div>
            </div>

            <div className="card" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700,
                        boxShadow: '0 8px 16px var(--primary-glow)'
                    }}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{user?.name}</h2>
                        <span className={`badge badge-${user?.role || 'student'}`} style={{ marginTop: '8px', display: 'inline-block' }}>{user?.role}</span>
                    </div>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={saveProfile}>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Full Name</label>
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Bio (About Me)</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            placeholder="Tell your peers a bit about yourself, your major, interests..."
                            style={{ minHeight: '100px' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Avatar URL (Optional)</label>
                        <input value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} placeholder="https://example.com/my-photo.jpg" />
                    </div>

                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>New Password (Leave blank to keep current)</label>
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Required length &gt;= 5 characters if updating.</span>
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                        {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                </form>

                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border-light)' }}>
                    <h3 style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Danger Zone</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Once you delete your account, there is no going back. Please be certain.</p>
                    <button className="btn" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)', width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600 }} onClick={deleteAccount} type="button" disabled={loading}>
                        Delete My Account
                    </button>
                </div>
            </div>

        </div>
    );
};

export default Profile;
