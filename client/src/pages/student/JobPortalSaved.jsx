import "./SavedJobsPage.css";
import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaBookmark,
  FaCheckCircle,
  FaRegSquare,
  FaCheckSquare,
  FaTrashAlt,
  FaSearch,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { useJobs } from "../../context/JobsContext";

function formatPostedDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function JobPortalSaved() {
  const navigate = useNavigate();
  const { savedJobs, savedJobsLoading, unsaveJob } = useJobs();
  const [searchValue, setSearchValue] = useState("");
  const [selectedJobIds, setSelectedJobIds] = useState([]);

  const filteredJobs = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return savedJobs.filter((job) => {
      if (!query) return true;

      return (
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    });
  }, [savedJobs, searchValue]);

  const isSelected = (id) => selectedJobIds.includes(id);

  const handleToggleSelect = (id) => {
    setSelectedJobIds((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredJobs.map((job) => job.id);
    const allVisibleSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedJobIds.includes(id));

    if (allVisibleSelected) {
      setSelectedJobIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedJobIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleUnsaveSelected = async () => {
    if (selectedJobIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to unsave ${selectedJobIds.length} selected job${
        selectedJobIds.length > 1 ? "s" : ""
      }?`
    );

    if (!confirmed) return;

    for (const id of selectedJobIds) {
      await unsaveJob(id);
    }

    setSelectedJobIds([]);
  };

  const allVisibleSelected =
    filteredJobs.length > 0 &&
    filteredJobs.every((job) => selectedJobIds.includes(job.id));

  if (savedJobsLoading) {
    return (
      <div className="saved-jobs-page">
        <div className="saved-jobs-container">
          <section className="saved-jobs-hero">
            <div className="saved-jobs-header">
              <div className="saved-jobs-header-icon-wrap">
                <div className="saved-jobs-header-icon-glow"></div>
                <div className="saved-jobs-header-icon">
                  <FaBookmark />
                </div>
              </div>

              <div className="saved-jobs-header-text">
                <h1>Welcome to your saved jobs!</h1>
                <p>Loading your saved jobs...</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-page">
      <div className="saved-jobs-container">
        <section className="saved-jobs-hero">
          <div className="saved-jobs-header">
            <div className="saved-jobs-header-icon-wrap">
              <div className="saved-jobs-header-icon-glow"></div>
              <div className="saved-jobs-header-icon">
                <FaBookmark />
              </div>
            </div>

            <div className="saved-jobs-header-text">
              <h1>Welcome to your saved jobs!</h1>
              <p>
                Keep your favorite opportunities in one place and manage them
                when you are ready to apply.
              </p>
            </div>
          </div>
        </section>

        <section className="saved-jobs-board-card">
          <div className="saved-jobs-toolbar">
            <div className="saved-jobs-search-wrap">
              <FaSearch className="saved-jobs-search-icon" />
              <input
                type="text"
                placeholder="Search by job title, company, or location"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="saved-jobs-search-input"
              />
            </div>

            <div className="saved-jobs-actions">
              <button
                type="button"
                className={`saved-jobs-select-all-btn ${
                  filteredJobs.length === 0 ? "disabled" : ""
                }`}
                onClick={handleSelectAllVisible}
                disabled={filteredJobs.length === 0}
              >
                {allVisibleSelected ? <FaCheckSquare /> : <FaRegSquare />}
                <span>{allVisibleSelected ? "Unselect all" : "Select all"}</span>
              </button>

              <button
                type="button"
                className={`saved-jobs-unsave-btn ${
                  selectedJobIds.length === 0 ? "disabled" : ""
                }`}
                onClick={handleUnsaveSelected}
                disabled={selectedJobIds.length === 0}
              >
                <FaTrashAlt />
                <span>Unsave selected</span>
              </button>
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="saved-jobs-grid">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className={`saved-job-card ${isSelected(job.id) ? "selected" : ""}`}
                >
                  <button
                    type="button"
                    className="saved-job-select-toggle"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleSelect(job.id);
                    }}
                    aria-label={
                      isSelected(job.id)
                        ? `Unselect ${job.title}`
                        : `Select ${job.title}`
                    }
                  >
                    {isSelected(job.id) ? <FaCheckSquare /> : <FaRegSquare />}
                  </button>

                  <Link
                    to={`/student/job-portal/jobs/${job.id}`}
                    className="saved-job-card-link"
                  >
                    <div className="saved-job-top">
                      <div className="saved-job-company-mark">
                        <FaBookmark />
                      </div>

                      <div className="saved-job-main">
                        <h3>{job.title}</h3>
                        <p className="saved-job-company">{job.company}</p>
                      </div>
                    </div>

                    <div className="saved-job-meta">
                      {job.location ? (
                        <div className="saved-job-meta-item">
                          <FaMapMarkerAlt />
                          <span>{job.location}</span>
                        </div>
                      ) : null}

                      {job.postedDate ? (
                        <div className="saved-job-meta-item">
                          <FaClock />
                          <span>Posted {formatPostedDate(job.postedDate)}</span>
                        </div>
                      ) : null}
                    </div>

                    {job.description ? (
                      <p className="saved-job-description">{job.description}</p>
                    ) : null}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="saved-jobs-empty-state">
              <div className="saved-jobs-empty-illustration">
                <div className="saved-jobs-empty-illustration-circle">
                  <FaBookmark />
                </div>
              </div>

              <h3>No saved jobs yet</h3>
              <p>
                When you save a job, the full job card will appear here and
                you will be able to select or unsave it anytime.
              </p>

              <div className="saved-jobs-empty-tip">
                <FaCheckCircle />
                <span>
                  Saved jobs help you come back later and apply faster.
                </span>
              </div>
            </div>
          )}
        </section>

        <div className="saved-jobs-bottom-actions">
          <button
            type="button"
            className="saved-jobs-return-home-btn"
            onClick={() => navigate("/student/job-portal")}
          >
            <FaArrowLeft />
            <span>Return to Job Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
