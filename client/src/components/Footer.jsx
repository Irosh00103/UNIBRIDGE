
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Poppins, sans-serif', color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '28px' }}>🎓</span> UniBridge
                        </div>
                        <p style={{ lineHeight: '1.6', fontSize: '14px', maxWidth: '300px' }}>
                            Your ultimate university hub. Connect, share materials, find jobs, and collaborate with your peers effortlessly.
                        </p>
                        <div className="social-icons">
                            <span style={{ fontSize: '20px', cursor: 'pointer' }}>📘</span>
                            <span style={{ fontSize: '20px', cursor: 'pointer' }}>🐦</span>
                            <span style={{ fontSize: '20px', cursor: 'pointer' }}>📸</span>
                        </div>
                    </div>
                    <div>
                        <div className="footer-heading">Quick Links</div>
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/about" className="footer-link">About Us</Link>
                        <Link to="/contact" className="footer-link">Contact</Link>
                    </div>
                    <div>
                        <div className="footer-heading">Get Started</div>
                        <Link to="/login" className="footer-link">Log in</Link>
                        <Link to="/register" className="footer-link">Sign up</Link>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '24px 0', marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                    &copy; {new Date().getFullYear()} UniBridge. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
