import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaBullhorn,
  FaChartBar,
  FaCoins,
  FaCogs,
  FaFileAlt,
  FaGraduationCap,
  FaHardHat,
  FaHeadset,
  FaMapMarkerAlt,
  FaMicrochip,
  FaPaperPlane,
  FaProjectDiagram,
  FaRegClock,
  FaRegUserCircle,
  FaSearch,
  FaTasks,
  FaThLarge,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";
import { useJobs } from "../../context/JobsContext";
import { mapJobToPortalCategory, portalCategories } from "../../data/jobsData";
import "../../styles/jobPortal.css";

import dialogLogo from "../../assets/company-logos/dialog.jpg";
import masLogo from "../../assets/company-logos/mas1.png";
import johnKeellsLogo from "../../assets/company-logos/johnkeells.jpg";
import comBankLogo from "../../assets/company-logos/combank.png";
import hnbLogo from "../../assets/company-logos/hnb.png";
import sltMobitelLogo from "../../assets/company-logos/sltmobitel.jpg";
import sampathLogo from "../../assets/company-logos/sampath.png";
import cargillsLogo from "../../assets/company-logos/cargills1.png";

const companyLogos = [
  { name: "Dialog", logo: dialogLogo },
  { name: "MAS Holdings", logo: masLogo },
  { name: "John Keells", logo: johnKeellsLogo },
  { name: "Commercial Bank", logo: comBankLogo },
  { name: "HNB", logo: hnbLogo },
  { name: "SLT Mobitel", logo: sltMobitelLogo },
  { name: "Sampath Bank", logo: sampathLogo },
  { name: "Cargills", logo: cargillsLogo },
];

const categoryIconMap = {
  other: FaProjectDiagram,
  sales: FaChartBar,
  software: FaMicrochip,
  finance: FaBriefcase,
  engineering: FaHardHat,
  marketing: FaBullhorn,
  admin: FaSearch,
  production: FaCogs,
  customer: FaHeadset,
  banking: FaCoins,
  education: FaGraduationCap,
  hr: FaUsers,
};

const getJobId = (job) => job.id || job._id;

const getDeadlineLabel = (job) =>
  job.deadline || job.applicationDeadline || job.closingDate || "Open now";

