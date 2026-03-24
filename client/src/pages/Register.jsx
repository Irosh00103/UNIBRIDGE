import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
            <div className="card" style={{ width: '450px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚀</div>
                    <h1 style={{ color: 'var(--text)', fontSize: '28px', fontWeight: 'bold' }}>Create an Account</h1>
                    <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Join UniBridge and start exploring</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" />
                        {errors.name && <span className="error-text">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Minimum 6 characters" />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>I am a...</label>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                <input type="radio" name="role" value="student" checked={formData.role === 'student'} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: 'auto' }} />
                                Student
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal' }}>
                                <input type="radio" name="role" value="employer" checked={formData.role === 'employer'} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: 'auto' }} />
                                Employer
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '24px', padding: '12px' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                    
                    <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
