import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { FaTrash, FaExternalLinkAlt, FaArrowLeft } from 'react-icons/fa';
import '../../styles/jobPortalPages.css';

const JobPortalSaved = () => {
  const { savedJobs, savedJobsLoading, unsaveJob } = useJobs();

  return (
    <div className="jp-saved fade-in-up">
      <Link to="/student/job-portal" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 24 }}>
        <FaArrowLeft /> Back to Job Portal
      </Link>

      <div className="jp-saved-header">
        <h1>Saved <span>Jobs</span></h1>
      </div>

      {savedJobsLoading ? (
        <div className="loading">Loading saved jobs…</div>
      ) : savedJobs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
          <h3>No saved jobs</h3>
          <p>Jobs you save will appear here.</p>
          <Link to="/student/job-portal/all" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Jobs</Link>
        </div>
      ) : (
        <div className="jp-saved-list">
          {savedJobs.map(job => (
            <div key={job.id} className="jp-saved-card">
              <div className="jp-saved-info">
                <h3>{job.title}</h3>
                <p>🏢 {job.company} &nbsp; {job.location && `• 📍 ${job.location}`}</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>{job.description}</p>
              </div>
              <div className="jp-saved-actions">
                <Link to={`/student/job-portal/jobs/${job.id}`} className="btn btn-outline btn-sm" title="View Job">
                  <FaExternalLinkAlt />
                </Link>
                <button className="btn btn-outline btn-sm" onClick={() => unsaveJob(job.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }} title="Remove">
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

export default JobPortalSaved;
