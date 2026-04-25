import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBirthdayCake,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaChevronDown,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaGraduationCap,
  FaLaptopHouse,
  FaLinkedin,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaUser,
} from 'react-icons/fa';
import { getStudentProfileByEmailForEmployer } from '../../services/api';
import '../../styles/professionalProfile.css';
import '../../styles/employerStudentProfile.css';

const sectionData = [
  { id: 'target-job', navLabel: 'Target job', title: 'Target job' },
  { id: 'work-experience', navLabel: 'Work experience', title: 'Work experience' },
  { id: 'skills-expertise', navLabel: 'Skills & expertise', title: 'Skills & expertise' },
  { id: 'languages', navLabel: 'Languages', title: 'Languages' },
  { id: 'education-qualifications', navLabel: 'Education & qualifications', title: 'Education & qualifications' },
  { id: 'other-assets', navLabel: 'Other assets', title: 'Other assets' },
];

const PROFILE_NAV_SCROLL_OFFSET = 132;
const PROFILE_ACTIVE_LINE_OFFSET = 150;
const PROFILE_MANUAL_NAV_LOCK_MS = 800;

const getAvailabilityMeta = (status, isAvailable) => {
  if (status === 'actively-job-hunting') {
    return {
      label: 'Actively job hunting',
      colorClass: 'green',
      description: "This student is actively looking for a role and open to employer outreach.",
    };
  }

  if (status === 'open-opportunities' || isAvailable) {
    return {
      label: 'Open to opportunities',
      colorClass: 'blue',
      description: "This student is open to hearing about relevant roles from employers.",
    };
  }

  return {
    label: 'Not available',
    colorClass: 'red',
    description: "This student is not currently open to recruiter outreach.",
  };
};

const formatMonthYear = (value) => {
  if (!value) return 'Not filled';

  const date = new Date(`${value}-01`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString([], {
    month: 'short',
    year: 'numeric',
  });
};

const formatDisplayValue = (value) => (value?.trim() ? value : 'Not filled');

const formatDateRange = (startDate, endDate, isCurrent) => {
  const start = formatMonthYear(startDate);
  const end = isCurrent ? 'Present' : formatMonthYear(endDate);
  return `${start} - ${end}`;
};

const getInitials = (firstName, lastName) =>
  `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'S';

function EmployerStatusCard({ availability }) {
  return (
    <div className="status-card employer-status-card">
      <h2 className="status-title">My status</h2>

      <p className="status-description">
        This employer view reflects whether the student is open to receive <span>opportunities</span>.
      </p>

      <div className="status-select employer-status-readonly" aria-hidden="true">
        <div className="status-select-left">
          <span className={`status-dot ${availability.colorClass}`}></span>
          <span className="status-select-text">{availability.label}</span>
        </div>
        <FaChevronDown className="status-chevron" />
      </div>

      <div className="status-note">
        <FaBuilding className="status-note-icon" />
        <p>{availability.description}</p>
      </div>
    </div>
  );
}

function EmployerSidebar({ activeSectionId, onNavigate }) {
  return (
    <div className="sidebar-card">
      <p className="sidebar-card-title">Personal information</p>

      <nav className="sidebar-nav">
        {sectionData.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`sidebar-link ${activeSectionId === item.id ? 'active' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item.id);
            }}
          >
            {item.navLabel}
          </a>
        ))}
      </nav>
    </div>
  );
}

