import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaChevronDown,
  FaRegClock,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import { useJobs } from "../../context/JobsContext";
import { getJobs } from "../../services/api";
import {
  getPortalCategoryBySlug,
  mapJobToPortalCategory,
  filterJobs,
} from "../../data/jobsData";
import "../../styles/JobCategoryPage.css";

const initialFilters = {
  keyword: "",
  location: "",
  jobType: "",
  experience: "",
  workMode: "",
  postedWithin: "",
};

const pickFirstValue = (obj, keys) => {
  for (const key of keys) {
    const value = obj?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const formatDateLabel = (value) => {
  if (!value) return "Recently posted";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FALLBACK_JOB_TYPES = ["Internship", "Graduate Role", "Full-time", "Part-time"];
const FALLBACK_EXPERIENCE = ["Fresh Graduate", "0 - 1 year", "1 - 2 years"];
const FALLBACK_WORK_MODES = ["On-site", "Hybrid", "Remote"];

function JobPortalCategory() {
  const { slug } = useParams();
  const { isJobSaved, saveJob, unsaveJob } = useJobs();
  const [filters, setFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = useMemo(() => getPortalCategoryBySlug(slug), [slug]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getJobs();
        const fetchedJobs = response.data?.data || response.data || [];
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

  const normalizedCategoryJobs = useMemo(() => {
    return categoryJobs.map((job) => ({
      ...job,
      type: pickFirstValue(job, ["type", "jobType", "employmentType"]),
      experience: pickFirstValue(job, ["experience", "careerLevel", "experienceLevel"]),
      workMode: pickFirstValue(job, ["workMode", "mode", "remoteWork"]),
      location: pickFirstValue(job, ["location", "venue", "city"]),
    }));
  }, [categoryJobs]);

  const filteredJobs = useMemo(() => {
    const baseFiltered = filterJobs(normalizedCategoryJobs, filters);

    if (!filters.postedWithin) {
      return baseFiltered;
    }

    const days = Number(filters.postedWithin);
    if (!days || Number.isNaN(days)) {
      return baseFiltered;
    }

    const now = new Date();
    const threshold = new Date(now);
    threshold.setDate(now.getDate() - days);

    return baseFiltered.filter((job) => {
      const rawDate = job.createdAt || job.postedDate || job.deadline;
      if (!rawDate) return false;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return false;
      return date >= threshold;
    });
  }, [normalizedCategoryJobs, filters]);

  const uniqueJobTypes = useMemo(() => {
    return [...new Set(normalizedCategoryJobs.map((job) => job.type).filter(Boolean))];
  }, [normalizedCategoryJobs]);

  const uniqueExperiences = useMemo(() => {
    return [...new Set(normalizedCategoryJobs.map((job) => job.experience).filter(Boolean))];
  }, [normalizedCategoryJobs]);

  const uniqueWorkModes = useMemo(() => {
    return [...new Set(normalizedCategoryJobs.map((job) => job.workMode).filter(Boolean))];
  }, [normalizedCategoryJobs]);

  const selectableJobTypes = uniqueJobTypes.length > 0 ? uniqueJobTypes : FALLBACK_JOB_TYPES;
  const selectableExperiences = uniqueExperiences.length > 0 ? uniqueExperiences : FALLBACK_EXPERIENCE;
  const selectableWorkModes = uniqueWorkModes.length > 0 ? uniqueWorkModes : FALLBACK_WORK_MODES;

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  const toggleSave = async (job) => {
    const jobId = job._id || job.id;
    if (!jobId) return;

    if (isJobSaved(jobId)) {
      await unsaveJob(jobId);
      return;
    }

    await saveJob(job);
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
          <h1>Available Jobs</h1>
          <p className="category-subtitle">
            {category?.name || "Category"} opportunities tailored for students and recent graduates.
          </p>

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
                {selectableJobTypes.map((type) => (
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
                {selectableExperiences.map((experience) => (
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
                {selectableWorkModes.map((mode) => (
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
                      <span>{formatDateLabel(job.postedDate || job.createdAt || job.deadline)}</span>
                    </div>

                    <div className="category-top-actions">
                      <span
                        className={`category-type-badge ${String(job.type || "Open").toLowerCase() === "open" ? "open" : ""}`}
                      >
                        {job.type || "Open"}
                      </span>
                      <button
                        type="button"
                        className={`category-save-btn ${isJobSaved(job._id || job.id) ? "saved" : ""}`}
                        onClick={() => toggleSave(job)}
                        aria-label={isJobSaved(job._id || job.id) ? "Unsave job" : "Save job"}
                        title={isJobSaved(job._id || job.id) ? "Unsave job" : "Save job"}
                      >
                        {isJobSaved(job._id || job.id) ? <FaBookmark /> : <FaRegBookmark />}
                      </button>
                    </div>
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
