import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav style={{ height: '70px', backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow)' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Poppins, sans-serif' }}>
                    <Link to={user ? (user.role === 'student' ? '/student/home' : '/employer/dashboard') : '/'} style={{ textDecoration: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '28px' }}>🎓</span> UniBridge
                    </Link>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    {!user ? (
                        <>
                            <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? 'var(--primary)' : 'var(--text)', fontSize: '15px', fontWeight: '500', transition: '0.2s' }}>Home</Link>
                            <Link to="/about" style={{ textDecoration: 'none', color: location.pathname === '/about' ? 'var(--primary)' : 'var(--text)', fontSize: '15px', fontWeight: '500', transition: '0.2s' }}>About</Link>
                            <Link to="/contact" style={{ textDecoration: 'none', color: location.pathname === '/contact' ? 'var(--primary)' : 'var(--text)', fontSize: '15px', fontWeight: '500', transition: '0.2s' }}>Contact</Link>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border)' }}></div>
                            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '15px', fontWeight: '500' }}>Log in</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px' }}>Sign up</Link>
                        </>
                    ) : (
                        <>
                            {user.role === 'student' ? (
                                <>
                                    <Link to="/student/home" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Home</Link>
                                    <Link to="/student/materials" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Materials</Link>
                                    <Link to="/student/materials/upload" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Upload</Link>
                                    <Link to="/student/jobs" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Jobs</Link>
                                    <Link to="/student/applications" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>My Applications</Link>
                                    <Link to="/student/kuppi" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Kuppi</Link>
                                    <div style={{ position: 'relative', cursor: 'pointer' }}>
                                        🔔
                                        <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/employer/dashboard" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Dashboard</Link>
                                    <Link to="/employer/jobs/create" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Post Job</Link>
                                </>
                            )}
                            <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
