import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaChevronDown,
  FaRegClock,
  FaHome,
} from "react-icons/fa";
import { getJobs } from "../../services/api";
import {
  getPortalCategoryBySlug,
  mapJobToPortalCategory,
  filterJobs,
} from "../../data/jobsData";
import "./JobCategoryPage.css";

const initialFilters = {
  keyword: "",
  location: "",
  jobType: "",
  experience: "",
  workMode: "",
  postedWithin: "",
};

function JobPortalCategory() {
  const { slug } = useParams();
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = useMemo(() => getPortalCategoryBySlug(slug), [slug]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        const fetchedJobs = response.data || [];
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const categoryJobs = useMemo(() => {
    return jobs.filter((job) => mapJobToPortalCategory(job) === slug);
  }, [jobs, slug]);

  const filteredJobs = useMemo(() => {
    return filterJobs(categoryJobs, filters);
  }, [categoryJobs, filters]);

  const uniqueJobTypes = useMemo(() => {
    return [...new Set(jobs.map((job) => job.type).filter(Boolean))];
  }, [jobs]);

  const uniqueExperiences = useMemo(() => {
    return [...new Set(jobs.map((job) => job.experience).filter(Boolean))];
  }, [jobs]);

  const uniqueWorkModes = useMemo(() => {
    return [...new Set(jobs.map((job) => job.workMode).filter(Boolean))];
  }, [jobs]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  if (isLoading) {
    return (
      <div className="category-page">
        <div className="category-page-container">
          <div className="category-empty-state">
            <h2>Loading jobs...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-page">
        <div className="category-page-container">
          <div className="category-empty-state">
            <h2>Category not found</h2>
            <p>The category you selected does not exist.</p>
            <Link to="/" className="category-back-home-btn">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <section className="category-page-header">
        <div className="category-page-container">
          <div className="category-page-topbar">
            <Link to="/" className="category-home-link">
              <FaHome />
              <span>Back to Home</span>
            </Link>
          </div>

          <h1>Available Jobs</h1>

          <div className="category-search-row">
            <div className="category-search-box">
              <FaSearch className="category-search-icon" />
              <input
                type="text"
                placeholder="Title, skill or company"
                value={filters.keyword}
                onChange={(e) => handleChange("keyword", e.target.value)}
              />
            </div>

            <div className="category-search-box">
              <FaMapMarkerAlt className="category-search-icon" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>

            <button className="category-search-button" type="button">
              Search
            </button>
          </div>

          <div className="category-filters-row">
            <div className="filter-pill">
              <select
                value={filters.postedWithin}
                onChange={(e) => handleChange("postedWithin", e.target.value)}
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
                value={filters.jobType}
                onChange={(e) => handleChange("jobType", e.target.value)}
              >
                <option value="">Job Type</option>
                {uniqueJobTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-pill">
              <select
                value={filters.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
              >
                <option value="">Career Level</option>
                {uniqueExperiences.map((experience) => (
                  <option key={experience} value={experience}>
                    {experience}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <div className="filter-pill">
              <select
                value={filters.workMode}
                onChange={(e) => handleChange("workMode", e.target.value)}
              >
                <option value="">Work Mode</option>
                {uniqueWorkModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              <FaChevronDown />
            </div>

            <button
              className="category-reset-button"
              type="button"
              onClick={handleReset}
            >
              Reset Filter
            </button>
          </div>
        </div>
      </section>

      <section className="category-results-section">
        <div className="category-page-container">
          <div className="category-results-top">
            <h2>
              <strong>{filteredJobs.length}</strong> Vacancies Found
            </h2>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="category-jobs-grid">
              {filteredJobs.map((job) => (
                <article
                  key={job._id || job.id}
                  className="category-job-card"
                >
                  <div className="category-job-top">
                    <div className="category-deadline">
                      <FaRegClock />
                      <span>{job.deadline}</span>
                    </div>

                    <span className="category-type-badge">{job.type}</span>
                  </div>

                  <div className="category-job-body">
                    <p className="category-company-name">{job.company}</p>
                    <h3>{job.title}</h3>

                    <p className="category-job-location">
                      <FaMapMarkerAlt />
                      <span>{job.location}</span>
                    </p>
                  </div>

                  <Link
                    to={`/student/job-portal/jobs/${job._id || job.id}`}
                    className="category-apply-btn"
                  >
                    Apply Now
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="category-empty-state">
              <h3>No jobs match your filters</h3>
              <p>Try changing or resetting filters to see more results.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default JobPortalCategory;
