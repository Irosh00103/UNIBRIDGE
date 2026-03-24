import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <nav style={{ height: '64px', backgroundColor: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    <Link to={user.role === 'student' ? '/student/home' : '/employer/dashboard'} style={{ textDecoration: 'none', color: 'var(--primary)' }}>
                        🎓 UniBridge
                    </Link>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
                                <span style={{ position: 'absolute', top: '-5px', right: '-8px', background: 'red', color: 'white', borderRadius: '50%', fontSize: '10px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/employer/dashboard" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Dashboard</Link>
                            <Link to="/employer/jobs/create" style={{ textDecoration: 'none', color: 'var(--text)', fontSize: '14px', fontWeight: '500' }}>Post Job</Link>
                        </>
                    )}
                    <button onClick={logout} className="btn btn-outline btn-sm">Logout</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
