import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaChevronDown,
  FaHome,
  FaMapMarkerAlt,
  FaRegClock,
  FaSearch,
} from 'react-icons/fa';
import { useJobs } from '../../context/JobsContext';
import {
  filterJobs,
  getUniqueExperiences,
  getUniqueJobTypes,
  getUniqueWorkModes,
} from '../../data/jobsData';
import '../../styles/jobPortal.css';
import '../../styles/jobPortalPages.css';

const initialFilters = {
  keyword: '',
  location: '',
  jobType: '',
  experience: '',
  workMode: '',
  postedWithin: '',
};

const fallbackJobTypes = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Temporary'];
const fallbackExperiences = ['Fresh Graduate', 'Entry Level', '0 - 1 year', '1 - 2 years', 'Mid Level'];
const fallbackWorkModes = ['On-site', 'Hybrid', 'Remote'];

const getJobId = (job) => job._id || job.id;

const mergeOptions = (backendOptions, fallbackOptions) => [
  ...new Set([...fallbackOptions, ...backendOptions].filter(Boolean)),
];

const formatDateLabel = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getDeadlineLabel = (job) => {
  const deadline = job.deadline || job.applicationDeadline || job.closingDate;
  return formatDateLabel(deadline) || 'Open now';
};

const filterByPostedWithin = (jobs, postedWithin) => {
  if (!postedWithin) return jobs;

  const days = Number(postedWithin);
  if (!days || Number.isNaN(days)) return jobs;

  const now = new Date();
  const threshold = new Date(now);
  threshold.setDate(now.getDate() - days);

  return jobs.filter((job) => {
    const rawDate = job.postedDate || job.createdAt;
    if (!rawDate) return false;

    const postedDate = new Date(rawDate);
    if (Number.isNaN(postedDate.getTime())) return false;

    return postedDate >= threshold;
  });
};

const JobPortalAll = () => {
  const { jobs, jobsLoading, jobsError } = useJobs();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const urlFilters = {
      keyword: searchParams.get('keyword') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
      experience: searchParams.get('experience') || '',
      workMode: searchParams.get('workMode') || '',
      postedWithin: searchParams.get('postedWithin') || '',
    };

    setFilters(urlFilters);
    setDraftFilters(urlFilters);
  }, [searchParams]);

  const filteredJobs = useMemo(() => {
    const filtered = filterJobs(jobs, filters);
    return filterByPostedWithin(filtered, filters.postedWithin);
  }, [jobs, filters]);

  const jobTypes = useMemo(
    () => mergeOptions(getUniqueJobTypes(jobs), fallbackJobTypes),
    [jobs]
  );
  const experiences = useMemo(
    () => mergeOptions(getUniqueExperiences(jobs), fallbackExperiences),
    [jobs]
  );
  const workModes = useMemo(
    () => mergeOptions(getUniqueWorkModes(jobs), fallbackWorkModes),
    [jobs]
  );

  const updateDraftFilter = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applySearch = () => {
    setFilters(draftFilters);
    setVisibleCount(20);

    const params = new URLSearchParams();

    Object.entries(draftFilters).forEach(([key, value]) => {
      const nextValue = String(value || '').trim();
      if (nextValue) params.set(key, nextValue);
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setDraftFilters(initialFilters);
    setVisibleCount(20);
    setSearchParams({});
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applySearch();
    }
  };

  return (
    <div className="all-jobs-page fade-in-up">
      <section className="all-jobs-section">
        <div className="all-jobs-container">
          <div className="all-jobs-top-row">
            <Link to="/student/job-portal" className="back-home-btn">
              <FaHome />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="all-jobs-header-row">
            <h1>Available Jobs</h1>

            <div className="jobs-search-row">
              <div className="jobs-search-input">
                <FaSearch className="jobs-search-icon" />
                <input
                  type="text"
                  placeholder="Title, skill or company"
                  value={draftFilters.keyword}
                  onChange={(event) => updateDraftFilter('keyword', event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <div className="jobs-search-input">
                <FaMapMarkerAlt className="jobs-search-icon" />
                <input
                  type="text"
                  placeholder="Location"
                  value={draftFilters.location}
                  onChange={(event) => updateDraftFilter('location', event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <button className="jobs-search-btn" type="button" onClick={applySearch}>
                Search
              </button>
            </div>
          </div>

          <div className="jobs-filter-row category-style-filters">
            <div className="filter-pill">
              <select
                value={draftFilters.postedWithin}
                onChange={(event) => updateDraftFilter('postedWithin', event.target.value)}
              >
                <option value="">Date Posted</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-pill">
              <select
                value={draftFilters.jobType}
                onChange={(event) => updateDraftFilter('jobType', event.target.value)}
              >
                <option value="">Job Type</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-pill">
              <select
                value={draftFilters.experience}
                onChange={(event) => updateDraftFilter('experience', event.target.value)}
              >
                <option value="">Career Level</option>
                {experiences.map((experience) => (
                  <option key={experience} value={experience}>
                    {experience}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-pill">
              <select
                value={draftFilters.workMode}
                onChange={(event) => updateDraftFilter('workMode', event.target.value)}
              >
                <option value="">Work Mode</option>
                {workModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <button className="reset-filter-btn category-reset-button" type="button" onClick={clearFilters}>
              Reset Filter
            </button>
          </div>

          <div className="jobs-list-topbar">
            <p className="vacancy-count">
              <strong>{filteredJobs.length}</strong> Vacancies Found
            </p>

            <div className="jobs-show-box">
              <span>Show</span>
              <select
                value={visibleCount}
                onChange={(event) => setVisibleCount(Number(event.target.value))}
              >
                <option value={20}>20 Per Page</option>
                <option value={40}>40 Per Page</option>
                <option value={60}>60 Per Page</option>
              </select>
            </div>
          </div>

          {jobsError && <div className="alert alert-error">{jobsError}</div>}

          {jobsLoading ? (
            <div className="loading">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs match your filters</h3>
              <p>Try changing or resetting filters to see more results.</p>
            </div>
          ) : (
            <div className="all-jobs-grid">
              {filteredJobs.slice(0, visibleCount).map((job) => (
                <article key={getJobId(job)} className="recent-job-card">
                  <div className="recent-job-top">
                    <div className="job-deadline">
                      <FaRegClock />
                      <span>{getDeadlineLabel(job)}</span>
                    </div>

                    <span className="job-type-badge">
                      {job.type || job.status || 'Open'}
                    </span>
                  </div>

                  <div className="recent-job-body">
                    <p className="job-company-name">
                      {job.company || job.employerName || 'Company'}
                    </p>
                    <h3 className="job-role-title">{job.title}</h3>

                    {job.location && (
                      <p className="job-location">
                        <FaMapMarkerAlt />
                        <span>{job.location}</span>
                      </p>
                    )}
                  </div>

                  <Link to={`/student/job-portal/jobs/${getJobId(job)}`} className="apply-job-btn">
                    Apply Now
                  </Link>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  );
};

export default JobPortalAll;
