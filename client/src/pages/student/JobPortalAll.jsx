import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { filterJobs, getUniqueJobTypes, getUniqueExperiences, getUniqueWorkModes } from '../../data/jobsData';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import '../../styles/jobPortal.css';
import '../../styles/jobPortalPages.css';

const JobPortalAll = () => {
  const { jobs, jobsLoading, jobsError, isJobSaved, saveJob, unsaveJob } = useJobs();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    jobType: '',
    experience: '',
    workMode: '',
  });

  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);
  const jobTypes = useMemo(() => getUniqueJobTypes(jobs), [jobs]);
  const experiences = useMemo(() => getUniqueExperiences(jobs), [jobs]);
  const workModes = useMemo(() => getUniqueWorkModes(jobs), [jobs]);

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ keyword: '', location: '', jobType: '', experience: '', workMode: '' });

  const toggleSave = (job) => {
    if (isJobSaved(job.id)) unsaveJob(job.id);
    else saveJob(job);
  };

  return (
    <div className="jp-all fade-in-up">
      <div className="jp-all-header">
        <h1>All <span>Jobs</span></h1>
        <p>Browse and filter through all available opportunities.</p>
      </div>

      {/* Filters */}
      <div className="jp-filters">
        <input className="jp-filter-input" placeholder="Keyword…" value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} />
        <input className="jp-filter-input" placeholder="Location…" value={filters.location} onChange={e => updateFilter('location', e.target.value)} />
        <select className="jp-filter-select" value={filters.jobType} onChange={e => updateFilter('jobType', e.target.value)}>
          <option value="">All Types</option>
          {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="jp-filter-select" value={filters.experience} onChange={e => updateFilter('experience', e.target.value)}>
          <option value="">All Experience</option>
          {experiences.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select className="jp-filter-select" value={filters.workMode} onChange={e => updateFilter('workMode', e.target.value)}>
          <option value="">All Work Modes</option>
          {workModes.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <button className="jp-filter-clear" onClick={clearFilters}>Clear All</button>
      </div>

      <div className="jp-results-count">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</div>

      {jobsError && <div className="alert alert-error">{jobsError}</div>}

      {jobsLoading ? (
        <div className="loading">Loading jobs…</div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div><h3>No jobs match your filters</h3><p>Try broadening your search criteria.</p></div>
      ) : (
        <div className="jp-featured-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="jp-job-card">
              <div className="jp-card-top">
                <span className={`jp-card-badge ${String(job.type || job.status || '').toLowerCase() === 'open' ? 'open' : ''}`}>
                  {job.type || job.status}
                </span>
                <button className={`jp-save-btn ${isJobSaved(job.id) ? 'saved' : ''}`} onClick={() => toggleSave(job)}>
                  {isJobSaved(job.id) ? <FaBookmark /> : <FaRegBookmark />}
                </button>
              </div>
              <div className="jp-card-title">{job.title}</div>
              <div className="jp-card-company">🏢 {job.company || job.employerName}</div>
              <div className="jp-card-meta">
                {job.location && <span className="jp-meta-tag">📍 {job.location}</span>}
                {job.workMode && <span className="jp-meta-tag">🏠 {job.workMode}</span>}
                {job.experience && <span className="jp-meta-tag">📊 {job.experience}</span>}
              </div>
              <div className="jp-card-desc">{job.sideSummary || job.overview || job.description}</div>
              {job.skills?.length > 0 && (
                <div className="jp-card-skills">
                  {job.skills.slice(0, 4).map(s => <span key={s} className="jp-skill-tag">{s}</span>)}
                </div>
              )}
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

export default JobPortalAll;
