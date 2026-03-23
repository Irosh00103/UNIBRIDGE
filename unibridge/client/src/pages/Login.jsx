import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Invalid email format');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      if (res.data.success) {
        login(res.data.data.user, res.data.data.token);
        if (res.data.data.user.role === 'student') navigate('/student/home');
        else navigate('/employer/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const fillStudent = () => setForm({ email: 'student@test.com', password: 'test123' });
  const fillEmployer = () => setForm({ email: 'employer@test.com', password: 'test123' });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <form className="card" style={{ width: 350 }} onSubmit={handleSubmit}>
        <div style={{ fontWeight: 700, fontSize: 28, textAlign: 'center', marginBottom: 24, color: 'var(--primary)' }}>UniBridge</div>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Login</div>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="username" />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" />
        {error && <div className="form-error">{error}</div>}
        <button className="button" type="submit" style={{ width: '100%', marginTop: 8 }} disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
        <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--muted)' }} onClick={fillStudent}>Fill Sample Data</button>
        <button type="button" className="button" style={{ width: '100%', marginTop: 8, background: 'var(--primary-dark)' }} onClick={fillEmployer}>Login as Employer</button>
      </form>
    </div>
  );
};

export default Login;
