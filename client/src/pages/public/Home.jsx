import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';

const Home = () => {
    const navigate = useNavigate();

    return (
        <>
            <div className="hero-section">
                <div className="container">
                    <div className="fade-in-up">
                        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
                            🚀 The All-in-One Platform
                        </div>
                        <h1 className="hero-title">
                            Empower Your <br/><span>University Journey</span>
                        </h1>
                        <p className="hero-subtitle">
                            UniBridge seamlessly connects students and employers. Share lecture materials, explore job opportunities, schedule peer study sessions, and track applications all in one place.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }} onClick={() => navigate('/register')}>
                                Get Started Free
                            </button>
                            <button className="btn btn-outline" style={{ padding: '14px 28px', fontSize: '16px', background: 'white' }} onClick={() => navigate('/about')}>
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '80px 24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }} className="fade-in-up delay-1">
                    <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Why Choose UniBridge?</h2>
                    <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>Everything you need to succeed academically and professionally, packed into a single, beautiful platform.</p>
                </div>
                
                <div className="feature-grid fade-in-up delay-2">
                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3 className="feature-title">Lecture Materials</h3>
                        <p className="feature-text">Easily browse, upload, and organize your class notes, PDFs, or videos. Share knowledge with your peers effortlessly.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💼</div>
                        <h3 className="feature-title">Career Opportunities</h3>
                        <p className="feature-text">Discover internships and jobs tailored for you. Apply with a single click and track your applications in real time.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎓</div>
                        <h3 className="feature-title">Peer Study Hub</h3>
                        <p className="feature-text">Create or join 'Kuppi' study sessions. Connect with classmates and prepare for your exams together.</p>
                    </div>
                </div>

                <div className="cta-section gradient-bg fade-in-up delay-3">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Ready to bridge the gap?</h2>
                        <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 32px' }}>Join completely free and start exploring resources and opportunities today.</p>
                        <button className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '14px 32px', fontSize: '16px', fontWeight: '600' }} onClick={() => navigate('/register')}>
                            Create an Account
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Home;
