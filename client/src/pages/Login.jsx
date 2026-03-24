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
                } else if (res.data.user.role === 'employer') {
                    navigate('/employer/dashboard');
                } else if (res.data.user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/'); // fallback
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🎓</div>
                    <h1 className="auth-title">UniBridge</h1>
                    <div className="auth-badge">Welcome Back</div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
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
    );
};

export default Login;