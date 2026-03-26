import '../../styles/alertsPage.css';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaTrashAlt, FaCheckCircle, FaRegBell, FaEnvelopeOpenText, FaArrowLeft, FaTimes } from 'react-icons/fa';
import {
  getAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  deleteAlertApi,
  deleteSelectedAlertsApi,
} from '../../services/jobPortalApi';

function JobPortalAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const response = await getAlerts();
        setAlerts(response.data?.data || []);
        setError('');
      } catch (err) {
        setError('Failed to load alerts.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'unread') return alerts.filter((alert) => !alert.isRead);
    if (activeFilter === 'read') return alerts.filter((alert) => alert.isRead);
    return alerts;
  }, [alerts, activeFilter]);

  const allVisibleSelected = filteredAlerts.length > 0 && filteredAlerts.every((alert) => selectedIds.includes(alert._id));
  const unreadCount = alerts.filter((alert) => !alert.isRead).length;
  const readCount = alerts.filter((alert) => alert.isRead).length;

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredAlerts.some((alert) => alert._id === id)));
    } else {
      const visibleIds = filteredAlerts.map((alert) => alert._id);
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleOpenAlert = async (alert) => {
    setSelectedAlert(alert);
    if (!alert.isRead) {
      try {
        await markAlertAsRead(alert._id);
        setAlerts((prev) => prev.map((item) => (item._id === alert._id ? { ...item, isRead: true } : item)));
        setSelectedAlert((prev) => (prev ? { ...prev, isRead: true } : prev));
      } catch (_) {}
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    try {
      await deleteSelectedAlertsApi(selectedIds);
      setAlerts((prev) => prev.filter((alert) => !selectedIds.includes(alert._id)));
      setSelectedIds([]);
    } catch (_) {}
  };

  const handleDeleteSingle = async (id) => {
    try {
      await deleteAlertApi(id);
      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (selectedAlert?._id === id) setSelectedAlert(null);
    } catch (_) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAlertsAsRead();
      setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
      setSelectedAlert((prev) => (prev ? { ...prev, isRead: true } : prev));
    } catch (_) {}
  };

  const emptyTitle = alerts.length === 0 ? 'No alerts yet' : activeFilter === 'read' ? 'No read alerts' : activeFilter === 'unread' ? 'No unread alerts' : 'No alerts found';
  const emptyMessage = alerts.length === 0
    ? 'Employer messages, application updates, and interview requests will appear here once alerts are created in the backend.'
    : `There are no ${activeFilter} alerts to display right now.`;

  if (isLoading) return <div className="alerts-page"><section className="alerts-main-section"><div className="alerts-main-container"><div className="alerts-empty-state"><div className="alerts-empty-icon"><FaBell /></div><h3>Loading alerts...</h3></div></div></section></div>;
  if (error) return <div className="alerts-page"><section className="alerts-main-section"><div className="alerts-main-container"><div className="alerts-empty-state"><div className="alerts-empty-icon"><FaBell /></div><h3>{error}</h3></div></div></section></div>;

  return (
    <div className="alerts-page">
      <section className="alerts-hero">
        <div className="alerts-hero-content">
          <Link to="/student/job-portal" className="alerts-back-link">
            <span className="alerts-back-icon-wrap"><FaArrowLeft className="alerts-back-icon" /></span>
            <span>Back</span>
          </Link>
          <h1>Alerts &amp; Messages</h1>
          <p>Get employer messages, application updates, and interview requests in one place.</p>
        </div>
      </section>
      <section className="alerts-main-section">
        <div className="alerts-main-container">
          <div className="alerts-stats-grid">
            <div className="alerts-stat-card"><div className="alerts-stat-icon"><FaBell /></div><div><p>Total Alerts</p><h3>{alerts.length}</h3></div></div>
            <div className="alerts-stat-card"><div className="alerts-stat-icon alt"><FaRegBell /></div><div><p>Unread</p><h3>{unreadCount}</h3></div></div>
            <div className="alerts-stat-card"><div className="alerts-stat-icon third"><FaCheckCircle /></div><div><p>Read</p><h3>{readCount}</h3></div></div>
          </div>
          <div className="alerts-panel">
            <div className="alerts-panel-top">
              <div className="alerts-panel-heading"><h2>Inbox</h2><p>Manage your employer alerts and application-related messages.</p></div>
              <div className="alerts-panel-actions">
                <button type="button" className="alerts-secondary-btn" onClick={handleMarkAllAsRead} disabled={alerts.length === 0}><FaEnvelopeOpenText /><span>Mark All as Read</span></button>
                <button type="button" className="alerts-danger-btn" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}><FaTrashAlt /><span>Delete Selected</span></button>
              </div>
            </div>
            <div className="alerts-filter-row">
              <div className="alerts-filter-tabs">
                <button type="button" className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>All</button>
                <button type="button" className={activeFilter === 'unread' ? 'active' : ''} onClick={() => setActiveFilter('unread')}>Unread</button>
                <button type="button" className={activeFilter === 'read' ? 'active' : ''} onClick={() => setActiveFilter('read')}>Read</button>
              </div>
              <label className="alerts-select-all">
                <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAllVisible} disabled={filteredAlerts.length === 0} />
                <span>Select all visible</span>
              </label>
            </div>
            {filteredAlerts.length === 0 ? (
              <div className="alerts-empty-state"><div className="alerts-empty-icon"><FaBell /></div><h3>{emptyTitle}</h3><p>{emptyMessage}</p></div>
            ) : (
              <div className="alerts-list">
                {filteredAlerts.map((alert) => (
                  <article key={alert._id} className={`alert-row ${alert.isRead ? 'read' : 'unread'}`}>
                    <div className="alert-row-left">
                      <label className="alert-checkbox"><input type="checkbox" checked={selectedIds.includes(alert._id)} onChange={() => handleSelectOne(alert._id)} /></label>
                      <div className="alert-status-dot"></div>
                      <div className="alert-content" onClick={() => handleOpenAlert(alert)} style={{ cursor: 'pointer' }}>
                        <div className="alert-content-top"><h3>{alert.title}</h3><span className="alert-time">{alert.time || new Date(alert.createdAt).toLocaleString()}</span></div>
                        <p className="alert-company">{alert.company}</p>
                        <p className="alert-message">{alert.message}</p>
                      </div>
                    </div>
                    <div className="alert-row-actions"><button type="button" className="alert-delete-btn" onClick={() => handleDeleteSingle(alert._id)}><FaTrashAlt /></button></div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {selectedAlert && (
        <div className="application-modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="application-modal" onClick={(e) => e.stopPropagation()}>
            <div className="application-modal-header">
              <div><h2>{selectedAlert.title}</h2><p>{selectedAlert.company}</p></div>
              <button className="modal-close-btn" onClick={() => setSelectedAlert(null)} type="button"><FaTimes /></button>
            </div>
            <div className="application-form">
              <div className="question-card"><label className="question-title">Time</label><p>{selectedAlert.time || new Date(selectedAlert.createdAt).toLocaleString()}</p></div>
              <div className="question-card"><label className="question-title">Message</label><p>{selectedAlert.message}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobPortalAlerts;
