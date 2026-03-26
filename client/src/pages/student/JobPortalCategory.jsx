import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { portalCategories, mapJobToPortalCategory, getPortalCategoryBySlug } from '../../data/jobsData';
import { FaBookmark, FaRegBookmark, FaArrowLeft } from 'react-icons/fa';
import '../../styles/jobPortal.css';

const JobPortalCategory = () => {
  const { slug } = useParams();
  const { jobs, jobsLoading, isJobSaved, saveJob, unsaveJob } = useJobs();

  const category = getPortalCategoryBySlug(slug);
  const categoryJobs = useMemo(
    () => jobs.filter(j => mapJobToPortalCategory(j) === slug),
    [jobs, slug]
  );

  const toggleSave = (job) => {
    if (isJobSaved(job.id)) unsaveJob(job.id);
    else saveJob(job);
  };

  return (
    <div className="jp-home fade-in-up">
      <Link to="/student/job-portal" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 14, fontWeight: 500, textDecoration: 'none', marginBottom: 24 }}>
        <FaArrowLeft /> Back to Job Portal
      </Link>

      <div className="jp-section-header">
        <h2>{category?.name || slug} <span>({categoryJobs.length})</span></h2>
      </div>

      {jobsLoading ? (
        <div className="loading">Loading jobs…</div>
      ) : categoryJobs.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48, marginBottom: 16 }}>📂</div><h3>No jobs in this category</h3><p>Check back later for new opportunities.</p></div>
      ) : (
        <div className="jp-featured-grid">
          {categoryJobs.map(job => (
            <div key={job.id} className="jp-job-card">
              <div className="jp-card-top">
                <span className="jp-card-badge">{job.type || job.status}</span>
                <button className={`jp-save-btn ${isJobSaved(job.id) ? 'saved' : ''}`} onClick={() => toggleSave(job)}>
                  {isJobSaved(job.id) ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
              <div className="jp-card-title">{job.title}</div>
              <div className="jp-card-company">🏢 {job.company || job.employerName}</div>
              <div className="jp-card-meta">
                {job.location && <span className="jp-meta-tag">📍 {job.location}</span>}
                {job.workMode && <span className="jp-meta-tag">🏠 {job.workMode}</span>}
              </div>
              <div className="jp-card-desc">{job.sideSummary || job.overview || job.description}</div>
              <div className="jp-card-actions">
                <Link to={`/student/job-portal/jobs/${job.id}`} className="jp-view-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPortalCategory;
