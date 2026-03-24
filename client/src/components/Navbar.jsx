import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Handle scroll effect for navbar background
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const res = await axios.get('http://localhost:5000/api/notifications');
                setNotifications(res.data.data || []);
                setUnreadCount(res.data.unreadCount || 0);
            } catch (err) {
                setNotifications([]);
                setUnreadCount(0);
            }
        };
        fetchNotifications();
    }, [user, location.pathname]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const openNotifications = async () => {
        setShowNotifications((prev) => !prev);
        if (unreadCount > 0) {
            try {
                await axios.patch('http://localhost:5000/api/notifications/read-all');
                setUnreadCount(0);
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            } catch (err) {
                // no-op
            }
        }
    };

    return (
        <nav className={`navbar-marvel ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <Link
                    to={user ? (user.role === 'student' ? '/student/home' : '/admin/dashboard') : '/'}
                    className="navbar-logo"
                >
                    <span className="logo-icon">🎓</span>
                    <span className="logo-text">UniBridge</span>
                </Link>

                <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
                    {!user ? (
                        <>
                            <Link to="/" className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}>
                                Home
                            </Link>
                            <Link to="/about" className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}>
                                About
                            </Link>
                            <Link to="/contact" className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`}>
                                Contact
                            </Link>
                            <div className="navbar-divider"></div>
                            <Link to="/login" className="navbar-link">Log in</Link>
                            <Link to="/register" className="navbar-btn">Sign up</Link>
                        </>
                    ) : (
                        <>
                            {user.role === 'student' ? (
                                <>
                                    <Link to="/" className="navbar-link">Home</Link>
                                    <Link to="/student/materials" className="navbar-link">Materials</Link>
                                    <Link to="/student/materials/upload" className="navbar-link">Upload</Link>
                                    <Link to="/student/jobs" className="navbar-link">Job Market</Link>
                                    <Link to="/student/kuppi" className="navbar-link">Kuppi</Link>
                                    <div className="navbar-notification" onClick={openNotifications} role="button" tabIndex={0}>
                                        🔔
                                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                        {showNotifications && (
                                            <div className="notification-panel">
                                                {notifications.length === 0 ? (
                                                    <div className="notification-item muted">No notifications yet.</div>
                                                ) : (
                                                    notifications.slice(0, 8).map((n) => (
                                                        <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
                                                            <strong>{n.title}</strong>
                                                            <div>{n.message}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="navbar-link">Home</Link>
                                    <Link to="/employer/jobs/create" className="navbar-link">Post Job</Link>
                                </>
                            )}
                            <button
                                onClick={() => navigate(user?.role === 'student' ? '/student/home' : '/admin/dashboard')}
                                className="profile-btn"
                                title="Go to Dashboard"
                            >
                                <div className="profile-avatar">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
                            </button>
                            <button onClick={logout} className="btn btn-outline" style={{marginLeft: '12px'}}>Logout</button>
                        </>
                    )}
                </div>

                <div className="navbar-mobile-toggle" onClick={toggleMobileMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;