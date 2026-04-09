import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaCheckCircle, FaRegBell, FaTrash } from 'react-icons/fa';
import '../styles/notifications.css';

const AdminNotificationsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Redirect non-admins
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/student/notifications');
        }
    }, [user, navigate]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/notifications');
            if (res.data.success) {
                setNotifications(res.data.data || []);
            } else {
                setNotifications(Array.isArray(res.data) ? res.data : []);
            }
            setError('');
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError('Failed to load notifications');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'unread') {
            return notifications.filter((n) => !n.isRead);
        }
        if (activeFilter === 'read') {
            return notifications.filter((n) => n.isRead);
        }
        return notifications;
    }, [notifications, activeFilter]);

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const readCount = notifications.filter((n) => n.isRead).length;

    const markAllAsRead = async () => {
        try {
            await axios.patch('http://localhost:5000/api/notifications/read-all');
            setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
            setNotifications(
                notifications.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
            setNotifications(notifications.filter((n) => n._id !== notificationId));
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            material_submitted: '📝',
            material_review: '✅',
            material_comment: '💬',
            material_like: '👍',
            kuppi_join: '👥',
            kuppi_comment: '💬',
            application_status: '📋',
            new_application: '📨',
            job_closed: '🔒'
        };
        return icons[type] || '🔔';
    };

    if (loading) {
        return (
            <div className="notifications-page">
                <section className="notifications-hero">
                    <div className="notifications-hero-content">
                        <h1>Loading...</h1>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <section className="notifications-hero">
                <div className="notifications-hero-content">
                    <h1>Notifications</h1>
                    <p>Stay updated with material submissions, reviews, and activities</p>
                </div>
            </section>

            <section className="notifications-main">
                <div className="notifications-container">
                    {/* Stats Cards */}
                    <div className="notifications-stats">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaBell />
                            </div>
                            <div className="stat-content">
                                <p>Total</p>
                                <h3>{notifications.length}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon unread-icon">
                                <FaRegBell />
                            </div>
                            <div className="stat-content">
                                <p>Unread</p>
                                <h3>{unreadCount}</h3>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon read-icon">
                                <FaCheckCircle />
                            </div>
                            <div className="stat-content">
                                <p>Read</p>
                                <h3>{readCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="notifications-filters">
                        <button
                            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            All Notifications
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('unread')}
                        >
                            Unread
                        </button>
                        <button
                            className={`filter-tab ${activeFilter === 'read' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('read')}
                        >
                            Read
                        </button>

                        {unreadCount > 0 && (
                            <button
                                className="mark-all-btn"
                                onClick={markAllAsRead}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="notifications-list">
                        {error && (
                            <div className="notifications-error">
                                <p>{error}</p>
                            </div>
                        )}

                        {filteredNotifications.length === 0 ? (
                            <div className="notifications-empty">
                                <div className="empty-icon">
                                    <FaBell />
                                </div>
                                <h3>No notifications</h3>
                                <p>
                                    {activeFilter === 'unread'
                                        ? "You're all caught up!"
                                        : 'No notifications to display'}
                                </p>
                            </div>
                        ) : (
                            filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    <div className="notification-content-main">
                                        <div className="notification-header">
                                            <h4>{notification.title}</h4>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteNotification(notification._id)}
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                        <p className="notification-message">
                                            {notification.message}
                                        </p>
                                        <div className="notification-footer">
                                            <span className="notification-type">
                                                {notification.type.replace(/_/g, ' ')}
                                            </span>
                                            <span className="notification-time">
                                                {new Date(notification.createdAt).toLocaleDateString([], {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {!notification.isRead && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={() => markAsRead(notification._id)}
                                            title="Mark as read"
                                        >
                                            <div className="unread-dot"></div>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminNotificationsPage;
