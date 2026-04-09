import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { portalCategories, mapJobToPortalCategory } from '../../data/jobsData';
import {
  FaProjectDiagram, FaChartBar, FaMicrochip, FaBriefcase,
  FaHardHat, FaBullhorn, FaSearch, FaCogs, FaHeadset,
  FaCoins, FaGraduationCap, FaUsers, FaBookmark, FaRegBookmark,
} from 'react-icons/fa';
import '../../styles/jobPortal.css';

const iconMap = {
  other: FaProjectDiagram, sales: FaChartBar, software: FaMicrochip,
  finance: FaBriefcase, engineering: FaHardHat, marketing: FaBullhorn,
  admin: FaSearch, production: FaCogs, customer: FaHeadset,
  banking: FaCoins, education: FaGraduationCap, hr: FaUsers,
};

const CompanyMarquee = () => {
    const companies = [
        { name: 'Dialog Axiata', icon: '📶' },
        { name: 'SLT-MOBITEL', icon: '📞' },
        { name: 'WSO2', icon: '⚡' },
        { name: 'IFS', icon: '🏢' },
        { name: 'Virtusa', icon: '🌐' },
        { name: 'HNB', icon: '🏦' },
        { name: 'DFCC Bank', icon: '💰' },
        { name: 'Sysco LABS', icon: '🍔' },
        { name: 'PickMe', icon: '🚕' },
        { name: '99x', icon: '🚀' },
        { name: 'Pearson', icon: '📚' },
        { name: 'Brandix', icon: '👕' }
    ];

    // Duplicate list for seamless loop
    const combined = [...companies, ...companies];

    return (
        <div className="jp-marquee-wrapper">
            <div className="jp-marquee-content">
                {combined.map((c, idx) => (
                    <div key={idx} className="jp-marquee-item">
                        <span className="marquee-logo">{c.icon}</span>
                        <span>{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const JobPortal = () => {
  const { jobs, jobsLoading, jobsError, isJobSaved, saveJob, unsaveJob } = useJobs();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const featuredJobs = useMemo(() => {
    let filtered = jobs;
    if (keyword) {
      const k = keyword.toLowerCase();
      filtered = filtered.filter(j =>
        [j.title, j.company, j.category, ...(j.skills || [])].join(' ').toLowerCase().includes(k)
      );
    }
    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      filtered = filtered.filter(j => (j.location || '').toLowerCase().includes(l));
    }
    return filtered.slice(0, 6);
  }, [jobs, keyword, locationFilter]);

  const categories = useMemo(() => {
    const withCounts = portalCategories.map(cat => ({
      ...cat,
      count: jobs.filter(j => mapJobToPortalCategory(j) === cat.slug).length,
    }));
    const withJobs = withCounts.filter(c => c.count > 0).sort((a, b) => b.count - a.count || a.order - b.order);
    const noJobs = withCounts.filter(c => c.count === 0).sort((a, b) => a.order - b.order);
    return [...withJobs, ...noJobs];
  }, [jobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/student/job-portal/all?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(locationFilter)}`);
  };

  const toggleSave = async (job) => {
    if (isJobSaved(job.id)) {
      await unsaveJob(job.id);
      return;
    }
    await saveJob(job);
  };

  return (
    <div className="jp-home fade-in-up">
      {/* Hero */}
      <section className="jp-hero">
        <CompanyMarquee />
        <h1>Find Your <span>Dream Job</span></h1>
        <p>Discover internships, graduate roles, and career opportunities curated for university students.</p>
        <form className="jp-search-bar" onSubmit={handleSearch}>
          <input placeholder="Job title, skill, or keyword…" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <input placeholder="Location…" value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
          <button type="submit" className="jp-search-btn">Search Jobs</button>
        </form>
      </section>

      {/* Stats */}
      <div className="jp-stats">
        <div className="jp-stat-item"><div className="jp-stat-value">{jobs.length}</div><div className="jp-stat-label">Available Jobs</div></div>
        <div className="jp-stat-item"><div className="jp-stat-value">{new Set(jobs.map(j => j.company)).size}</div><div className="jp-stat-label">Companies</div></div>
        <div className="jp-stat-item"><div className="jp-stat-value">{categories.filter(c => c.count > 0).length}</div><div className="jp-stat-label">Categories</div></div>
      </div>

      {/* Featured Jobs */}
      <div className="jp-section-header">
        <h2>Featured <span>Opportunities</span></h2>
        <Link to="/student/job-portal/all">View all jobs →</Link>
      </div>

      {jobsError && <div className="alert alert-error">{jobsError}</div>}

      {jobsLoading ? (
        <div className="loading">Loading opportunities…</div>
      ) : featuredJobs.length === 0 ? (
        <div className="empty-state"><div style={{ fontSize: 48, marginBottom: 16 }}>💼</div><h3>No jobs found</h3><p>Try different keywords or check back later.</p></div>
      ) : (
        <div className="jp-featured-grid">
          {featuredJobs.map(job => (
            <div key={job.id} className="jp-job-card">
              <div className="jp-card-top">
                <span className="jp-card-badge">{job.type || job.status}</span>
                <button className={`jp-save-btn ${isJobSaved(job.id) ? 'saved' : ''}`} onClick={() => toggleSave(job)} title={isJobSaved(job.id) ? 'Unsave' : 'Save'}>
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

      {/* Categories */}
      <section className="jp-categories-section">
        <div className="jp-section-header">
          <h2>Browse by <span>Category</span></h2>
        </div>
        <div className="jp-category-grid">
          {categories.map(cat => {
            const Icon = iconMap[cat.accent] || FaProjectDiagram;
            return (
              <Link key={cat.slug} to={`/student/job-portal/categories/${cat.slug}`} className="jp-category-card">
                <div className="jp-category-icon-wrap">
                  <Icon className="jp-category-icon" />
                </div>
                <div className="jp-category-content">
                  <div className="jp-category-title">{cat.name}</div>
                  <div className="jp-category-count">{cat.count} Job{cat.count !== 1 ? 's' : ''} Available</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default JobPortal;
