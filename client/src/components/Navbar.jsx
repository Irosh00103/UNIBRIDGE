import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaChevronDown, FaUserCircle, FaCog, FaSignOutAlt, FaBriefcase, FaHome } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dismissedNotificationIds, setDismissedNotificationIds] = useState([]);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const getDismissedStorageKey = () => `ub_dropdown_notifications_cleared_${user?.id || user?._id || 'guest'}`;

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
        if (!user) {
            setDismissedNotificationIds([]);
            return;
        }

        try {
            const saved = localStorage.getItem(getDismissedStorageKey());
            const parsed = saved ? JSON.parse(saved) : [];
            setDismissedNotificationIds(Array.isArray(parsed) ? parsed : []);
        } catch (err) {
            setDismissedNotificationIds([]);
        }
    }, [user?.id, user?._id]);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                // Primary endpoint for the unified system
                const res = await axios.get('http://localhost:5000/api/notifications');
                if (res.data.success) {
                    setNotifications(res.data.data || []);
                } else {
                    // Fallback or handle legacy array format if exists
                    const list = Array.isArray(res.data) ? res.data : [];
                    setNotifications(list);
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
                // Attempt legacy endpoint if primary fails
                try {
                    const resLegacy = await axios.get('http://localhost:5000/api/uni/notifications');
                    const list = Array.isArray(resLegacy.data) ? resLegacy.data : [];
                    setNotifications(list);
                } catch (legacyErr) {
                    setNotifications([]);
                }
            }
        };
        
        fetchNotifications();
        // Refresh notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user, location.pathname]);

    const dropdownNotifications = notifications.filter((n) => !dismissedNotificationIds.includes(n._id));

    useEffect(() => {
        setUnreadCount(dropdownNotifications.filter((n) => !n.isRead).length);
    }, [notifications, dismissedNotificationIds]);

    // Close notifications panel and profile dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = async (e) => {
        if (e) e.stopPropagation();
        if (unreadCount === 0) return;
        
        try {
            await axios.patch('http://localhost:5000/api/notifications/read-all');
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            // Fallback for legacy PUT endpoint
            try {
                await axios.put('http://localhost:5000/api/uni/notifications/read-all');
                setUnreadCount(0);
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            } catch (innerErr) {
                console.error("Failed to mark all as read:", innerErr);
            }
        }
    };

    const clearDropdownNotifications = (e) => {
        if (e) e.stopPropagation();
        const idsToDismiss = dropdownNotifications.map((n) => n._id);
        const merged = Array.from(new Set([...dismissedNotificationIds, ...idsToDismiss]));
        setDismissedNotificationIds(merged);
        try {
            localStorage.setItem(getDismissedStorageKey(), JSON.stringify(merged));
        } catch (err) {
            // Ignore localStorage errors in private/restricted contexts
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleViewAllNotifications = () => {
        setShowNotifications(false);
        if (user?.role === 'admin') {
            navigate('/admin/notifications');
        } else if (user?.role === 'employer') {
            navigate('/employer/notifications');
        } else {
            navigate('/student/notifications');
        }
    };

    const handleProfileButtonClick = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    return (
        <nav className={`navbar-marvel ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                <Link
                    to={user ? (user.role === 'student' ? '/student/home' : user.role === 'employer' ? '/employer/dashboard' : '/admin/dashboard') : '/'}
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
                                    <Link to="/student/materials" className="navbar-link">Lecture Hub</Link>
                                    <Link to="/student/job-portal" className="navbar-link">Job Portal</Link>
                                    <Link to="/student/job-portal/saved" className="navbar-link">Saved Jobs</Link>
                                    <Link to="/student/job-portal/applications" className="navbar-link">Applications</Link>


                                    <Link to="/student/kuppi" className="navbar-link">Kuppi</Link>
                                    <div className="navbar-notification" onClick={toggleNotifications} role="button" tabIndex={0} title="Notifications" ref={notificationRef}>
                                        <span className="notification-bell-icon">🔔</span>
                                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                        {showNotifications && (
                                            <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
                                                <div className="notification-header">
                                                    <h3>Notifications</h3>
                                                    {dropdownNotifications.length > 0 && (
                                                        <button className="mark-all-read" onClick={clearDropdownNotifications}>
                                                            Clear dropdown
                                                        </button>
                                                    )}
                                                    {unreadCount > 0 && (
                                                        <button className="mark-all-read" onClick={markAllAsRead}>
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="notification-list">
                                                    {dropdownNotifications.length === 0 ? (
                                                        <div className="notification-item muted">No notifications yet.</div>
                                                    ) : (
                                                        dropdownNotifications.slice(0, 10).map((n) => (
                                                            <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
                                                                <div className="notification-content">
                                                                    <strong>{n.title}</strong>
                                                                    <div className="notification-msg">{n.message}</div>
                                                                    <div className="notification-time">
                                                                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="notification-footer">
                                                    <button className="notification-view-btn" onClick={handleViewAllNotifications}>
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : user.role === 'employer' ? (
                                <>
                                    <Link to="/" className="navbar-link">Home</Link>
                                    <Link to="/employer/dashboard" className="navbar-link">Dashboard</Link>
                                    <Link to="/employer/jobs/create" className="navbar-link">Post Job</Link>
                                    <div className="navbar-notification" onClick={toggleNotifications} role="button" tabIndex={0} title="Notifications" ref={notificationRef}>
                                        <span className="notification-bell-icon">🔔</span>
                                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                        {showNotifications && (
                                            <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
                                                <div className="notification-header">
                                                    <h3>Notifications</h3>
                                                    {dropdownNotifications.length > 0 && (
                                                        <button className="mark-all-read" onClick={clearDropdownNotifications}>
                                                            Clear dropdown
                                                        </button>
                                                    )}
                                                    {unreadCount > 0 && (
                                                        <button className="mark-all-read" onClick={markAllAsRead}>
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="notification-list">
                                                    {dropdownNotifications.length === 0 ? (
                                                        <div className="notification-item muted">No notifications yet.</div>
                                                    ) : (
                                                        dropdownNotifications.slice(0, 10).map((n) => (
                                                            <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
                                                                <div className="notification-content">
                                                                    <strong>{n.title}</strong>
                                                                    <div className="notification-msg">{n.message}</div>
                                                                    <div className="notification-time">
                                                                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="notification-footer">
                                                    <button className="notification-view-btn" onClick={handleViewAllNotifications}>
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="navbar-link">Home</Link>
                                    <Link to="/admin/dashboard" className="navbar-link">Dashboard</Link>
                                    <Link to="/admin/lecture-hub" className="navbar-link">Lecture Hub</Link>
                                    <div className="navbar-notification" onClick={toggleNotifications} role="button" tabIndex={0} title="Notifications" ref={notificationRef}>
                                        <span className="notification-bell-icon">🔔</span>
                                        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                                        {showNotifications && (
                                            <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
                                                <div className="notification-header">
                                                    <h3>Notifications</h3>
                                                    {dropdownNotifications.length > 0 && (
                                                        <button className="mark-all-read" onClick={clearDropdownNotifications}>
                                                            Clear dropdown
                                                        </button>
                                                    )}
                                                    {unreadCount > 0 && (
                                                        <button className="mark-all-read" onClick={markAllAsRead}>
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="notification-list">
                                                    {dropdownNotifications.length === 0 ? (
                                                        <div className="notification-item muted">No notifications yet.</div>
                                                    ) : (
                                                        dropdownNotifications.slice(0, 10).map((n) => (
                                                            <div key={n._id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
                                                                <div className="notification-content">
                                                                    <strong>{n.title}</strong>
                                                                    <div className="notification-msg">{n.message}</div>
                                                                    <div className="notification-time">
                                                                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <div className="notification-footer">
                                                    <button className="notification-view-btn" onClick={handleViewAllNotifications}>
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            {/* Profile Dropdown */}
                            <div className="profile-dropdown-container" ref={profileRef}>
                                <button
                                    onClick={handleProfileButtonClick}
                                    className="profile-btn"
                                    title="Profile Menu"
                                >
                                    <div className="profile-avatar">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="profile-name-nav">{user?.name?.split(' ')[0]}</span>
                                    <FaChevronDown style={{ fontSize: '10px', opacity: 0.5 }} />
                                </button>

                                {showProfileDropdown && (
                                    <div className="profile-dropdown-menu">
                                        {user?.role === 'student' && (
                                            <button className="profile-dropdown-item" onClick={() => { navigate('/student/home'); setShowProfileDropdown(false); }}>
                                                <FaHome /> UserDashboard
                                            </button>
                                        )}
                                        {user?.role === 'student' && (
                                            <button className="profile-dropdown-item" onClick={() => { navigate('/student/profile/professional'); setShowProfileDropdown(false); }}>
                                                <FaBriefcase /> Professional Profile
                                            </button>
                                        )}
                                        <button className="profile-dropdown-item" onClick={() => { navigate('/profile'); setShowProfileDropdown(false); }}>
                                            <FaUserCircle /> Account Settings
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="profile-dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => { logout(); setShowProfileDropdown(false); }}>
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
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