function ProfileSummary({ profile, availability }) {
  const professionalLinks = [
    { label: 'LinkedIn', value: profile.otherAssets?.linkedin, icon: <FaLinkedin /> },
    { label: 'GitHub', value: profile.otherAssets?.github, icon: <FaGithub /> },
    { label: 'Website', value: profile.otherAssets?.website, icon: <FaGlobe /> },
  ].filter((item) => item.value);

  return (
    <section className="panel-card profile-panel employer-profile-panel">
      <div className="profile-top-row">
        <div className="profile-main">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              {getInitials(profile.firstName, profile.lastName)}
            </div>
          )}

          <div className="profile-heading-block">
            <div className="profile-name-line">
              <h2>{profile.firstName} {profile.lastName}</h2>
              <span className="profile-complete-badge employer-profile-badge">
                {availability.label}
              </span>
            </div>

            <p className="profile-headline-empty">{formatDisplayValue(profile.currentPosition)}</p>
          </div>
        </div>
      </div>

      <div className="profile-details-grid two-columns">
        <div className="profile-details-column">
          <div className="profile-detail">
            <FaEnvelope className="profile-detail-icon" />
            <span className="profile-break">{formatDisplayValue(profile.email)}</span>
          </div>
          <div className="profile-detail">
            <FaPhoneAlt className="profile-detail-icon" />
            <span className="profile-break">{formatDisplayValue(profile.phone)}</span>
          </div>
          <div className="profile-detail">
            <FaBirthdayCake className="profile-detail-icon" />
            <span className="profile-break">{formatDisplayValue(profile.birthDate)}</span>
          </div>
        </div>

        <div className="profile-details-column">
          <div className="profile-detail">
            <FaUser className="profile-detail-icon" />
            <span className="profile-break">{formatDisplayValue(profile.gender)}</span>
          </div>
          <div className="profile-detail">
            <FaBriefcase className="profile-detail-icon" />
            <span className="profile-break">
              {formatDisplayValue(profile.targetJob?.jobTitle || profile.currentPosition)}
            </span>
          </div>
          <div className="profile-detail">
            <FaMapMarkerAlt className="profile-detail-icon" />
            <span className="profile-break">
              {formatDisplayValue(profile.targetJob?.desiredLocation)}
            </span>
          </div>
        </div>
      </div>

      {professionalLinks.length ? (
        <div className="profile-assets-row">
          {professionalLinks.map((item) => (
            <a
              key={item.label}
              href={item.value}
              target="_blank"
              rel="noreferrer"
              className="profile-asset-link"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TargetJobSection({ profile }) {
  const targetJob = profile.targetJob || {};
  const hasAnyTargetJob =
    targetJob.jobTitle ||
    targetJob.desiredLocation ||
    targetJob.contractType ||
    targetJob.remoteWork ||
    targetJob.experienceLevel ||
    targetJob.minimumSalary ||
    targetJob.summary;

  return (
    <section id="target-job" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="target-job-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Target job</h2>
              {!hasAnyTargetJob ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p className="target-job-summary-subtitle">
              The type of role this student wants to pursue next.
            </p>
          </div>
        </div>

        {hasAnyTargetJob ? (
          <div className="target-job-summary-grid">
            <div className="target-job-summary-label">Job title</div>
            <div className="target-job-summary-value">
              {targetJob.jobTitle ? (
                <span className="target-job-summary-tag">
                  <span className="target-job-summary-tag-icon"><FaBriefcase /></span>
                  <span>{targetJob.jobTitle}</span>
                </span>
              ) : 'Not filled'}
            </div>

            <div className="target-job-summary-label">Desired work location</div>
            <div className="target-job-summary-value">
              {targetJob.desiredLocation ? (
                <span className="target-job-summary-tag">
                  <span className="target-job-summary-tag-icon"><FaMapMarkerAlt /></span>
                  <span>{targetJob.desiredLocation}</span>
                </span>
              ) : 'Not filled'}
            </div>

            <div className="target-job-summary-label">Contract type</div>
            <div className="target-job-summary-value">
              {targetJob.contractType ? (
                <span className="target-job-summary-tag">
                  <span className="target-job-summary-tag-icon"><FaCalendarAlt /></span>
                  <span>{targetJob.contractType}</span>
                </span>
              ) : 'Not filled'}
            </div>

            <div className="target-job-summary-label">Remote work</div>
            <div className="target-job-summary-value">
              {targetJob.remoteWork ? (
                <span className="target-job-summary-tag">
                  <span className="target-job-summary-tag-icon"><FaLaptopHouse /></span>
                  <span>{targetJob.remoteWork}</span>
                </span>
              ) : 'Not filled'}
            </div>

            <div className="target-job-summary-label">Level of experience</div>
            <div className="target-job-summary-value">
              {targetJob.experienceLevel ? (
                <span className="target-job-summary-tag">
                  <span className="target-job-summary-tag-icon"><FaUser /></span>
                  <span>{targetJob.experienceLevel}</span>
                </span>
              ) : 'Not filled'}
            </div>

            <div className="target-job-summary-label">Minimum salary</div>
            <div className="target-job-summary-value">
              {targetJob.minimumSalary
                ? (
                  <span className="target-job-summary-tag">
                    <span className="target-job-summary-tag-icon"><FaMoneyBillWave /></span>
                    <span>{`${targetJob.currency || 'LKR'} ${targetJob.minimumSalary}`}</span>
                  </span>
                )
                : 'Not filled'}
            </div>

            <div className="target-job-summary-label target-job-summary-long-label">Professional summary</div>
            <div className="target-job-summary-value target-job-summary-text">
              {formatDisplayValue(targetJob.summary)}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function WorkExperienceSection({ experiences }) {
  return (
    <section id="work-experience" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="work-experience-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Work experience</h2>
              {!experiences.length ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p>Past and current experience, placements, internships, and projects.</p>
          </div>
        </div>

        {experiences.length ? (
          <div className="work-experience-summary-list">
            {experiences.map((item) => (
              <div key={item.id || `${item.jobTitle}-${item.companyName}`} className="work-experience-summary-item">
                <div className="work-experience-summary-topline">
                  <h4>{formatDisplayValue(item.jobTitle)}</h4>
                  <span>{formatDateRange(item.startDate, item.endDate, item.currentlyWorking)}</span>
                </div>
                <p className="work-experience-summary-company">{formatDisplayValue(item.companyName)}</p>
                <p className="work-experience-summary-meta">
                  {[formatDisplayValue(item.employmentType), formatDisplayValue(item.location)].join(' | ')}
                </p>
                <p className="work-experience-summary-description">
                  {formatDisplayValue(item.description)}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SkillsSection({ skills }) {
  return (
    <section id="skills-expertise" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="skills-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Skills & expertise</h2>
              {!skills.length ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p>Core strengths and practical capability areas.</p>
          </div>
        </div>

        {skills.length ? (
          <div className="skills-summary-list">
            {skills.map((skill) => (
              <span key={skill} className="skills-summary-chip">{skill}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LanguagesSection({ languages }) {
  return (
    <section id="languages" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="languages-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Languages</h2>
              {!languages.length ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p>Languages the student can use professionally.</p>
          </div>
        </div>

        {languages.length ? (
          <div className="skills-summary-list">
            {languages.map((language) => (
              <span key={language} className="skills-summary-chip">{language}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EducationSection({ educationItems }) {
  return (
    <section id="education-qualifications" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="education-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Education & qualifications</h2>
              {!educationItems.length ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p>Relevant education, training, coursework, and certifications.</p>
          </div>
        </div>

        {educationItems.length ? (
          <div className="work-experience-summary-list">
            {educationItems.map((item) => (
              <div key={item.id || `${item.title}-${item.institution}`} className="work-experience-summary-item">
                <div className="work-experience-summary-topline">
                  <h4>{formatDisplayValue(item.title)}</h4>
                  <span>{formatDateRange(item.fromDate, item.toDate, item.currentlyStudying)}</span>
                </div>
                <p className="work-experience-summary-company">{formatDisplayValue(item.institution)}</p>
                <p className="work-experience-summary-meta">{formatDisplayValue(item.level)}</p>
                {item.projectsInvolved ? (
                  <p className="work-experience-summary-description">{item.projectsInvolved}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function OtherAssetsSection({ otherAssets }) {
  const links = [
    { label: 'LinkedIn', value: otherAssets?.linkedin, icon: <FaLinkedin /> },
    { label: 'GitHub', value: otherAssets?.github, icon: <FaGithub /> },
    { label: 'Website', value: otherAssets?.website, icon: <FaGlobe /> },
  ].filter((item) => item.value);

  return (
    <section id="other-assets" className="info-card target-job-summary-card">
      <div className="info-card-content">
        <div className="other-assets-summary-top">
          <div>
            <div className="info-card-title-row">
              <h2>Other assets</h2>
              {!links.length ? <span className="status-badge-soft">Not started</span> : null}
            </div>
            <p>Supporting links that help employers understand this student faster.</p>
          </div>
        </div>

        {links.length ? (
          <div className="other-assets-links-list">
            {links.map((item) => (
              <a key={item.label} href={item.value} target="_blank" rel="noreferrer" className="profile-asset-link">
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

const ViewStudentProfile = () => {
  const { state } = useLocation();
  const email = state?.email || '';
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');
  const manualNavLockUntilRef = useRef(0);

  useEffect(() => {
    if (state?._origin !== 'employer-applicants') {
      navigate('/employer/dashboard', { replace: true });
      return;
    }

    const fetchProfile = async () => {
      if (!email) {
        setError('Student email is required');
        setLoading(false);
        return;
      }

      try {
        const res = await getStudentProfileByEmailForEmployer(email);
        setProfile(res.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email, state, navigate]);

  const availability = useMemo(
    () => getAvailabilityMeta(profile?.availabilityStatus, profile?.isAvailable),
    [profile]
  );

  const handleSidebarNavigate = (id) => {
    const section = document.getElementById(id);
    if (!section) return;

    manualNavLockUntilRef.current = Date.now() + PROFILE_MANUAL_NAV_LOCK_MS;
    setActiveSectionId(id);

    window.scrollTo({
      top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - PROFILE_NAV_SCROLL_OFFSET),
      behavior: 'auto',
    });
  };

  useEffect(() => {
    if (loading || !profile) return undefined;

    let ticking = false;

    const updateActiveSection = () => {
      if (Date.now() < manualNavLockUntilRef.current) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const activationLine = scrollY + PROFILE_ACTIVE_LINE_OFFSET;

      const sections = sectionData
        .map((section) => {
          const element = document.getElementById(section.id);
          if (!element) return null;

          return {
            id: section.id,
            top: element.getBoundingClientRect().top + window.scrollY,
          };
        })
        .filter(Boolean);

      if (!sections.length) {
        ticking = false;
        return;
      }

      let nextActiveSectionId = '';

      const isAtBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 4;

      if (isAtBottom) {
        nextActiveSectionId = sections[sections.length - 1].id;
      } else {
        for (const section of sections) {
          if (section.top <= activationLine) {
            nextActiveSectionId = section.id;
          } else {
            break;
          }
        }
      }

      setActiveSectionId((prev) => (prev === nextActiveSectionId ? prev : nextActiveSectionId));
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="myspace-page employer-profile-mode">
        <div className="container employer-profile-feedback">
          <h2>Loading professional profile...</h2>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="myspace-page employer-profile-mode">
        <div className="container employer-profile-feedback">
          <h2>{error || 'Student profile not found.'}</h2>
          <button
            type="button"
            className="employer-profile-primary-btn"
            onClick={() => navigate('/employer/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="myspace-page employer-profile-mode">
      <div className="container">
        <div className="employer-profile-back-row">
          <button
            type="button"
            className="employer-profile-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
            <span>Back to Applicants</span>
          </button>
        </div>

        <div className="myspace-shell">
          <aside className="myspace-left">
            <div className="fixed-sidebar">
              <EmployerStatusCard availability={availability} />
              <EmployerSidebar activeSectionId={activeSectionId} onNavigate={handleSidebarNavigate} />
            </div>
          </aside>

          <main className="myspace-right employer-profile-right">
            <ProfileSummary profile={profile} availability={availability} />
            <TargetJobSection profile={profile} />
            <WorkExperienceSection experiences={profile.workExperiences || []} />
            <SkillsSection skills={profile.skills || []} />
            <LanguagesSection languages={profile.languages || []} />
            <EducationSection educationItems={profile.educationItems || []} />
            <OtherAssetsSection otherAssets={profile.otherAssets || {}} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default ViewStudentProfile;
