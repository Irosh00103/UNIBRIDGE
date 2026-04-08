import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBriefcase,
  FaRegBookmark,
  FaCheckCircle,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import { useJobs } from "../../context/JobsContext";
import "../../styles/jobPortalDetail.css";

const DEFAULT_SCREENING_QUESTIONS = [
  {
    id: "readiness-summary",
    type: "textarea",
    question:
      "Why are you interested in this role, and how does it align with your current learning or career goals?",
  },
  {
    id: "applied-knowledge",
    type: "textarea",
    question:
      "Describe one project, coursework, or experience where you applied relevant skills for this position.",
  },
  {
    id: "problem-solving",
    type: "textarea",
    question:
      "Share a challenging problem you solved recently and explain how you approached it.",
  },
];

function JobPortalDetail() {
  const { id } = useParams();

  const {
    jobs,
    jobsLoading,
    jobsError,
    addApplication,
    saveJob,
    unsaveJob,
    isJobSaved,
    hasAppliedToJob,
  } = useJobs();

  const job = useMemo(
    () => jobs.find((item) => (item._id || item.id) === id),
    [jobs, id]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [toast, setToast] = useState({ visible: false, type: "success", text: "" });

  const today = new Date().toISOString().split("T")[0];

  const screeningQuestions = useMemo(() => {
    if (Array.isArray(job?.screeningQuestions) && job.screeningQuestions.length > 0) {
      return job.screeningQuestions;
    }

    if (Array.isArray(job?.questions) && job.questions.length > 0) {
      return job.questions.map((q, index) => ({
        id: `legacy-question-${index + 1}`,
        type: "textarea",
        question: q.questionText,
        options: [],
      }));
    }

    return DEFAULT_SCREENING_QUESTIONS;
  }, [job]);

  useEffect(() => {
    if (!toast.visible) return undefined;
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast.visible]);

  const showToast = (type, text) => {
    setToast({ visible: true, type, text });
  };

  if (jobsLoading) {
    return <div>Loading job details...</div>;
  }

  if (jobsError) {
    return <div>{jobsError}</div>;
  }

  if (!job) {
    return (
      <div className="job-detail-page">
        <section className="job-top-banner">
          <div className="job-detail-container banner-inner">
            <div className="banner-top-row">
              <Link to="/" className="back-home-btn on-banner">
                <FaHome />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="job-detail-container">
          <div className="job-not-found">
            <h2>Job not found</h2>
            <p>The requested job could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const jobId = job._id || job.id;
  const isSaved = isJobSaved(jobId);
  const alreadyApplied = hasAppliedToJob(jobId);

  const handleChange = (key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addApplication(job, answers);

    if (!result.success) {
      showToast("error", result.message || "Could not submit your application.");
      return;
    }

    showToast("success", "Application submitted successfully.");
    setIsModalOpen(false);
    setAnswers({});
  };

  const handleSaveToggle = async () => {
    if (isSaved) {
      const result = await unsaveJob(jobId);
      if (result?.success) {
        showToast("success", "Job removed from saved jobs.");
      } else {
        showToast("error", result?.message || "Could not remove the saved job.");
      }
      return;
    }

    const result = await saveJob(job);
    if (result?.success) {
      showToast("success", "Job saved successfully.");
    } else {
      showToast("error", result?.message || "Could not save the job.");
    }
  };

  return (
    <div className="job-detail-page">
      <section className="job-top-banner">
        <div className="job-detail-container banner-inner">
          <div className="banner-top-row">
            <Link to="/" className="back-home-btn on-banner">
              <FaHome />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="banner-left">
            <h1>{job.title}</h1>
            <h2>{job.company}</h2>
          </div>
        </div>
      </section>

      <div className="job-detail-container job-detail-main-wrap">
        <div className="job-detail-grid">
          <main className="job-main-content">
            <section className="job-main-section">
              <h3>{job.title}</h3>

              <p className="job-main-paragraph">{job.overview}</p>
            </section>

            <section className="job-main-section">
              <h4>Key Responsibilities</h4>
              <ul className="job-detail-list blue-bullets">
                {(job.responsibilities || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="job-main-section">
              <h4>Qualifications & Experience</h4>
              <ul className="job-detail-list blue-bullets">
                {(job.requirements || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </main>

          <aside className="job-side-panel">
            <div className="job-side-card">
              <div className="job-side-card-header">
                <div className="side-company-block">
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                </div>
              </div>

              <div className="side-meta-list">
                <div className="side-meta-item">
                  <FaMapMarkerAlt />
                  <span>{job.location}</span>
                </div>
                <div className="side-meta-item">
                  <FaCalendarAlt />
                  <span>Posted on {job.postedDate}</span>
                </div>
                <div className="side-meta-item">
                  <FaBriefcase />
                  <span>{job.type}</span>
                </div>
              </div>

              <div className="side-divider"></div>

              <p className="side-summary">{job.sideSummary}</p>

              <div className="mini-overview-table">
                <div className="mini-overview-row">
                  <span>Education</span>
                  <strong>{job.qualification}</strong>
                </div>
                <div className="mini-overview-row">
                  <span>Experience</span>
                  <strong>{job.experience}</strong>
                </div>
                <div className="mini-overview-row">
                  <span>Work Mode</span>
                  <strong>{job.workMode}</strong>
                </div>
                <div className="mini-overview-row">
                  <span>Category</span>
                  <strong>{job.category}</strong>
                </div>
              </div>

              <div className="side-divider"></div>

              <div className="job-side-actions">
                <button
                  className="job-apply-btn"
                  onClick={() => {
                    if (alreadyApplied) {
                      showToast("info", "You have already applied for this job.");
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                  type="button"
                >
                  {alreadyApplied ? "ALREADY APPLIED" : "APPLY FOR JOB"}
                </button>

                <button
                  className={`job-save-btn ${isSaved ? "saved" : ""}`}
                  onClick={handleSaveToggle}
                  type="button"
                >
                  <span>{isSaved ? "SAVED JOB" : "SAVE JOB"}</span>
                  <FaRegBookmark />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="application-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="application-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-modal-header">
              <div>
                <h2>Apply for {job.title}</h2>
                <p>
                  Your profile details are already available. Complete the
                  screening form below to continue your application.
                </p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <form className="application-form" onSubmit={handleSubmit}>
              <div className="application-note-box">
                <div className="application-note-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <h4>Profile-linked application</h4>
                  <p>
                    Personal details will be pulled from the candidate profile.
                    Only job-specific responses are required here.
                  </p>
                </div>
              </div>

              <div className="application-extra-grid">
                <div className="form-group">
                  <label>Earliest available start date</label>
                  <input
                    type="date"
                    min={today}
                    value={answers.startDate || ""}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current study / work status</label>
                  <select
                    value={answers.currentStatus || ""}
                    onChange={(e) =>
                      handleChange("currentStatus", e.target.value)
                    }
                    required
                  >
                    <option value="">Select status</option>
                    <option value="full-time-student">Full-time student</option>
                    <option value="final-year-student">Final year student</option>
                    <option value="fresh-graduate">Fresh graduate</option>
                    <option value="employed">Currently employed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Can you attend interviews within 7 days?</label>
                  <select
                    value={answers.interviewAvailability || ""}
                    onChange={(e) =>
                      handleChange("interviewAvailability", e.target.value)
                    }
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Portfolio / GitHub / LinkedIn link</label>
                  <input
                    type="url"
                    placeholder="Optional link"
                    value={answers.profileLink || ""}
                    onChange={(e) =>
                      handleChange("profileLink", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="screening-section">
                <h3>Screening Questions</h3>
                <p>
                  Please answer thoughtfully. These questions help evaluate your
                  role readiness, applied knowledge, and problem-solving ability.
                </p>

                <div className="screening-questions-list">
                  {screeningQuestions.map((item, index) => (
                    <div className="question-card" key={item.id || `q-${index + 1}`}>
                      <label className="question-title">
                        {index + 1}. {item.question}
                      </label>

                      {item.type === "textarea" && (
                        <textarea
                          rows="4"
                          placeholder="Write your answer here..."
                          value={answers[item.id || `q-${index + 1}`] || ""}
                          onChange={(e) =>
                            handleChange(item.id || `q-${index + 1}`, e.target.value)
                          }
                          required
                        />
                      )}

                      {item.type === "select" && (
                        <select
                          value={answers[item.id || `q-${index + 1}`] || ""}
                          onChange={(e) =>
                            handleChange(item.id || `q-${index + 1}`, e.target.value)
                          }
                          required
                        >
                          <option value="">Select an answer</option>
                          {(item.options || []).map((option) => (
                            <option value={option} key={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="consent-box">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={answers.accuracyConsent || false}
                    onChange={(e) =>
                      handleChange("accuracyConsent", e.target.checked)
                    }
                    required
                  />
                  <span>
                    I confirm that my responses are truthful and may be used for
                    candidate screening.
                  </span>
                </label>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={answers.profileConsent || false}
                    onChange={(e) =>
                      handleChange("profileConsent", e.target.checked)
                    }
                    required
                  />
                  <span>
                    I agree to this application being evaluated together with my
                    profile details already available on the platform.
                  </span>
                </label>
              </div>

              <div className="application-actions">
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-action-btn">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className={`job-detail-toast ${toast.type}`} role="status" aria-live="polite">
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default JobPortalDetail;
