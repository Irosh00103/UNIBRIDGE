import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentHome = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="container page">
            <div className="page-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <h1>Welcome back, {user?.name}! 👋</h1>
                <p style={{ color: 'var(--muted)' }}>What would you like to do today?</p>
            </div>

            <div className="card-grid">
                <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '48px' }}>📚</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Lecture Materials</div>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Browse and share study materials</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/materials')} style={{ marginTop: 'auto' }}>Go →</button>
                </div>
                
                <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '48px' }}>💼</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Job Board</div>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Find and apply for opportunities</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/jobs')} style={{ marginTop: 'auto' }}>Go →</button>
                </div>
                
                <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '48px' }}>📋</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>My Applications</div>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Track your job application status</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/applications')} style={{ marginTop: 'auto' }}>Go →</button>
                </div>

                <div className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '48px' }}>🎓</div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Kuppi Hub</div>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Join or create peer study sessions</p>
                    <button className="btn btn-primary" onClick={() => navigate('/student/kuppi')} style={{ marginTop: 'auto' }}>Go →</button>
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