const JobPortal = () => {
  const { jobs = [], jobsLoading, jobsError } = useJobs();
  const navigate = useNavigate();
  const categoriesRef = useRef(null);
  const howItWorksRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const categories = useMemo(() => {
    const withCounts = portalCategories.map((cat) => ({
      ...cat,
      count: jobs.filter((job) => mapJobToPortalCategory(job) === cat.slug)
        .length,
    }));
    const withJobs = withCounts
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count || a.order - b.order);
    const withoutJobs = withCounts
      .filter((cat) => cat.count === 0)
      .sort((a, b) => a.order - b.order);

    return [...withJobs, ...withoutJobs];
  }, [jobs]);

  const keywordSuggestions = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) return [];

    const suggestions = [];
    jobs.forEach((job) => {
      const values = [
        job.title,
        job.company,
        job.employerName,
        job.type,
        job.category,
        job.qualification,
        ...(job.skills || []),
      ];

      values.forEach((value) => {
        if (
          value &&
          value.toLowerCase().includes(search) &&
          !suggestions.includes(value)
        ) {
          suggestions.push(value);
        }
      });
    });

    return suggestions.slice(0, 8);
  }, [jobs, keyword]);

  const locationSuggestions = useMemo(() => {
    const search = location.trim().toLowerCase();
    if (!search) return [];

    return [...new Set(jobs.map((job) => job.location).filter(Boolean))]
      .filter((item) => item.toLowerCase().includes(search))
      .slice(0, 8);
  }, [jobs, location]);

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();
    navigate(`/student/job-portal/all${query ? `?${query}` : ""}`);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const handleScrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleScrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-top-actions">
          <Link to="/student/profile/professional" className="hero-nav-link">
            <FaRegUserCircle className="hero-nav-icon" />
            <span>Professional Profile</span>
          </Link>

          <button
            type="button"
            className="hero-nav-link hero-nav-link-btn"
            onClick={handleScrollToCategories}
          >
            <FaThLarge className="hero-nav-icon" />
            <span>Categories</span>
          </button>

          <button
            type="button"
            className="hero-nav-link hero-nav-link-btn"
            onClick={handleScrollToHowItWorks}
          >
            <FaTasks className="hero-nav-icon" />
            <span>How It Works</span>
          </button>
        </div>

        <div className="hero-content">
          <p className="hero-kicker">For Students & Fresh Graduates</p>

          <h1 className="hero-title">
            <span className="title-line-1">Launch Your Career</span>
            <span className="title-line-2">With Confidence</span>
          </h1>

          <p className="subtitle">
            Discover internships, entry-level roles, and graduate opportunities
            built for students and fresh graduates ready to take the next step.
          </p>

          <div className="search-wrapper">
            <div className="search-field keyword-field search-field-with-suggestions">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Job title, keyword, or company"
                value={keyword}
                onBlur={() => setShowKeywordSuggestions(false)}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setShowKeywordSuggestions(true);
                }}
                onFocus={() => setShowKeywordSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
              />

              {showKeywordSuggestions && keywordSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {keywordSuggestions.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      className="search-suggestion-item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setKeyword(item);
                        setShowKeywordSuggestions(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="search-divider" />

            <div className="search-field location-field search-field-with-suggestions">
              <FaMapMarkerAlt className="search-icon" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onBlur={() => setShowLocationSuggestions(false)}
                onChange={(event) => {
                  setLocation(event.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
              />

              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {locationSuggestions.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      className="search-suggestion-item"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setLocation(item);
                        setShowLocationSuggestions(false);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="search-btn" onClick={handleSearch} type="button">
              Search Jobs
            </button>
          </div>

          <div className="floating-cards-row">
            <div className="mini-card">
              <div className="mini-card-icon">
                <FaBriefcase />
              </div>
              <div className="mini-card-content">
                <p className="mini-card-label">Open Roles</p>
                <h3>{jobs.length || "0"}+</h3>
                <p className="mini-card-text">Internships and graduate roles</p>
              </div>
            </div>

            <div className="mini-card">
              <div className="mini-card-icon alt">
                <FaUserGraduate />
              </div>
              <div className="mini-card-content">
                <p className="mini-card-label">Top Employers</p>
                <h3>{new Set(jobs.map((job) => job.company || job.employerName).filter(Boolean)).size || "0"}+</h3>
                <p className="mini-card-text">Companies hiring fresh graduates</p>
              </div>
            </div>

            <div className="mini-card">
              <div className="mini-card-icon third">
                <FaSearch />
              </div>
              <div className="mini-card-content">
                <p className="mini-card-label">Fast Search</p>
                <h3>Smart</h3>
                <p className="mini-card-text">Find matching roles in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="recent-jobs-section">
        <div className="recent-jobs-container">
          <div className="recent-jobs-heading">
            <h2>
              Recent <span>Jobs</span>
            </h2>
          </div>

          {jobsError && <div className="alert alert-error">{jobsError}</div>}

          {jobsLoading ? (
            <div className="loading">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found</h3>
              <p>Try different keywords or check back later.</p>
            </div>
          ) : (
            <div className="recent-jobs-grid">
              {jobs.slice(0, 8).map((job) => (
                <article key={getJobId(job)} className="recent-job-card">
                  <div className="recent-job-top">
                    <div className="job-deadline">
                      <FaRegClock />
                      <span>{getDeadlineLabel(job)}</span>
                    </div>

                    <span className="job-type-badge">
                      {job.type || job.status || "Open"}
                    </span>
                  </div>

                  <div className="recent-job-body">
                    <p className="job-company-name">
                      {job.company || job.employerName || "Company"}
                    </p>
                    <h3 className="job-role-title">{job.title}</h3>

                    {job.location && (
                      <p className="job-location">
                        <FaMapMarkerAlt />
                        <span>{job.location}</span>
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/student/job-portal/jobs/${getJobId(job)}`}
                    className="apply-job-btn"
                  >
                    Apply Now
                  </Link>
                </article>
              ))}
            </div>
          )}

          <div className="recent-jobs-footer">
            <Link to="/student/job-portal/all" className="see-all-jobs-btn">
              See All
            </Link>
          </div>
        </div>
      </section>

      <section className="job-categories-section" ref={categoriesRef}>
        <div className="job-categories-container">
          <div className="job-categories-heading">
            <h2>
              Find Your Jobs By <span>Category</span>
            </h2>
          </div>

          <div className="job-categories-grid">
            {categories.map((category) => {
              const Icon = categoryIconMap[category.accent] || FaProjectDiagram;

              return (
                <Link
                  key={category.slug}
                  to={`/student/job-portal/categories/${category.slug}`}
                  className="job-category-card"
                >
                  <div className="job-category-text">
                    <h3>{category.name}</h3>
                    <p>
                      {category.count} Job{category.count !== 1 ? "s" : ""} Available
                    </p>
                  </div>

                  <div className="job-category-art">
                    <div className="art-circle"></div>
                    <Icon className="job-category-icon" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="how-it-works-section" ref={howItWorksRef}>
        <div className="how-it-works-container">
          <div className="how-it-works-heading">
            <h2>
              How It <span>Works</span>
            </h2>
            <p>
              Everything students need to explore jobs, apply easily, build
              their full profile, and manage their career journey in one place.
            </p>
          </div>

          <div className="how-it-works-grid">
            <article className="how-it-works-card">
              <div className="how-card-icon">
                <FaSearch />
              </div>
              <h3>Browse Jobs</h3>
              <p>
                Explore internships, entry-level roles, and graduate
                opportunities. Students can search jobs, browse by categories,
                and discover roles that match their interests and goals.
              </p>
            </article>

            <article className="how-it-works-card">
              <div className="how-card-icon alt">
                <FaFileAlt />
              </div>
              <h3>Set Up Your Profile</h3>
              <p>
                Build your complete profile with personal details, target job,
                skills, education, qualifications, and work experience in one
                built-in CV-style format without uploading a separate CV.
              </p>
            </article>

            <article className="how-it-works-card">
              <div className="how-card-icon third">
                <FaPaperPlane />
              </div>
              <h3>Apply With Screening Answers</h3>
              <p>
                Apply directly to jobs by answering employer screening
                questions. Your profile already contains the key information
                employers need, making applications faster and more organized.
              </p>
            </article>

            <article className="how-it-works-card">
              <div className="how-card-icon fourth">
                <FaTasks />
              </div>
              <h3>Track, Save & Get Alerts</h3>
              <p>
                Save job posts, track your applications and their status, and
                receive employer alerts so you can stay updated and never miss
                the right opportunity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="top-companies-section">
        <div className="top-companies-container">
          <div className="top-companies-heading">
            <h2>
              Top Companies <span>Hiring</span>
            </h2>
          </div>

          <div className="logo-marquee">
            <div className="logo-marquee-track">
              {[...companyLogos, ...companyLogos].map((company, index) => (
                <div
                  className="logo-marquee-item"
                  key={`${company.name}-${index}`}
                >
                  <img src={company.logo} alt={company.name} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobPortal;
