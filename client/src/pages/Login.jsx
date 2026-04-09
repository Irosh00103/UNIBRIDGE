import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [emailErr, setEmailErr] = useState('');
    const [passErr, setPassErr] = useState('');

    const navigate = useNavigate();
    const { login } = useAuth();

    const normalizeLoginResponse = (data) => {
        if (data?.success) {
            return { ok: true, token: data.token, user: data.user };
        }
        if (data?.token && data?.user) {
            return { ok: true, token: data.token, user: data.user };
        }
        return { ok: false };
    };

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
            let authData;
            try {
                const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
                authData = normalizeLoginResponse(res.data);
            } catch (primaryErr) {
                const res = await axios.post('http://localhost:5000/api/uni/auth/login', { email, password });
                authData = normalizeLoginResponse(res.data);
            }

            if (authData?.ok) {
                login(authData.user, authData.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
                if (authData.user.role === 'student') {
                    navigate('/student/home');
                } else if (authData.user.role === 'employer') {
                    navigate('/employer/dashboard');
                } else if (authData.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/'); // fallback
                }
            } else {
                setError('Failed to login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-shell">
                <aside className="auth-side-panel">
                    <div className="auth-side-badge">Student & Employer Access</div>
                    <h2>One platform for learning, collaboration, and career growth.</h2>
                    <p>Sign in to continue your UniBridge journey with materials, jobs, alerts, and application tracking in one place.</p>
                    <div className="auth-illustration-wrap">
                        <img src="/auth-illustration.svg" alt="UniBridge authentication illustration" className="auth-illustration" />
                    </div>
                    <div className="auth-side-metrics">
                        <div>
                            <strong>12K+</strong>
                            <span>Active students</span>
                        </div>
                        <div>
                            <strong>300+</strong>
                            <span>Partner employers</span>
                        </div>
                    </div>
                </aside>

                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🎓</div>
                        <h1 className="auth-title">Welcome Back</h1>
                        <div className="auth-badge">Sign in to UniBridge</div>
                    </div>
                    {error && <div className="alert alert-error">{error}</div>}
                    <form onSubmit={handleSubmit} className="auth-form-grid">
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="you@example.com"
                                className={emailErr ? 'error' : ''}
                            />
                            {emailErr && <span className="error-text">{emailErr}</span>}
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                placeholder="••••••"
                                className={passErr ? 'error' : ''}
                            />
                            {passErr && <span className="error-text">{passErr}</span>}
                        </div>
                        <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="auth-demo-buttons">
                        <button 
                            type="button" 
                            className="auth-btn-outline" 
                            onClick={() => { setEmail('student@test.com'); setPassword('test123'); setPassErr(''); setEmailErr(''); }}
                        >
                            👩‍🎓 Student Demo
                        </button>
                        <button 
                            type="button" 
                            className="auth-btn-outline" 
                            onClick={() => { setEmail('employer@test.com'); setPassword('test123'); setPassErr(''); setEmailErr(''); }}
                        >
                            🏢 Employer Demo
                        </button>
                    </div>
                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Sign up now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;