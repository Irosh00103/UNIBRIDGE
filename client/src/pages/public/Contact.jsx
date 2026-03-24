import React, { useState } from 'react';
import Footer from '../../components/Footer';

const Contact = () => {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    };

    return (
        <>
            <div className="container page" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>Get in Touch</h1>
                        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Have questions or feedback? We'd love to hear from you.</p>
                    </div>

                    <div className="card glass-card" style={{ padding: '40px' }}>
                        {status && <div className="alert alert-success" style={{ marginBottom: '24px' }}>{status}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>First Name</label>
                                    <input type="text" required placeholder="John" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Last Name</label>
                                    <input type="text" required placeholder="Doe" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" required placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea required placeholder="How can we help you today?" style={{ minHeight: '150px' }}></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>Send Message</button>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Contact;
