import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { login } = useAuth();

    const validate = () => {
        let isValid = true;
        let tempErrors = {};
        
        if (!formData.name) { tempErrors.name = 'Name is required'; isValid = false; }
        if (!formData.email) { tempErrors.email = 'Email is required'; isValid = false; }
        else if (!formData.email.includes('@')) { tempErrors.email = 'Email must contain @ symbol'; isValid = false; }
        
        if (!formData.password) { tempErrors.password = 'Password is required'; isValid = false; }
        else if (formData.password.length < 6) { tempErrors.password = 'Minimum 6 characters required'; isValid = false; }

        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
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
            setError(err.response?.data?.message || 'Failed to register account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">🚀</div>
                    <h1 className="auth-title">Create Account</h1>
                    <div className="auth-badge">Join UniBridge</div>
                </div>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            placeholder="John Doe"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            placeholder="john@example.com"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={formData.password} 
                            onChange={e => setFormData({...formData, password: e.target.value})} 
                            placeholder="Minimum 6 characters"
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                    {/* Registration is now exclusively for standard Student accounts */}
                    <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;