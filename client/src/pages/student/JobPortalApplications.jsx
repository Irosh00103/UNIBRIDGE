import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { FaTrash, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import '../../styles/jobPortalPages.css';

const JobPortalApplications = () => {
  const { applications, applicationsLoading, removeApplication } = useJobs();

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'SELECTED':
      case 'ACCEPTED': return 'var(--success)';
      case 'REJECTED': return 'var(--danger)';
      default: return 'var(--warning)';
    }
  };

  return (
    <div className="jp-apps fade-in-up">
      <Link to="/student/job-portal" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 24 }}>
        <FaArrowLeft /> Back to Job Portal
      </Link>

      <div className="jp-apps-header">
        <h1>My <span>Applications</span></h1>
      </div>

      {applicationsLoading ? (
        <div className="loading">Loading applications…</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
          <h3>No applications yet</h3>
          <p>Jobs you apply to will appear here.</p>
          <Link to="/student/job-portal/all" className="btn btn-primary" style={{ marginTop: 16 }}>Find Jobs</Link>
        </div>
      ) : (
        <div className="jp-apps-list">
          {applications.map(app => (
            <div key={app.id} className="jp-app-card">
              <div className="jp-app-info">
                <h3>{app.appliedJob}</h3>
                <p>🏢 {app.company}</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="jp-ref">Ref: {app.refNo}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Applied: {new Date(app.dateOfApply).toLocaleDateString()}</span>
                  <span style={{ 
                    fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                    background: `${getStatusColor(app.status)}15`, color: getStatusColor(app.status)
                  }}>
                    {app.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              <div className="jp-safe-actions" style={{ display: 'flex', gap: 10 }}>
                {app.jobId && (
                  <Link to={`/student/job-portal/jobs/${app.jobId}`} className="btn btn-outline btn-sm" title="View Job">
                    <FaExternalLinkAlt />
                  </Link>
                )}
                <button className="btn btn-outline btn-sm" onClick={() => {
                  if (window.confirm('Are you sure you want to withdraw this application?')) {
                    removeApplication(app.id);
                  }
                }} style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }} title="Withdraw">
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPortalApplications;
