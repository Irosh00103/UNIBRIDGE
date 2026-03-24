import React from 'react';
import Footer from '../../components/Footer';

const About = () => {
    return (
        <>
            <div style={{ background: 'var(--bg)', padding: '80px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', color: 'var(--text)' }}>About <span style={{ color: 'var(--primary)' }}>UniBridge</span></h1>
                    <p style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                        We believe that a student's potential goes beyond the classroom. UniBridge was created to provide a centralized hub for learning, sharing, and propelling careers forward.
                    </p>
                </div>
            </div>

            <div className="container" style={{ padding: '80px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '60px', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px' }}>Our Mission</h2>
                        <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '16px' }}>
                            Our mission is to democratize education resources and connect emerging talent directly with forward-thinking employers. Whether you are looking for the latest lecture note, or looking for your next rockstar intern, UniBridge sets the stage for success.
                        </p>
                        <ul style={{ listStylePosition: 'inside', color: 'var(--text)', fontSize: '16px', lineHeight: '2' }}>
                            <li>✅ Centralized academic resources</li>
                            <li>✅ Direct employer-to-student pipelines</li>
                            <li>✅ Collaborative peer study environments</li>
                        </ul>
                    </div>
                    <div className="card" style={{ background: 'var(--primary-light)', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                        <div style={{ fontSize: '100px' }}>🤝</div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default About;
