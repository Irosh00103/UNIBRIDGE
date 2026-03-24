import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [emailErr, setEmailErr] = useState('');
    const [passErr, setPassErr] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const validate = () => {
        let isValid = true;
        if (!email) { setEmailErr('Email is required'); isValid = false; }
        else if (!email.includes('@')) { setEmailErr('Email must contain @ symbol'); isValid = false; }
        else { setEmailErr(''); }

        if (!password) { setPassErr('Password is required'); isValid = false; }
        else if (password.length < 6) { setPassErr('Minimum 6 characters required'); isValid = false; }
        else { setPassErr(''); }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            if (res.data.success) {
                login(res.data.user, res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                if (res.data.user.role === 'student') {
                    navigate('/student/home');
                } else {
                    navigate('/employer/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div className="card" style={{ width: '400px', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎓</div>
                    <h1 style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: 'bold' }}>UniBridge</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Your University Hub</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                        {emailErr && <span className="error-text">{emailErr}</span>}
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                        {passErr && <span className="error-text">{passErr}</span>}
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }} disabled={loading}>
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setEmail('student@test.com'); setPassword('test123'); setPassErr(''); setEmailErr(''); }}>
                        👩‍🎓 Fill as Student
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setEmail('employer@test.com'); setPassword('test123'); setPassErr(''); setEmailErr(''); }}>
                        🏢 Fill as Employer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
