import "../../styles/professionalProfile.css";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaChevronDown,
  FaChevronUp,
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
  FaPencilAlt,
  FaPlus,
  FaBriefcase,
  FaUser,
  FaTimes,
  FaCalendarAlt,
  FaTrashAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaLaptopHouse,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaRegFileAlt,
  FaBookmark,
} from "react-icons/fa";

const sectionData = [
  {
    id: "target-job",
    navLabel: "Target job",
    title: "Target job",
    description:
      "Tell recruiters more about the kind of job you're looking for.",
  },
  {
    id: "work-experience",
    navLabel: "Work experience",
    title: "Work experience",
    description:
      "Tell recruiters more about your past and current experiences, projects.",
  },
  {
    id: "skills-expertise",
    navLabel: "Skills & expertise",
    title: "Skills & expertise",
    description: "Highlight the skills and expertise that make you unique.",
  },
  {
    id: "languages",
    navLabel: "Languages",
    title: "Languages",
    description:
      "Let recruiters know which languages you can use professionally.",
  },
  {
    id: "education-qualifications",
    navLabel: "Education & qualifications",
    title: "Education & qualifications",
    description:
      "List your relevant education, training and certificates.",
  },
  {
    id: "other-assets",
    navLabel: "Other assets",
    title: "Other assets",
    description: "Add links to support and accelerate your applications.",
  },
];

const PROFILE_NAV_SCROLL_OFFSET = 132;
const PROFILE_ACTIVE_LINE_OFFSET = 150;
const PROFILE_MANUAL_NAV_LOCK_MS = 800;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const TARGET_JOB_CHARACTER_LIMIT = 300;
const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const WORK_EXPERIENCE_DESCRIPTION_LIMIT = 400;
const REQUEST_TIMEOUT = 15000;

const createLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const JOB_TITLE_SUGGESTIONS = [
  "Software Engineer",
  "Intern Software Engineer",
  "Associate Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile App Developer",
  "Web Developer",
  "QA Engineer",
  "Game Developer",
  "DevOps Engineer",
  "System Administrator",
  "Network Engineer",
  "Cyber Security Analyst",
  "Data Analyst",
  "Business Analyst",
  "Project Manager",
  "Project Coordinator",
  "Product Manager",
  "UI Designer",
  "UX Designer",
  "UI/UX Designer",
  "Graphic Designer",
  "Motion Graphic Designer",
  "Digital Marketing Executive",
  "Digital Marketing Intern",
  "Marketing Executive",
  "Social Media Executive",
  "Content Writer",
  "Copywriter",
  "SEO Specialist",
  "HR Assistant",
  "HR Executive",
  "Recruitment Coordinator",
  "Finance Intern",
  "Finance Executive",
  "Accounting Assistant",
  "Accountant",
  "Operations Executive",
  "Operations Assistant",
  "Customer Support Executive",
  "Customer Service Representative",
  "Business Development Executive",
  "Sales Executive",
  "Management Trainee",
  "Cloud Engineer",
  "Trainee",
  "Research Assistant",
  "Teaching Assistant",
  "Lecturer",
  "Administrative Assistant",
  "Office Assistant",
  "Supply Chain Executive",
  "Logistics Coordinator",
];

const SRI_LANKAN_CITIES = [
  "Colombo",
  "Dehiwala",
  "Mount Lavinia",
  "Moratuwa",
  "Maharagama",
  "Kotte",
  "Battaramulla",
  "Nugegoda",
  "Homagama",
  "Kesbewa",
  "Panadura",
  "Kalutara",
  "Beruwala",
  "Aluthgama",
  "Negombo",
  "Wattala",
  "Ja-Ela",
  "Kadawatha",
  "Gampaha",
  "Minuwangoda",
  "Kandy",
  "Peradeniya",
  "Katugastota",
  "Gampola",
  "Nawalapitiya",
  "Matale",
  "Dambulla",
  "Kurunegala",
  "Kuliyapitiya",
  "Puttalam",
  "Chilaw",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Bandarawela",
  "Ella",
  "Rajagiriya",
  "Monaragala",
  "Ratnapura",
  "Balangoda",
  "Kegalle",
  "Avissawella",
  "Galle",
  "Ambalangoda",
  "Hikkaduwa",
  "Matara",
  "Weligama",
  "Tangalle",
  "Hambantota",
  "Tissamaharama",
  "Jaffna",
  "Kelaniya",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Trincomalee",
  "Batticaloa",
  "Kalmunai",
  "Ampara",
  "Malabe",
  "Nuwara Eliya",
  "Hatton",
  "Kaduwela",
];

const CONTRACT_TYPE_OPTIONS = [
  "Internship",
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Freelance",
  "Traineeship",
  "Apprenticeship",
];

const CURRENCY_OPTIONS = [
  { value: "LKR", label: "Sri Lankan Rupee (LKR)" },
  { value: "USD", label: "United States Dollar ($)" },
];

const REMOTE_WORK_OPTIONS = [
  {
    value: "A few days at home",
    title: "A few days at home",
    description: "Work mainly in the office but can take some remote days.",
  },
  {
    value: "Occasional remote",
    title: "Occasional remote",
    description: "Can work from home a few days a week.",
  },
  {
    value: "Fully-remote",
    title: "Fully-remote",
    description: "Can work fully from home.",
  },
];

const EXPERIENCE_OPTIONS = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
];

const WORK_EXPERIENCE_EMPLOYMENT_TYPES = [
  "Internship",
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Temporary",
  "Traineeship",
  "Volunteer",
];

const EDUCATION_LEVEL_OPTIONS = [
  "High school",
  "Diploma",
  "Certificate",
  "Undergraduate",
  "Bachelor's degree",
  "Postgraduate diploma",
  "Master's degree",
  "Doctorate / PhD",
  "Professional qualification",
  "Bootcamp",
  "Training programme",
];

const SKILL_SUGGESTIONS = [
  "Java",
  "Javascript",
  "TypeScript",
  "Python",
  "C",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Kotlin",
  "Swift",
  "R",
  "SQL",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind CSS",
  "Bootstrap",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Spring Boot",
  "Laravel",
  "Django",
  "Flask",
  "ASP.NET",
  "REST API",
  "GraphQL",
  "MongoDB",
  "MySQL",
  "PostgreSQL",
  "Oracle",
  "SQLite",
  "Microsoft SQL Server",
  "Firebase",
  "Redis",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "GitLab",
  "Bitbucket",
  "Linux",
  "Figma",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Adobe XD",
  "Canva",
  "Draw.io",
  "Postman",
  "Jira",
  "Notion",
  "Slack",
  "WordPress",
  "Shopify",
  "Testing",
  "Unit Testing",
  "Manual Testing",
  "Automation Testing",
  "Selenium",
  "Cypress",
  "UI Design",
  "UX Design",
  "Responsive Design",
  "Wireframing",
  "Prototyping",
  "Data Structures",
  "Algorithms",
  "Problem solving",
  "Creative thinking",
  "Critical thinking",
  "Communication",
  "Leadership",
  "Teamwork",
  "Presentation skills",
  "Public speaking",
  "Time management",
  "Project management",
  "Research",
  "Drawing",
  "Content writing",
  "SEO",
  "Digital Marketing",
  "Business Analysis",
  "Agile",
  "Scrum",
  "Machine Learning",
  "Data Analysis",
  "Power BI",
  "Excel",
  "Runscope",
];

const LANGUAGE_SUGGESTIONS = [
  "English",
  "Sinhala",
  "Tamil",
  "French",
  "German",
  "Spanish",
  "Italian",
  "Portuguese",
  "Dutch",
  "Russian",
  "Arabic",
  "Hindi",
  "Japanese",
  "Chinese",
  "Korean",
  "Malay",
  "Thai",
  "Turkish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Greek",
];

const initialProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  currentPosition: "",
  gender: "",
  profilePicture: null,
  profilePictureName: "",
  isAvailable: false,
  availabilityStatus: "not-available",
};

const initialTargetJob = {
  jobTitle: "",
  desiredLocation: "",
  contractType: "",
  remoteWork: "",
  experienceLevel: "",
  minimumSalary: "",
  currency: "LKR",
  summary: "",
};

const initialExperienceForm = {
  id: null,
  jobTitle: "",
  companyName: "",
  employmentType: "",
  location: "",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
};

const initialEducationForm = {
  id: null,
  title: "",
  level: "",
  institution: "",
  fromDate: "",
  toDate: "",
  currentlyStudying: false,
  projectsInvolved: "",
};

const initialSkills = [];

const initialOtherAssets = {
  linkedin: "",
  github: "",
  website: "",
};

const STATUS_OPTIONS = [
  {
    value: "not-available",
    label: "Not available",
    description: "I don't want to be contacted by recruiters right now.",
    colorClass: "red",
  },
  {
    value: "open-opportunities",
    label: "Open to opportunities",
    description:
      "I'm not actively looking for a job, but I'm open to receive relevant opportunities from recruiters.",
    colorClass: "blue",
  },
  {
    value: "actively-job-hunting",
    label: "Actively job hunting",
    description:
      "I'm actively looking for a job and I'd like to receive new opportunities from recruiters.",
    colorClass: "green",
  },
];

const getStatusOptionByValue = (value) =>
  STATUS_OPTIONS.find((item) => item.value === value) || STATUS_OPTIONS[0];

const isRecruiterVisibleStatus = (value) => value !== "not-available";

const normalizeAvailabilityStatus = (value, isAvailable = false) => {
  if (STATUS_OPTIONS.some((item) => item.value === value)) {
    if (value === "not-available" && isAvailable) {
      return "open-opportunities";
    }
    return value;
  }

  return isAvailable ? "open-opportunities" : "not-available";
};

function formatDisplayValue(value) {
  return value?.trim() ? value : "Not filled";
}

function isProfileComplete(profile) {
  return Boolean(
    profile.firstName.trim() &&
      profile.lastName.trim() &&
      profile.email.trim() &&
      profile.phone.trim() &&
      profile.birthDate.trim() &&
      profile.currentPosition.trim() &&
      profile.gender.trim() &&
      profile.profilePicture
  );
}

function hasAnyTargetJobData(data) {
  return Boolean(
    data.jobTitle.trim() ||
      data.desiredLocation.trim() ||
      data.contractType.trim() ||
      data.remoteWork.trim() ||
      data.experienceLevel.trim() ||
      data.minimumSalary.trim() ||
      data.summary.trim()
  );
}

function hasAnyOtherAssetsData(data) {
  return Boolean(
    data.linkedin.trim() || data.github.trim() || data.website.trim()
  );
}

function getProfileCompletionPercentage({
  profile,
  targetJob,
  workExperiences,
  skills,
  languages,
  educationItems,
  otherAssets,
}) {
  const checks = [
    Boolean(profile.firstName.trim()),
    Boolean(profile.lastName.trim()),
    Boolean(profile.email.trim()),
    Boolean(profile.phone.trim()),
    Boolean(profile.birthDate.trim()),
    Boolean(profile.currentPosition.trim()),
    Boolean(profile.gender.trim()),
    Boolean(profile.profilePicture),
    hasAnyTargetJobData(targetJob),
    workExperiences.length > 0,
    skills.length > 0,
    languages.length > 0,
    educationItems.length > 0,
    hasAnyOtherAssetsData(otherAssets),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}

function getProfileCompletionLabel(percentage) {
  return percentage === 100 ? "Completed" : "Complete your profile";
}

function formatMonthYear(value) {
  if (!value) return "Not filled";

  const [year, month] = value.split("-");
  if (!year || !month) return value;

  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function formatExperienceDateRange(item) {
  if (!item.startDate && !item.endDate && !item.currentlyWorking) {
    return "Not filled";
  }

  const start = item.startDate ? formatMonthYear(item.startDate) : "Not filled";
  const end = item.currentlyWorking
    ? "Present"
    : item.endDate
    ? formatMonthYear(item.endDate)
    : "Not filled";

  return `${start} - ${end}`;
}

function formatEducationDateRange(item) {
  if (!item.fromDate && !item.toDate && !item.currentlyStudying) {
    return "Not filled";
  }

  const start = item.fromDate ? formatMonthYear(item.fromDate) : "Not filled";
  const end = item.currentlyStudying
    ? "Present"
    : item.toDate
    ? formatMonthYear(item.toDate)
    : "Not filled";

  return `${start} - ${end}`;
}

function StatusCard({ statusValue, onStatusChange }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(() =>
    getStatusOptionByValue(statusValue)
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedStatus(getStatusOptionByValue(statusValue));
  }, [statusValue]);

  useEffect(() => {
    localStorage.setItem("myspace-status", selectedStatus.value);
  }, [selectedStatus]);

  return (
    <div className="status-card">
      <h2 className="status-title">My status</h2>

      <p className="status-description">
        Show you're available to receive <span>opportunities</span> from
        companies!
      </p>

      <div className="status-dropdown-wrap" ref={dropdownRef}>
        <button
          className={`status-select ${isDropdownOpen ? "open" : ""}`}
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <div className="status-select-left">
            <span className={`status-dot ${selectedStatus.colorClass}`}></span>
            <span className="status-select-text">{selectedStatus.label}</span>
          </div>

          {isDropdownOpen ? (
            <FaChevronUp className="status-chevron" />
          ) : (
            <FaChevronDown className="status-chevron" />
          )}
        </button>

        {isDropdownOpen ? (
          <div className="status-dropdown-menu">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`status-dropdown-option ${
                  selectedStatus.value === option.value ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedStatus(option);
                  setIsDropdownOpen(false);
                  onStatusChange(option);
                }}
              >
                <div className="status-dropdown-option-top">
                  <span className={`status-dot ${option.colorClass}`}></span>
                  <span className="status-dropdown-option-title">
                    {option.label}
                  </span>
                </div>

                <p className="status-dropdown-option-description">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="status-note">
        <FaBuilding className="status-note-icon" />
        <p>
          Add your education details to make your profile more complete and
          visible to recruiters.
        </p>
      </div>
    </div>
  );
}

function Sidebar({ activeSectionId, onNavigate }) {
  const handleNavClick = (e, id) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <div className="sidebar-card">
      <p className="sidebar-card-title">Personal information</p>

      <nav className="sidebar-nav">
        {sectionData.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleNavClick(e, item.id)}
            className={`sidebar-link ${
              activeSectionId === item.id ? "active" : ""
            }`}
          >
            {item.navLabel}
          </a>
        ))}
      </nav>
    </div>
  );
}

function TopOverviewCard({
  profile,
  targetJob,
  workExperiences,
  skills,
  languages,
  educationItems,
  otherAssets,
}) {
  const navigate = useNavigate();

  const percentage = getProfileCompletionPercentage({
    profile,
    targetJob,
    workExperiences,
    skills,
    languages,
    educationItems,
    otherAssets,
  });

  const label = getProfileCompletionLabel(percentage);
  const progressDegrees = Math.round((percentage / 100) * 360);

  return (
    <div className="panel-card overview-panel">
      <div className="overview-grid">
        <div className="overview-completion-card">
          <div
            className="overview-progress-ring"
            style={{
              "--progress-deg": `${progressDegrees}deg`,
            }}
          >
            <div className="overview-progress-ring-inner">
              <span className="overview-progress-value">{percentage}%</span>
            </div>
          </div>

          <div className="overview-completion-text">
            <h3>{label}</h3>
            <p>
              Track how much of your profile is filled and improve your
              visibility.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="overview-action-card"
          onClick={() => navigate("/student/job-portal/applications")}
        >
          <div className="overview-action-icon">
            <FaRegFileAlt />
          </div>
          <div className="overview-action-text">
            <span>My Applications</span>
            <small>Track the jobs you’ve applied to</small>
          </div>
        </button>

        <button
          type="button"
          className="overview-action-card"
          onClick={() => navigate("/student/job-portal/saved")}
        >
          <div className="overview-action-icon">
            <FaBookmark />
          </div>
          <div className="overview-action-text">
            <span>Saved Jobs</span>
            <small>View and manage your saved opportunities</small>
          </div>
        </button>
      </div>
    </div>
  );
}

function ProfileModal({
  isOpen,
  formData,
  errors,
  onClose,
  onChange,
  onSave,
  onFileChange,
  onDeletePicture,
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const hasPicture = Boolean(formData.profilePicture);

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Personal information</h2>
            <p>Let recruiters reach out.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="profile-form-group full-width">
            <label className="profile-form-label">Profile picture</label>

            <div className="profile-picture-box">
              {!hasPicture ? (
                <div className="profile-picture-empty-state">
                  <h3>Add a file</h3>
                  <p>Drag and drop a file here or...</p>

                  <button
                    type="button"
                    className="profile-picture-choose-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose a file
                  </button>
                </div>
              ) : (
                <div className="profile-picture-filled-state">
                  <img
                    src={formData.profilePicture}
                    alt="Profile preview"
                    className="profile-picture-preview"
                  />

                  <div className="profile-picture-actions">
                    <button
                      type="button"
                      className="profile-picture-icon-btn"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Edit picture"
                    >
                      <FaPencilAlt />
                    </button>

                    <button
                      type="button"
                      className="profile-picture-icon-btn delete"
                      onClick={onDeletePicture}
                      aria-label="Delete picture"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-hidden-file-input"
                onChange={onFileChange}
              />
            </div>

            <p className="profile-form-help">
              Pick a picture below 4 MB in which you look natural and smile.
            </p>

            {errors.profilePicture ? (
              <p className="profile-field-error">{errors.profilePicture}</p>
            ) : null}
          </div>

          <div className="profile-form-group full-width">
            <label className="profile-form-label">Gender</label>

            <div className="profile-gender-row">
              <label className="profile-radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="woman"
                  checked={formData.gender === "woman"}
                  onClick={() => {
                    if (formData.gender === "woman") {
                      onChange("gender", "");
                    }
                  }}
                  onChange={(e) => onChange("gender", e.target.value)}
                />
                <span>I'm a woman</span>
              </label>

              <label className="profile-radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="man"
                  checked={formData.gender === "man"}
                  onClick={() => {
                    if (formData.gender === "man") {
                      onChange("gender", "");
                    }
                  }}
                  onChange={(e) => onChange("gender", e.target.value)}
                />
                <span>I'm a man</span>
              </label>
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label required">First name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                className={errors.firstName ? "input-error" : ""}
              />
              {errors.firstName ? (
                <p className="profile-field-error">{errors.firstName}</p>
              ) : null}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label required">Last name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                className={errors.lastName ? "input-error" : ""}
              />
              {errors.lastName ? (
                <p className="profile-field-error">{errors.lastName}</p>
              ) : null}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label required">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onChange("email", e.target.value)}
                className={errors.email ? "input-error" : ""}
                disabled
              />
              {errors.email ? (
                <p className="profile-field-error">{errors.email}</p>
              ) : null}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Phone</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => onChange("phone", e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Birth date</label>
              <div className="profile-input-icon-wrap">
                <FaCalendarAlt className="profile-input-icon" />
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => onChange("birthDate", e.target.value)}
                />
              </div>
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">Current position</label>
              <input
                type="text"
                placeholder="e.g. Product Designer"
                value={formData.currentPosition}
                onChange={(e) => onChange("currentPosition", e.target.value)}
              />
              <p className="profile-form-help">
                This will appear as your profile headline.
              </p>
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSave}>
            Save
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileSummary({ profile, otherAssets, onEdit }) {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const complete = isProfileComplete(profile);

  return (
    <div className="panel-card profile-panel">
      <div className="profile-top-row">
        <div className="profile-main">
          {profile.profilePicture ? (
            <img
              className="profile-avatar"
              src={profile.profilePicture}
              alt="Profile"
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              {profile.firstName?.trim()?.[0] || "P"}
            </div>
          )}

          <div className="profile-heading-block">
            <div className="profile-name-line">
              <h2>{fullName || "Not filled"}</h2>
              {complete ? (
                <span className="profile-complete-badge">Almost complete</span>
              ) : null}
            </div>

            <p className="profile-headline-empty">
              {profile.currentPosition?.trim()
                ? profile.currentPosition
                : "Profile headline not filled"}
            </p>
          </div>
        </div>

        <button type="button" className="edit-profile-btn" onClick={onEdit}>
          <FaPencilAlt />
          <span>Edit</span>
        </button>
      </div>

      <div className="profile-details-grid two-columns">
        <div className="profile-details-column">
          <div className="profile-detail">
            <FaEnvelope className="profile-detail-icon" />
            <span className="profile-break">
              {formatDisplayValue(profile.email)}
            </span>
          </div>

          <div className={`profile-detail ${profile.birthDate ? "" : "muted"}`}>
            <FaBirthdayCake className="profile-detail-icon" />
            <span>{formatDisplayValue(profile.birthDate)}</span>
          </div>
        </div>

        <div className="profile-details-column">
          <div className={`profile-detail ${profile.phone ? "" : "muted"}`}>
            <FaPhoneAlt className="profile-detail-icon" />
            <span>{formatDisplayValue(profile.phone)}</span>
          </div>

          <div className={`profile-detail ${profile.gender ? "" : "muted"}`}>
            <FaUser className="profile-detail-icon" />
            <span>
              {profile.gender
                ? profile.gender === "woman"
                  ? "Woman"
                  : profile.gender === "man"
                  ? "Man"
                  : formatDisplayValue(profile.gender)
                : "Not filled"}
            </span>
          </div>
        </div>
      </div>

      {hasAnyOtherAssetsData(otherAssets) ? (
        <div className="profile-assets-row">
          {otherAssets.linkedin.trim() ? (
            <a
              href={otherAssets.linkedin}
              target="_blank"
              rel="noreferrer"
              className="profile-asset-link"
            >
              <FaLinkedin />
              <span>LinkedIn</span>
            </a>
          ) : null}

          {otherAssets.github.trim() ? (
            <a
              href={otherAssets.github}
              target="_blank"
              rel="noreferrer"
              className="profile-asset-link"
            >
              <FaGithub />
              <span>GitHub</span>
            </a>
          ) : null}

          {otherAssets.website.trim() ? (
            <a
              href={otherAssets.website}
              target="_blank"
              rel="noreferrer"
              className="profile-asset-link"
            >
              <FaGlobe />
              <span>Website</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function TargetJobModal({
  isOpen,
  formData,
  errors,
  onClose,
  onChange,
  onSave,
  jobTitleSuggestions,
  locationSuggestions,
}) {
  if (!isOpen) return null;

  const characterCount = formData.summary.length;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal target-job-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Target job</h2>
            <p>Tell recruiters more about the kind of job you're looking for.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="target-job-form-grid">
            <div className="profile-form-group full-width">
              <label className="profile-form-label">
                Job title <span className="recommended-pill">Recommended</span>
              </label>
              <input
                type="text"
                list="job-title-suggestions"
                placeholder="e.g. Product Manager"
                value={formData.jobTitle}
                onChange={(e) => onChange("jobTitle", e.target.value)}
                className={errors.jobTitle ? "input-error" : ""}
              />
              <datalist id="job-title-suggestions">
                {jobTitleSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {errors.jobTitle ? (
                <p className="profile-field-error">{errors.jobTitle}</p>
              ) : null}
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">
                Desired work location{" "}
                <span className="recommended-pill">Recommended</span>
              </label>
              <div className="profile-input-icon-wrap">
                <FaMapMarkerAlt className="profile-input-icon" />
                <input
                  type="text"
                  list="sri-lanka-location-suggestions"
                  placeholder="City, region, country"
                  value={formData.desiredLocation}
                  onChange={(e) => onChange("desiredLocation", e.target.value)}
                />
              </div>
              <datalist id="sri-lanka-location-suggestions">
                {locationSuggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Contract type</label>
              <select
                value={formData.contractType}
                onChange={(e) => onChange("contractType", e.target.value)}
                className="target-job-select"
              >
                <option value="">Select</option>
                {CONTRACT_TYPE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">Remote work</label>
              <div className="target-job-checkbox-grid">
                {REMOTE_WORK_OPTIONS.map((item) => (
                  <label key={item.value} className="target-job-checkbox-card">
                    <input
                      type="checkbox"
                      checked={formData.remoteWork === item.value}
                      onChange={() =>
                        onChange(
                          "remoteWork",
                          formData.remoteWork === item.value ? "" : item.value
                        )
                      }
                    />
                    <div>
                      <span className="target-job-checkbox-title">
                        {item.title}
                      </span>
                      <p>{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">
                Level of experience{" "}
                <span className="recommended-pill">Recommended</span>
              </label>
              <div className="target-job-experience-row">
                {EXPERIENCE_OPTIONS.map((item) => (
                  <label key={item} className="target-job-experience-option">
                    <input
                      type="checkbox"
                      checked={formData.experienceLevel === item}
                      onChange={() =>
                        onChange(
                          "experienceLevel",
                          formData.experienceLevel === item ? "" : item
                        )
                      }
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Minimum gross salary a month
              </label>
              <div className="profile-input-icon-wrap">
                <FaMoneyBillWave className="profile-input-icon" />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Example: 40000"
                  value={formData.minimumSalary}
                  onChange={(e) => onChange("minimumSalary", e.target.value)}
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => onChange("currency", e.target.value)}
                className="target-job-select"
              >
                {CURRENCY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">
                Share what you are looking for with your own words
              </label>
              <textarea
                className={`target-job-textarea ${
                  errors.summary ? "input-error" : ""
                }`}
                placeholder="Describe your drivers, what you are looking for."
                value={formData.summary}
                onChange={(e) => onChange("summary", e.target.value)}
                rows={5}
              />
              {formData.summary.length > 0 ? (
                <p className="profile-form-help target-job-word-count">
                  {characterCount}/{TARGET_JOB_CHARACTER_LIMIT} characters
                </p>
              ) : null}
              {errors.summary ? (
                <p className="profile-field-error">{errors.summary}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSave}>
            Save
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryTag({ icon = null, text }) {
  return (
    <span className="target-job-summary-tag">
      {icon ? <span className="target-job-summary-tag-icon">{icon}</span> : null}
      <span>{text}</span>
    </span>
  );
}

function TargetJobSection({ data, onEdit }) {
  const hasData = hasAnyTargetJobData(data);

  return (
    <section id="target-job" className="info-card target-job-summary-card">
      {!hasData ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Target job</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>
              Tell recruiters more about the kind of job you're looking for.
            </p>
          </div>

          <button type="button" className="add-btn" onClick={onEdit}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Target job</h2>
              </div>
              <p className="target-job-summary-subtitle">
                Tell recruiters more about the kind of job you're looking for.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onEdit}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="target-job-summary-grid">
            <div className="target-job-summary-label">Job title</div>
            <div className="target-job-summary-value">
              {data.jobTitle.trim() ? (
                <SummaryTag text={data.jobTitle} />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label">Desired work location</div>
            <div className="target-job-summary-value">
              {data.desiredLocation.trim() ? (
                <SummaryTag
                  icon={<FaMapMarkerAlt />}
                  text={data.desiredLocation}
                />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label">Contract type</div>
            <div className="target-job-summary-value">
              {data.contractType.trim() ? (
                <SummaryTag icon={<FaBriefcase />} text={data.contractType} />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label">Remote work</div>
            <div className="target-job-summary-value">
              {data.remoteWork.trim() ? (
                <SummaryTag icon={<FaLaptopHouse />} text={data.remoteWork} />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label">Level of experience</div>
            <div className="target-job-summary-value">
              {data.experienceLevel.trim() ? (
                <SummaryTag text={data.experienceLevel} />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label">Minimum salary</div>
            <div className="target-job-summary-value">
              {data.minimumSalary.trim() ? (
                <SummaryTag
                  icon={<FaMoneyBillWave />}
                  text={`${data.currency} ${Number(
                    data.minimumSalary
                  ).toLocaleString()} gross a month`}
                />
              ) : (
                "Not filled"
              )}
            </div>

            <div className="target-job-summary-label target-job-summary-long-label">
              Share what you are looking for with your own words
            </div>
            <div className="target-job-summary-value target-job-summary-text">
              {formatDisplayValue(data.summary)}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function WorkExperienceModal({
  isOpen,
  experiences,
  formData,
  errors,
  editingId,
  isFormVisible,
  onClose,
  onChange,
  onSaveExperience,
  onEditExperience,
  onDeleteExperience,
  onStartNew,
  onSaveAll,
  jobTitleSuggestions,
  locationSuggestions,
}) {
  if (!isOpen) return null;

  const isEditing = editingId !== null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal work-experience-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Work experience</h2>
            <p>
              Tell recruiters more about your past and current experiences,
              projects.
            </p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {experiences.length > 0 ? (
            <div className="work-experience-saved-list">
              <div className="work-experience-saved-list-header">
                <h3>Added experiences</h3>
                <button
                  type="button"
                  className="work-experience-add-another-btn"
                  onClick={onStartNew}
                >
                  <FaPlus />
                  <span>Add another</span>
                </button>
              </div>

              <div className="work-experience-saved-items">
                {experiences.map((item) => (
                  <div key={item.id} className="work-experience-saved-item">
                    <div className="work-experience-saved-item-main">
                      <h4>{item.jobTitle || "Not filled"}</h4>
                      <p>{item.companyName || "Not filled"}</p>
                      <span>{formatExperienceDateRange(item)}</span>
                    </div>

                    <div className="work-experience-saved-item-actions">
                      <button
                        type="button"
                        className="profile-picture-icon-btn"
                        onClick={() => onEditExperience(item.id)}
                        aria-label="Edit experience"
                      >
                        <FaPencilAlt />
                      </button>

                      <button
                        type="button"
                        className="profile-picture-icon-btn delete"
                        onClick={() => onDeleteExperience(item.id)}
                        aria-label="Delete experience"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isFormVisible ? (
            <div className="work-experience-form-card">
              <div className="work-experience-form-header">
                <h3>
                  {isEditing ? "Edit work experience" : "Add work experience"}
                </h3>
                <p>Fill in the details below.</p>
              </div>

              <div className="target-job-form-grid">
                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Job title <span className="recommended-pill">Required</span>
                  </label>
                  <input
                    type="text"
                    list="work-job-title-suggestions"
                    placeholder="e.g. Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => onChange("jobTitle", e.target.value)}
                    className={errors.jobTitle ? "input-error" : ""}
                  />
                  <datalist id="work-job-title-suggestions">
                    {jobTitleSuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  {errors.jobTitle ? (
                    <p className="profile-field-error">{errors.jobTitle}</p>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Company name <span className="recommended-pill">Required</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WSO2"
                    value={formData.companyName}
                    onChange={(e) => onChange("companyName", e.target.value)}
                    className={errors.companyName ? "input-error" : ""}
                  />
                  {errors.companyName ? (
                    <p className="profile-field-error">{errors.companyName}</p>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Location</label>
                  <input
                    type="text"
                    list="work-location-suggestions"
                    placeholder="City, region, country"
                    value={formData.location}
                    onChange={(e) => onChange("location", e.target.value)}
                  />
                  <datalist id="work-location-suggestions">
                    {locationSuggestions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Employment type <span className="recommended-pill">Required</span>
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => onChange("employmentType", e.target.value)}
                    className="target-job-select"
                  >
                    <option value="">Select</option>
                    {WORK_EXPERIENCE_EMPLOYMENT_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType ? (
                    <p className="profile-field-error">{errors.employmentType}</p>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    Start date <span className="recommended-pill">Required</span>
                  </label>
                  <input
                    type="month"
                    max={CURRENT_MONTH}
                    value={formData.startDate}
                    onChange={(e) => onChange("startDate", e.target.value)}
                    className={errors.startDate ? "input-error" : ""}
                  />
                  {errors.startDate ? (
                    <p className="profile-field-error">{errors.startDate}</p>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    End date {!formData.currentlyWorking ? <span className="recommended-pill">Required</span> : null}
                  </label>
                  <input
                    type="month"
                    min={formData.startDate || ""}
                    max={CURRENT_MONTH}
                    value={formData.endDate}
                    onChange={(e) => onChange("endDate", e.target.value)}
                    disabled={formData.currentlyWorking}
                    className={errors.endDate ? "input-error" : ""}
                  />
                  {errors.endDate ? (
                    <p className="profile-field-error">{errors.endDate}</p>
                  ) : null}
                </div>

                <div className="profile-form-group full-width">
                  <label className="profile-radio-option">
                    <input
                      type="checkbox"
                      checked={formData.currentlyWorking}
                      onChange={(e) => onChange("currentlyWorking", e.target.checked)}
                    />
                    <span>I currently work here</span>
                  </label>
                </div>

                <div className="profile-form-group full-width">
                  <label className="profile-form-label">Description</label>
                  <textarea
                    className="target-job-textarea"
                    placeholder="Describe your responsibilities and achievements."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => onChange("description", e.target.value)}
                  />
                  {formData.description.length > 0 ? (
                    <p className="profile-form-help target-job-word-count">
                      {formData.description.length}/{WORK_EXPERIENCE_DESCRIPTION_LIMIT} characters
                    </p>
                  ) : null}
                </div>

                <div className="work-experience-form-actions">
                  <button
                    type="button"
                    className="modal-save-btn work-experience-primary-btn"
                    onClick={onSaveExperience}
                  >
                    {isEditing ? "Update" : "Add experience"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSaveAll}>
            Save all
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkExperienceSection({ experiences, onOpen }) {
  const hasItems = experiences.length > 0;

  return (
    <section id="work-experience" className="info-card target-job-summary-card">
      {!hasItems ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Work experience</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>
              Tell recruiters more about your past and current experiences,
              projects.
            </p>
          </div>

          <button type="button" className="add-btn" onClick={onOpen}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Work experience</h2>
              </div>
              <p className="target-job-summary-subtitle">
                Tell recruiters more about your past and current experiences,
                projects.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onOpen}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="work-experience-summary-list">
            {experiences.map((item) => (
              <div key={item.id} className="work-experience-summary-item">
                <div className="work-experience-summary-topline">
                  <h4>{item.jobTitle || "Not filled"}</h4>
                  <span>{formatExperienceDateRange(item)}</span>
                </div>
                <p className="work-experience-summary-company">
                  {item.companyName || "Not filled"}
                </p>
                {item.location || item.employmentType ? (
                  <p className="work-experience-summary-meta">
                    {[item.location, item.employmentType].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                {item.description ? (
                  <p className="work-experience-summary-description">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SkillsExpertiseModal({
  isOpen,
  searchValue,
  selectedSkills,
  filteredSuggestions,
  onClose,
  onSearchChange,
  onAddSkill,
  onRemoveSkill,
  onSave,
  showSuggestions,
}) {
  if (!isOpen) return null;

  const hasSkills = selectedSkills.length > 0;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal skills-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Skills & expertise</h2>
            <p>Highlight the skills and expertise that make you unique.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body skills-modal-body">
          <div className="profile-form-group full-width">
            <label className="profile-form-label">Search for skills</label>
            <input
              type="text"
              placeholder="Example: Figma"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="skills-search-input"
            />
          </div>

          <div className="skills-modal-section-title">ALL SKILLS</div>

          {!hasSkills ? (
            <div className="skills-empty-state">
              <div className="skills-empty-illustration">
                <div className="skills-empty-illustration-box">
                  <span>{`</>`}</span>
                </div>
              </div>

              <h3>Start building your list of skills</h3>
              <p>Search and select skills to add them to your list.</p>
            </div>
          ) : (
            <div className="skills-selected-list">
              {selectedSkills.map((skill) => (
                <div key={skill} className="skills-selected-item">
                  <span>{skill}</span>
                  <button
                    type="button"
                    className="skills-remove-btn"
                    onClick={() => onRemoveSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSuggestions && filteredSuggestions.length > 0 ? (
            <div className="skills-suggestions-dropdown">
              {filteredSuggestions.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="skills-suggestion-item"
                  onClick={() => onAddSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSave}>
            Save
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillsExpertiseSection({ skills, onOpen }) {
  const hasSkills = skills.length > 0;

  return (
    <section id="skills-expertise" className="info-card target-job-summary-card">
      {!hasSkills ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Skills & expertise</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>Highlight the skills and expertise that make you unique.</p>
          </div>

          <button type="button" className="add-btn" onClick={onOpen}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Skills & expertise</h2>
              </div>
              <p className="target-job-summary-subtitle">
                Highlight the skills and expertise that make you unique.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onOpen}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="skills-summary-list">
            {skills.map((skill) => (
              <span key={skill} className="skills-summary-chip">
                {skill}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function LanguagesModal({
  isOpen,
  searchValue,
  selectedLanguages,
  filteredSuggestions,
  onClose,
  onSearchChange,
  onAddLanguage,
  onRemoveLanguage,
  onSave,
  showSuggestions,
}) {
  if (!isOpen) return null;

  const hasLanguages = selectedLanguages.length > 0;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal languages-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Languages</h2>
            <p>Let recruiters know which languages you can use professionally.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body languages-modal-body">
          <div className="profile-form-group full-width">
            <label className="profile-form-label">Search for languages</label>
            <input
              type="text"
              placeholder="Example: English"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="languages-search-input"
            />
          </div>

          <div className="languages-modal-section-title">ALL LANGUAGES</div>

          {!hasLanguages ? (
            <div className="languages-empty-state">
              <div className="languages-empty-illustration">
                <div className="languages-empty-illustration-bubble">
                  <span>Aa</span>
                </div>
              </div>

              <h3>Show the languages you speak and write</h3>
              <p>Search and select languages to add them to your profile.</p>
            </div>
          ) : (
            <div className="languages-selected-list">
              {selectedLanguages.map((language) => (
                <div key={language} className="languages-selected-item">
                  <span>{language}</span>
                  <button
                    type="button"
                    className="languages-remove-btn"
                    onClick={() => onRemoveLanguage(language)}
                    aria-label={`Remove ${language}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSuggestions && filteredSuggestions.length > 0 ? (
            <div className="languages-suggestions-dropdown">
              {filteredSuggestions.map((language) => (
                <button
                  key={language}
                  type="button"
                  className="languages-suggestion-item"
                  onClick={() => onAddLanguage(language)}
                >
                  {language}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSave}>
            Save
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function LanguagesSection({ languages, onOpen }) {
  const hasLanguages = languages.length > 0;

  return (
    <section id="languages" className="info-card target-job-summary-card">
      {!hasLanguages ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Languages</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>
              Let recruiters know which languages you can use professionally.
            </p>
          </div>

          <button type="button" className="add-btn" onClick={onOpen}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Languages</h2>
              </div>
              <p className="target-job-summary-subtitle">
                Let recruiters know which languages you can use professionally.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onOpen}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="skills-summary-list">
            {languages.map((language) => (
              <span key={language} className="skills-summary-chip">
                {language}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EducationQualificationsModal({
  isOpen,
  educations,
  formData,
  errors,
  editingId,
  isFormVisible,
  onClose,
  onChange,
  onSaveEducation,
  onEditEducation,
  onDeleteEducation,
  onStartNew,
  onSaveAll,
}) {
  if (!isOpen) return null;

  const isEditing = editingId !== null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal education-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Education & qualifications</h2>
            <p>List your relevant education, training and certificates.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          {educations.length > 0 ? (
            <div className="work-experience-saved-list">
              <div className="work-experience-saved-list-header">
                <h3>Added education items</h3>
                <button
                  type="button"
                  className="work-experience-add-another-btn"
                  onClick={onStartNew}
                >
                  <FaPlus />
                  <span>Add another</span>
                </button>
              </div>

              <div className="work-experience-saved-items">
                {educations.map((item) => (
                  <div key={item.id} className="work-experience-saved-item">
                    <div className="work-experience-saved-item-main">
                      <h4>{item.title || "Not filled"}</h4>
                      <p>{item.institution || "Not filled"}</p>
                      <span>{formatEducationDateRange(item)}</span>
                    </div>

                    <div className="work-experience-saved-item-actions">
                      <button
                        type="button"
                        className="profile-picture-icon-btn"
                        onClick={() => onEditEducation(item.id)}
                        aria-label="Edit education"
                      >
                        <FaPencilAlt />
                      </button>

                      <button
                        type="button"
                        className="profile-picture-icon-btn delete"
                        onClick={() => onDeleteEducation(item.id)}
                        aria-label="Delete education"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isFormVisible ? (
            <div className="work-experience-form-card">
              <div className="work-experience-form-header">
                <h3>
                  {isEditing
                    ? "Edit education item"
                    : "Add education item"}
                </h3>
                <p>Fill in the details below.</p>
              </div>

              <div className="target-job-form-grid">
                <div className="profile-form-group full-width">
                  <label className="profile-form-label">
                    Title <span className="recommended-pill">Required</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BSc (Hons) in Information Technology"
                    value={formData.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    className={errors.title ? "input-error" : ""}
                  />
                  {errors.title ? (
                    <p className="profile-field-error">{errors.title}</p>
                  ) : null}
                </div>

                 <div className="profile-form-group">
                   <label className="profile-form-label">
                     Level <span className="recommended-pill">Required</span>
                  </label>
  <select
    value={formData.level}
    onChange={(e) => onChange("level", e.target.value)}
    className={errors.level ? "target-job-select input-error" : "target-job-select"}
  >
    <option value="">Select</option>
    {EDUCATION_LEVEL_OPTIONS.map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
  </select>
  {errors.level ? (
    <p className="profile-field-error">{errors.level}</p>
  ) : null}
</div>

                <div className="profile-form-group">
  <label className="profile-form-label">
    Institution <span className="recommended-pill">Required</span>
  </label>
  <input
    type="text"
    placeholder="e.g. SLIIT"
    value={formData.institution}
    onChange={(e) => onChange("institution", e.target.value)}
    className={errors.institution ? "input-error" : ""}
  />
  {errors.institution ? (
    <p className="profile-field-error">{errors.institution}</p>
  ) : null}
</div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    From <span className="recommended-pill">Required</span>
                  </label>
                  <input
                    type="month"
                    max={CURRENT_MONTH}
                    value={formData.fromDate}
                    onChange={(e) => onChange("fromDate", e.target.value)}
                    className={errors.fromDate ? "input-error" : ""}
                  />
                  {errors.fromDate ? (
                    <p className="profile-field-error">{errors.fromDate}</p>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">
                    To {!formData.currentlyStudying ? <span className="recommended-pill">Required</span> : null}
                  </label>
                  <input
                    type="month"
                    min={formData.fromDate || ""}
                    max={CURRENT_MONTH}
                    value={formData.toDate}
                    onChange={(e) => onChange("toDate", e.target.value)}
                    disabled={formData.currentlyStudying}
                    className={errors.toDate ? "input-error" : ""}
                  />
                  {errors.toDate ? (
                    <p className="profile-field-error">{errors.toDate}</p>
                  ) : null}
                </div>

                <div className="profile-form-group full-width">
                  <label className="profile-radio-option">
                    <input
                      type="checkbox"
                      checked={formData.currentlyStudying}
                      onChange={(e) => onChange("currentlyStudying", e.target.checked)}
                    />
                    <span>I’m still studying here</span>
                  </label>
                </div>

                <div className="profile-form-group full-width">
                  <label className="profile-form-label">Projects involved</label>
                  <textarea
                    className="target-job-textarea"
                    placeholder="Describe coursework, projects or activities."
                    rows={5}
                    value={formData.projectsInvolved}
                    onChange={(e) => onChange("projectsInvolved", e.target.value)}
                  />
                </div>

                <div className="work-experience-form-actions">
                  <button
                    type="button"
                    className="modal-save-btn work-experience-primary-btn"
                    onClick={onSaveEducation}
                  >
                    {isEditing ? "Update" : "Add education"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSaveAll}>
            Save all
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function EducationQualificationsSection({ educationItems, onOpen }) {
  const hasItems = educationItems.length > 0;

  return (
    <section
      id="education-qualifications"
      className="info-card target-job-summary-card"
    >
      {!hasItems ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Education & qualifications</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>List your relevant education, training and certificates.</p>
          </div>

          <button type="button" className="add-btn" onClick={onOpen}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Education & qualifications</h2>
              </div>
              <p className="target-job-summary-subtitle">
                List your relevant education, training and certificates.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onOpen}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="work-experience-summary-list">
            {educationItems.map((item) => (
              <div key={item.id} className="work-experience-summary-item">
                <div className="work-experience-summary-topline">
                  <h4>{item.title || "Not filled"}</h4>
                  <span>{formatEducationDateRange(item)}</span>
                </div>
                <p className="work-experience-summary-company">
                  {item.institution || "Not filled"}
                </p>
                {item.level ? (
                  <p className="work-experience-summary-meta">{item.level}</p>
                ) : null}
                {item.projectsInvolved ? (
                  <p className="work-experience-summary-description">
                    {item.projectsInvolved}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function OtherAssetsModal({
  isOpen,
  formData,
  errors,
  onClose,
  onChange,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal target-job-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Other assets</h2>
            <p>Add links to support and accelerate your applications.</p>
          </div>

          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="profile-modal-body">
          <div className="target-job-form-grid">
            <div className="profile-form-group full-width">
              <label className="profile-form-label">LinkedIn</label>
              <div className="profile-input-icon-wrap">
                <FaLinkedin className="profile-input-icon" />
                <input
                  type="url"
                  placeholder="https://www.linkedin.com/in/your-profile"
                  value={formData.linkedin}
                  onChange={(e) => onChange("linkedin", e.target.value)}
                  className={errors.linkedin ? "input-error" : ""}
                />
              </div>
              {errors.linkedin ? (
                <p className="profile-field-error">{errors.linkedin}</p>
              ) : null}
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">GitHub</label>
              <div className="profile-input-icon-wrap">
                <FaGithub className="profile-input-icon" />
                <input
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={formData.github}
                  onChange={(e) => onChange("github", e.target.value)}
                  className={errors.github ? "input-error" : ""}
                />
              </div>
              {errors.github ? (
                <p className="profile-field-error">{errors.github}</p>
              ) : null}
            </div>

            <div className="profile-form-group full-width">
              <label className="profile-form-label">Website / Portfolio</label>
              <div className="profile-input-icon-wrap">
                <FaGlobe className="profile-input-icon" />
                <input
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={formData.website}
                  onChange={(e) => onChange("website", e.target.value)}
                  className={errors.website ? "input-error" : ""}
                />
              </div>
              {errors.website ? (
                <p className="profile-field-error">{errors.website}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button type="button" className="modal-save-btn" onClick={onSave}>
            Save
          </button>
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function OtherAssetsSection({ data, onOpen }) {
  const hasData = hasAnyOtherAssetsData(data);

  return (
    <section id="other-assets" className="info-card target-job-summary-card">
      {!hasData ? (
        <div className="target-job-empty-wrap">
          <div className="info-card-content">
            <div className="info-card-title-row">
              <h2>Other assets</h2>
              <span className="status-badge-soft">Not started</span>
            </div>
            <p>Add links to support and accelerate your applications.</p>
          </div>

          <button type="button" className="add-btn" onClick={onOpen}>
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      ) : (
        <>
          <div className="target-job-summary-top">
            <div>
              <div className="info-card-title-row">
                <h2>Other assets</h2>
              </div>
              <p className="target-job-summary-subtitle">
                Add links to support and accelerate your applications.
              </p>
            </div>

            <button type="button" className="edit-profile-btn" onClick={onOpen}>
              <FaPencilAlt />
              <span>Edit</span>
            </button>
          </div>

          <div className="profile-assets-row profile-assets-row-reset">
            {data.linkedin.trim() ? (
              <a
                href={data.linkedin}
                target="_blank"
                rel="noreferrer"
                className="profile-asset-link"
              >
                <FaLinkedin />
                <span>LinkedIn</span>
              </a>
            ) : null}

            {data.github.trim() ? (
              <a
                href={data.github}
                target="_blank"
                rel="noreferrer"
                className="profile-asset-link"
              >
                <FaGithub />
                <span>GitHub</span>
              </a>
            ) : null}

            {data.website.trim() ? (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="profile-asset-link"
              >
                <FaGlobe />
                <span>Website</span>
              </a>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function SectionCard({ id, title, description }) {
  return (
    <section id={id} className="info-card">
      <div className="info-card-content">
        <div className="info-card-title-row">
          <h2>{title}</h2>
          <span className="status-badge-soft">Not started</span>
        </div>
        <p>{description}</p>
      </div>

      <button type="button" className="add-btn">
        <FaPlus />
        <span>Add</span>
      </button>
    </section>
  );
}

export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const loggedEmail = user?.email || "";
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const manualNavLockUntilRef = useRef(0);
  const rightPaneRef = useRef(null);

  const [activeSectionId, setActiveSectionId] = useState("");
  const [profile, setProfile] = useState({ ...initialProfile, email: loggedEmail });
  const [formData, setFormData] = useState({ ...initialProfile, email: loggedEmail });
  const [formErrors, setFormErrors] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [targetJob, setTargetJob] = useState(initialTargetJob);
  const [targetJobForm, setTargetJobForm] = useState(initialTargetJob);
  const [targetJobErrors, setTargetJobErrors] = useState({});
  const [isTargetJobModalOpen, setIsTargetJobModalOpen] = useState(false);

  const [workExperiences, setWorkExperiences] = useState([]);
  const [workExperienceDraft, setWorkExperienceDraft] = useState([]);
  const [workExperienceForm, setWorkExperienceForm] =
    useState(initialExperienceForm);
  const [workExperienceErrors, setWorkExperienceErrors] = useState({});
  const [isWorkExperienceModalOpen, setIsWorkExperienceModalOpen] =
    useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [isWorkExperienceFormVisible, setIsWorkExperienceFormVisible] =
    useState(true);

  const [educationItems, setEducationItems] = useState([]);
  const [educationDraft, setEducationDraft] = useState([]);
  const [educationForm, setEducationForm] = useState(initialEducationForm);
  const [educationErrors, setEducationErrors] = useState({});
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [isEducationFormVisible, setIsEducationFormVisible] = useState(true);

  const [skills, setSkills] = useState(initialSkills);
  const [skillsDraft, setSkillsDraft] = useState(initialSkills);
  const [skillsSearch, setSkillsSearch] = useState("");
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const [languages, setLanguages] = useState([]);
  const [languagesDraft, setLanguagesDraft] = useState([]);
  const [languagesSearch, setLanguagesSearch] = useState("");
  const [isLanguagesModalOpen, setIsLanguagesModalOpen] = useState(false);

  const [otherAssets, setOtherAssets] = useState(initialOtherAssets);
  const [otherAssetsForm, setOtherAssetsForm] = useState(initialOtherAssets);
  const [otherAssetsErrors, setOtherAssetsErrors] = useState({});
  const [isOtherAssetsModalOpen, setIsOtherAssetsModalOpen] = useState(false);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingTargetJob, setIsSavingTargetJob] = useState(false);
  const [isSavingWorkExperiences, setIsSavingWorkExperiences] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [isSavingLanguages, setIsSavingLanguages] = useState(false);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [isSavingOtherAssets, setIsSavingOtherAssets] = useState(false);

  const persistProfile = async (payload) => {
    return await axios.put("http://localhost:5000/api/uni/students/profile", payload, {
      timeout: REQUEST_TIMEOUT,
    });
  };

  useEffect(() => {
    return () => {
      if (profile.profilePicture?.startsWith("blob:")) {
        URL.revokeObjectURL(profile.profilePicture);
      }
    };
  }, [profile.profilePicture]);

  const handleStatusChange = async (nextStatusOption) => {
    const nextAvailabilityStatus = nextStatusOption.value;
    const nextIsAvailable = isRecruiterVisibleStatus(nextAvailabilityStatus);
    const previousAvailabilityStatus = profile.availabilityStatus;
    const previousIsAvailable = profile.isAvailable;

    localStorage.setItem("myspace-status", nextAvailabilityStatus);
    setProfile((prev) => ({
      ...prev,
      availabilityStatus: nextAvailabilityStatus,
      isAvailable: nextIsAvailable,
    }));

    try {
      await persistProfile({
        availabilityStatus: nextAvailabilityStatus,
        isAvailable: nextIsAvailable,
      });
    } catch (error) {
      console.error("Failed to update availability status:", error);
      localStorage.setItem("myspace-status", previousAvailabilityStatus);
      setProfile((prev) => ({
        ...prev,
        availabilityStatus: previousAvailabilityStatus,
        isAvailable: previousIsAvailable,
      }));
    }
  };

  const handleSidebarNavigate = (id) => {
    const section = document.getElementById(id);
    if (!section) return;

    manualNavLockUntilRef.current = Date.now() + PROFILE_MANUAL_NAV_LOCK_MS;
    setActiveSectionId(id);

    const rightPane = rightPaneRef.current;
    const usesRightPaneScroll =
      rightPane && window.matchMedia("(min-width: 993px)").matches;

    if (usesRightPaneScroll) {
      const top =
        section.getBoundingClientRect().top -
        rightPane.getBoundingClientRect().top +
        rightPane.scrollTop;

      rightPane.scrollTo({
        top: Math.max(0, top),
        behavior: "auto",
      });
      return;
    }

    const top =
      section.getBoundingClientRect().top + window.scrollY - PROFILE_NAV_SCROLL_OFFSET;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "auto",
    });
  };

  useEffect(() => {
    if (isProfileLoading) return undefined;

    let ticking = false;

    const updateActiveSection = () => {
      if (Date.now() < manualNavLockUntilRef.current) {
        ticking = false;
        return;
      }

      const rightPane = rightPaneRef.current;
      const usesRightPaneScroll =
        rightPane && window.matchMedia("(min-width: 993px)").matches;
      const activationLine = usesRightPaneScroll
        ? rightPane.getBoundingClientRect().top +
          Math.min(PROFILE_ACTIVE_LINE_OFFSET, rightPane.clientHeight * 0.28)
        : PROFILE_ACTIVE_LINE_OFFSET;

      const sections = sectionData
        .map((section) => {
          const element = document.getElementById(section.id);
          if (!element) return null;

          return {
            id: section.id,
            top: element.getBoundingClientRect().top,
          };
        })
        .filter(Boolean);

      if (!sections.length) {
        ticking = false;
        return;
      }

      let nextActiveSectionId = "";

      const isAtRightPaneBottom =
        usesRightPaneScroll &&
        rightPane.scrollTop + rightPane.clientHeight >= rightPane.scrollHeight - 4;

      if (isAtRightPaneBottom) {
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

      setActiveSectionId((prev) =>
        prev === nextActiveSectionId ? prev : nextActiveSectionId
      );
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    const rightPane = rightPaneRef.current;

    window.addEventListener("scroll", handleScroll, { passive: true });
    rightPane?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      rightPane?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isProfileLoading]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/uni/students/profile");
        const data = response.data || {};
        const savedStatus = localStorage.getItem("myspace-status");
        const backendStatus = normalizeAvailabilityStatus(
          data.availabilityStatus,
          data.isAvailable
        );
        const resolvedAvailabilityStatus = data.availabilityStatus
          ? backendStatus
          : normalizeAvailabilityStatus(savedStatus, data.isAvailable);
        const resolvedIsAvailable = isRecruiterVisibleStatus(
          resolvedAvailabilityStatus
        );

        const loadedProfile = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: loggedEmail || data.email || "",
          phone: data.phone || "",
          birthDate: data.birthDate || "",
          currentPosition: data.currentPosition || "",
          gender: data.gender || "",
          profilePicture: data.profilePicture || null,
          profilePictureName: data.profilePictureName || "",
          availabilityStatus: resolvedAvailabilityStatus,
          isAvailable: resolvedIsAvailable,
        };

        const normalizedWorkExperiences = (data.workExperiences || []).map(
          (item) => ({
            ...item,
            id: item.id || item._id || createLocalId(),
          })
        );

        const normalizedEducationItems = (data.educationItems || []).map(
          (item) => ({
            ...item,
            id: item.id || item._id || createLocalId(),
          })
        );

        const normalizedTargetJob = { ...initialTargetJob, ...(data.targetJob || {}) };
        const normalizedOtherAssets = { ...initialOtherAssets, ...(data.otherAssets || {}) };

        setProfile(loadedProfile);
        setFormData(loadedProfile);
        setTargetJob(normalizedTargetJob);
        setTargetJobForm({ ...normalizedTargetJob });
        setWorkExperiences(normalizedWorkExperiences);
        setWorkExperienceDraft(normalizedWorkExperiences.map((item) => ({ ...item })));
        setSkills(data.skills || []);
        setSkillsDraft([...(data.skills || [])]);
        setLanguages(data.languages || []);
        setLanguagesDraft([...(data.languages || [])]);
        setEducationItems(normalizedEducationItems);
        setEducationDraft(normalizedEducationItems.map((item) => ({ ...item })));
        setOtherAssets(normalizedOtherAssets);
        setOtherAssetsForm({ ...normalizedOtherAssets });

        if (
          resolvedAvailabilityStatus !== backendStatus ||
          resolvedIsAvailable !== Boolean(data.isAvailable)
        ) {
          await persistProfile({
            availabilityStatus: resolvedAvailabilityStatus,
            isAvailable: resolvedIsAvailable,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfile();
  }, [loggedEmail]);

  const filteredJobTitles = useMemo(() => {
    const query = targetJobForm.jobTitle.trim().toLowerCase();
    if (!query) return JOB_TITLE_SUGGESTIONS;
    return JOB_TITLE_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [targetJobForm.jobTitle]);

  const filteredLocations = useMemo(() => {
    const query = targetJobForm.desiredLocation.trim().toLowerCase();
    if (!query) return SRI_LANKAN_CITIES;
    return SRI_LANKAN_CITIES.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [targetJobForm.desiredLocation]);

  const filteredWorkExperienceJobTitles = useMemo(() => {
    const query = workExperienceForm.jobTitle.trim().toLowerCase();
    if (!query) return JOB_TITLE_SUGGESTIONS;
    return JOB_TITLE_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [workExperienceForm.jobTitle]);

  const filteredWorkExperienceLocations = useMemo(() => {
    const query = workExperienceForm.location.trim().toLowerCase();
    if (!query) return SRI_LANKAN_CITIES;
    return SRI_LANKAN_CITIES.filter((item) =>
      item.toLowerCase().includes(query)
    );
  }, [workExperienceForm.location]);

  const filteredSkillSuggestions = useMemo(() => {
    const query = skillsSearch.trim().toLowerCase();

    const availableSkills = SKILL_SUGGESTIONS.filter(
      (item) => !skillsDraft.includes(item)
    );

    if (!query) {
      return availableSkills.slice(0, 12);
    }

    return availableSkills
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 12);
  }, [skillsSearch, skillsDraft]);

  const filteredLanguageSuggestions = useMemo(() => {
    const query = languagesSearch.trim().toLowerCase();

    const availableLanguages = LANGUAGE_SUGGESTIONS.filter(
      (item) => !languagesDraft.includes(item)
    );

    if (!query) {
      return availableLanguages.slice(0, 12);
    }

    return availableLanguages
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 12);
  }, [languagesSearch, languagesDraft]);

  const isValidUrl = (value) => {
    if (!value.trim()) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const openProfileModal = () => {
    setFormData({
      ...profile,
      email: loggedEmail,
    });
    setFormErrors({});
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setFormData({
      ...profile,
      email: loggedEmail,
    });
    setFormErrors({});
    setIsProfileModalOpen(false);
  };

  const openTargetJobModal = () => {
    setTargetJobForm({ ...targetJob });
    setTargetJobErrors({});
    setIsTargetJobModalOpen(true);
  };

  const closeTargetJobModal = () => {
    setTargetJobForm({ ...targetJob });
    setTargetJobErrors({});
    setIsTargetJobModalOpen(false);
  };

  const openWorkExperienceModal = () => {
    setWorkExperienceDraft(workExperiences.map((item) => ({ ...item })));
    setWorkExperienceForm(initialExperienceForm);
    setWorkExperienceErrors({});
    setEditingExperienceId(null);
    setIsWorkExperienceFormVisible(workExperiences.length === 0);
    setIsWorkExperienceModalOpen(true);
  };

  const closeWorkExperienceModal = () => {
    setWorkExperienceDraft(workExperiences.map((item) => ({ ...item })));
    setWorkExperienceForm(initialExperienceForm);
    setWorkExperienceErrors({});
    setEditingExperienceId(null);
    setIsWorkExperienceFormVisible(true);
    setIsWorkExperienceModalOpen(false);
  };

  const openEducationModal = () => {
    setEducationDraft(educationItems.map((item) => ({ ...item })));
    setEducationForm(initialEducationForm);
    setEducationErrors({});
    setEditingEducationId(null);
    setIsEducationFormVisible(educationItems.length === 0);
    setIsEducationModalOpen(true);
  };

  const closeEducationModal = () => {
    setEducationDraft(educationItems.map((item) => ({ ...item })));
    setEducationForm(initialEducationForm);
    setEducationErrors({});
    setEditingEducationId(null);
    setIsEducationFormVisible(true);
    setIsEducationModalOpen(false);
  };

  const openOtherAssetsModal = () => {
    setOtherAssetsForm({ ...otherAssets });
    setOtherAssetsErrors({});
    setIsOtherAssetsModalOpen(true);
  };

  const closeOtherAssetsModal = () => {
    setOtherAssetsForm({ ...otherAssets });
    setOtherAssetsErrors({});
    setIsOtherAssetsModalOpen(false);
  };

  const openSkillsModal = () => {
    setSkillsDraft([...skills]);
    setSkillsSearch("");
    setIsSkillsModalOpen(true);
  };

  const closeSkillsModal = () => {
    setSkillsDraft([...skills]);
    setSkillsSearch("");
    setIsSkillsModalOpen(false);
  };

  const openLanguagesModal = () => {
    setLanguagesDraft([...languages]);
    setLanguagesSearch("");
    setIsLanguagesModalOpen(true);
  };

  const closeLanguagesModal = () => {
    setLanguagesDraft([...languages]);
    setLanguagesSearch("");
    setIsLanguagesModalOpen(false);
  };

  const handleOtherAssetsChange = (field, value) => {
    setOtherAssetsForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setOtherAssetsErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleEducationChange = (field, value) => {
    if (field === "currentlyStudying") {
      setEducationForm((prev) => ({
        ...prev,
        currentlyStudying: value,
        toDate: value ? "" : prev.toDate,
      }));
    } else {
      setEducationForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    setEducationErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateEducationForm = () => {
  const errors = {};

  if (!educationForm.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!educationForm.level.trim()) {
    errors.level = "Level is required.";
  }

  if (!educationForm.institution.trim()) {
    errors.institution = "Institution is required.";
  }

  if (!educationForm.fromDate) {
    errors.fromDate = "From date is required.";
  }

  if (!educationForm.currentlyStudying && !educationForm.toDate) {
    errors.toDate = "To date is required unless you are still studying here.";
  }

  if (
    educationForm.fromDate &&
    educationForm.toDate &&
    educationForm.fromDate > educationForm.toDate
  ) {
    errors.toDate = "To date cannot be earlier than From date.";
  }

  return errors;
};

  const handleSaveEducationItem = () => {
    const errors = validateEducationForm();

    if (Object.keys(errors).length > 0) {
      setEducationErrors(errors);
      return;
    }

    const cleanedItem = {
      id: editingEducationId ?? createLocalId(),
      title: educationForm.title.trim(),
      level: educationForm.level.trim(),
      institution: educationForm.institution.trim(),
      fromDate: educationForm.fromDate,
      toDate: educationForm.currentlyStudying ? "" : educationForm.toDate,
      currentlyStudying: educationForm.currentlyStudying,
      projectsInvolved: educationForm.projectsInvolved.trim(),
    };

    setEducationDraft((prev) => {
      const exists = prev.some((item) => item.id === cleanedItem.id);

      if (exists) {
        return prev.map((item) =>
          item.id === cleanedItem.id ? cleanedItem : item
        );
      }

      return [...prev, cleanedItem];
    });

    setEducationForm(initialEducationForm);
    setEducationErrors({});
    setEditingEducationId(null);
    setIsEducationFormVisible(false);
  };

  const handleEditEducationItem = (id) => {
    const item = educationDraft.find((education) => education.id === id);
    if (!item) return;

    setEducationForm({
      id: item.id,
      title: item.title,
      level: item.level,
      institution: item.institution,
      fromDate: item.fromDate,
      toDate: item.toDate,
      currentlyStudying: item.currentlyStudying,
      projectsInvolved: item.projectsInvolved,
    });

    setEducationErrors({});
    setEditingEducationId(id);
    setIsEducationFormVisible(true);
  };

  const handleDeleteEducationItem = (id) => {
    const nextDraft = educationDraft.filter((item) => item.id !== id);
    setEducationDraft(nextDraft);

    if (editingEducationId === id) {
      setEducationForm(initialEducationForm);
      setEditingEducationId(null);
      setEducationErrors({});
      setIsEducationFormVisible(nextDraft.length === 0);
      return;
    }

    setIsEducationFormVisible((prev) => prev || nextDraft.length === 0);
  };

  const handleStartNewEducation = () => {
    setEducationForm(initialEducationForm);
    setEducationErrors({});
    setEditingEducationId(null);
    setIsEducationFormVisible(true);
  };

  const handleAddLanguage = (language) => {
    setLanguagesDraft((prev) => {
      if (prev.includes(language)) return prev;
      return [...prev, language];
    });
    setLanguagesSearch("");
  };

  const handleRemoveLanguage = (language) => {
    setLanguagesDraft((prev) => prev.filter((item) => item !== language));
  };

  const handleFormChange = (field, value) => {
    let nextValue = value;

    if (field === "firstName" || field === "lastName") {
      nextValue = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (field === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: nextValue,
      email: loggedEmail,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleTargetJobChange = (field, value) => {
    let nextValue = value;

    if (field === "minimumSalary") {
      nextValue = value.replace(/\D/g, "");
    }

    if (field === "summary") {
      nextValue = value.slice(0, TARGET_JOB_CHARACTER_LIMIT);
    }

    setTargetJobForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    setTargetJobErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleWorkExperienceChange = (field, value) => {
    if (field === "currentlyWorking") {
      setWorkExperienceForm((prev) => ({
        ...prev,
        currentlyWorking: value,
        endDate: value ? "" : prev.endDate,
      }));
    } else {
      let nextValue = value;

      if (field === "description") {
        nextValue = value.slice(0, WORK_EXPERIENCE_DESCRIPTION_LIMIT);
      }

      setWorkExperienceForm((prev) => ({
        ...prev,
        [field]: nextValue,
      }));
    }

    setWorkExperienceErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setFormErrors((prev) => ({
        ...prev,
        profilePicture: "Profile picture must be less than 4 MB.",
      }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profilePicture: reader.result,
        profilePictureName: file.name,
        email: loggedEmail,
      }));

      setFormErrors((prev) => ({
        ...prev,
        profilePicture: "",
      }));
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is mandatory.";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is mandatory.";
    }

    if (!loggedEmail.trim()) {
      errors.email = "Email is mandatory.";
    }

    return errors;
  };

  const validateTargetJobForm = () => {
    const errors = {};
    const hasAnyData = hasAnyTargetJobData(targetJobForm);

    if (hasAnyData && !targetJobForm.jobTitle.trim()) {
      errors.jobTitle =
        "Job title is required if you want to save target job details.";
    }

    return errors;
  };

  const validateWorkExperienceForm = () => {
    const errors = {};

    if (!workExperienceForm.jobTitle.trim()) {
      errors.jobTitle = "Job title is required.";
    }

    if (!workExperienceForm.companyName.trim()) {
      errors.companyName = "Company name is required.";
    }

    if (!workExperienceForm.employmentType.trim()) {
      errors.employmentType = "Employment type is required.";
    }

    if (!workExperienceForm.startDate.trim()) {
      errors.startDate = "Start date is required.";
    }

    if (!workExperienceForm.currentlyWorking && !workExperienceForm.endDate.trim()) {
      errors.endDate = "End date is required.";
    }

    return errors;
  };

  const handleDeleteProfilePicture = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: null,
      profilePictureName: "",
      email: loggedEmail,
    }));

    setFormErrors((prev) => ({
      ...prev,
      profilePicture: "",
    }));
  };

  const handleProfileSave = async () => {
    if (isSavingProfile) return;

    const errors = validateProfileForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updatedProfile = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: loggedEmail,
      phone: formData.phone.trim(),
      birthDate: formData.birthDate,
      currentPosition: formData.currentPosition.trim(),
      gender: formData.gender.trim(),
    };

    try {
      setIsSavingProfile(true);
      await persistProfile(updatedProfile);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setFormErrors({});
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTargetJobSave = async () => {
    if (isSavingTargetJob) return;

    const errors = validateTargetJobForm();

    if (Object.keys(errors).length > 0) {
      setTargetJobErrors(errors);
      return;
    }

    const cleanedData = {
      jobTitle: targetJobForm.jobTitle.trim(),
      desiredLocation: targetJobForm.desiredLocation.trim(),
      contractType: targetJobForm.contractType.trim(),
      remoteWork: targetJobForm.remoteWork.trim(),
      experienceLevel: targetJobForm.experienceLevel.trim(),
      minimumSalary: targetJobForm.minimumSalary.trim(),
      currency: targetJobForm.currency,
      summary: targetJobForm.summary.trim(),
    };

    const finalTargetJob = hasAnyTargetJobData(cleanedData)
      ? cleanedData
      : initialTargetJob;

    try {
      setIsSavingTargetJob(true);
      await persistProfile({ targetJob: finalTargetJob });
      setTargetJob(finalTargetJob);
      setTargetJobForm({ ...finalTargetJob });
      setTargetJobErrors({});
      setIsTargetJobModalOpen(false);
    } catch (error) {
      console.error("Error saving target job:", error);
    } finally {
      setIsSavingTargetJob(false);
    }
  };

  const handleSaveExperienceItem = () => {
    const errors = validateWorkExperienceForm();

    if (Object.keys(errors).length > 0) {
      setWorkExperienceErrors(errors);
      return;
    }

    const cleanedItem = {
      id: editingExperienceId ?? createLocalId(),
      jobTitle: workExperienceForm.jobTitle.trim(),
      companyName: workExperienceForm.companyName.trim(),
      employmentType: workExperienceForm.employmentType.trim(),
      location: workExperienceForm.location.trim(),
      startDate: workExperienceForm.startDate,
      endDate: workExperienceForm.currentlyWorking
        ? ""
        : workExperienceForm.endDate,
      currentlyWorking: workExperienceForm.currentlyWorking,
      description: workExperienceForm.description.trim(),
    };

    setWorkExperienceDraft((prev) => {
      const exists = prev.some((item) => item.id === cleanedItem.id);

      if (exists) {
        return prev.map((item) =>
          item.id === cleanedItem.id ? cleanedItem : item
        );
      }

      return [...prev, cleanedItem];
    });

    setWorkExperienceForm(initialExperienceForm);
    setWorkExperienceErrors({});
    setEditingExperienceId(null);
    setIsWorkExperienceFormVisible(false);
  };

  const handleEditExperienceItem = (id) => {
    const item = workExperienceDraft.find((experience) => experience.id === id);
    if (!item) return;

    setWorkExperienceForm({
      id: item.id,
      jobTitle: item.jobTitle,
      companyName: item.companyName,
      employmentType: item.employmentType,
      location: item.location,
      startDate: item.startDate,
      endDate: item.endDate,
      currentlyWorking: item.currentlyWorking,
      description: item.description,
    });

    setWorkExperienceErrors({});
    setEditingExperienceId(id);
    setIsWorkExperienceFormVisible(true);
  };

  const handleDeleteExperienceItem = (id) => {
    const nextDraft = workExperienceDraft.filter((item) => item.id !== id);
    setWorkExperienceDraft(nextDraft);

    if (editingExperienceId === id) {
      setWorkExperienceForm(initialExperienceForm);
      setEditingExperienceId(null);
      setWorkExperienceErrors({});
      setIsWorkExperienceFormVisible(nextDraft.length === 0);
      return;
    }

    setIsWorkExperienceFormVisible((prev) => prev || nextDraft.length === 0);
  };

  const handleStartNewExperience = () => {
    setWorkExperienceForm(initialExperienceForm);
    setWorkExperienceErrors({});
    setEditingExperienceId(null);
    setIsWorkExperienceFormVisible(true);
  };

  const handleSaveAllExperiences = async () => {
    if (isSavingWorkExperiences) return;

    try {
      setIsSavingWorkExperiences(true);
      await persistProfile({ workExperiences: workExperienceDraft });
      setWorkExperiences(workExperienceDraft.map((item) => ({ ...item })));
      setIsWorkExperienceModalOpen(false);
      setWorkExperienceForm(initialExperienceForm);
      setWorkExperienceErrors({});
      setEditingExperienceId(null);
      setIsWorkExperienceFormVisible(true);
    } catch (error) {
      console.error("Error saving work experiences:", error);
    } finally {
      setIsSavingWorkExperiences(false);
    }
  };

  const handleAddSkill = (skill) => {
    setSkillsDraft((prev) => {
      if (prev.includes(skill)) return prev;
      return [...prev, skill];
    });
    setSkillsSearch("");
  };

  const handleRemoveSkill = (skill) => {
    setSkillsDraft((prev) => prev.filter((item) => item !== skill));
  };

  const handleSaveSkills = async () => {
    if (isSavingSkills) return;

    try {
      setIsSavingSkills(true);
      await persistProfile({ skills: skillsDraft });
      setSkills([...skillsDraft]);
      setSkillsSearch("");
      setIsSkillsModalOpen(false);
    } catch (error) {
      console.error("Error saving skills:", error);
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleSaveLanguages = async () => {
    if (isSavingLanguages) return;

    try {
      setIsSavingLanguages(true);
      await persistProfile({ languages: languagesDraft });
      setLanguages([...languagesDraft]);
      setLanguagesSearch("");
      setIsLanguagesModalOpen(false);
    } catch (error) {
      console.error("Error saving languages:", error);
    } finally {
      setIsSavingLanguages(false);
    }
  };

  const handleSaveAllEducation = async () => {
    if (isSavingEducation) return;

    try {
      setIsSavingEducation(true);
      await persistProfile({ educationItems: educationDraft });
      setEducationItems(educationDraft.map((item) => ({ ...item })));
      setIsEducationModalOpen(false);
      setEducationForm(initialEducationForm);
      setEducationErrors({});
      setEditingEducationId(null);
      setIsEducationFormVisible(true);
    } catch (error) {
      console.error("Error saving education:", error);
    } finally {
      setIsSavingEducation(false);
    }
  };

  const handleSaveOtherAssets = async () => {
    if (isSavingOtherAssets) return;

    const cleanedData = {
      linkedin: otherAssetsForm.linkedin.trim(),
      github: otherAssetsForm.github.trim(),
      website: otherAssetsForm.website.trim(),
    };

    const errors = {};

    if (cleanedData.linkedin && !isValidUrl(cleanedData.linkedin)) {
      errors.linkedin = "This is an invalid URL.";
    }

    if (cleanedData.github && !isValidUrl(cleanedData.github)) {
      errors.github = "This is an invalid URL.";
    }

    if (cleanedData.website && !isValidUrl(cleanedData.website)) {
      errors.website = "This is an invalid URL.";
    }

    if (Object.keys(errors).length > 0) {
      setOtherAssetsErrors(errors);
      return;
    }

    const finalOtherAssets = hasAnyOtherAssetsData(cleanedData)
      ? cleanedData
      : initialOtherAssets;

    try {
      setIsSavingOtherAssets(true);
      await persistProfile({ otherAssets: finalOtherAssets });
      setOtherAssets(finalOtherAssets);
      setOtherAssetsForm({ ...finalOtherAssets });
      setOtherAssetsErrors({});
      setIsOtherAssetsModalOpen(false);
    } catch (error) {
      console.error("Error saving other assets:", error);
    } finally {
      setIsSavingOtherAssets(false);
    }
  };

  if (isProfileLoading) {
    return <div className="myspace-page"><div className="container">Loading profile...</div></div>;
  }

  return (
    <div className="myspace-page">
      <div className="container">
        <div className="myspace-shell">
          <aside className="myspace-left">
            <div className="fixed-sidebar">
              <StatusCard
                statusValue={profile.availabilityStatus}
                onStatusChange={handleStatusChange}
              />
              <Sidebar
                activeSectionId={activeSectionId}
                onNavigate={handleSidebarNavigate}
              />
            </div>
          </aside>

          <main className="myspace-right" ref={rightPaneRef}>
            <TopOverviewCard
              profile={profile}
              targetJob={targetJob}
              workExperiences={workExperiences}
              skills={skills}
              languages={languages}
              educationItems={educationItems}
              otherAssets={otherAssets}
            />

            <ProfileSummary
              profile={profile}
              otherAssets={otherAssets}
              onEdit={openProfileModal}
            />

            <TargetJobSection data={targetJob} onEdit={openTargetJobModal} />

            <WorkExperienceSection
              experiences={workExperiences}
              onOpen={openWorkExperienceModal}
            />

            <SkillsExpertiseSection skills={skills} onOpen={openSkillsModal} />

            <LanguagesSection
              languages={languages}
              onOpen={openLanguagesModal}
            />

            <EducationQualificationsSection
              educationItems={educationItems}
              onOpen={openEducationModal}
            />

            <OtherAssetsSection
              data={otherAssets}
              onOpen={openOtherAssetsModal}
            />

            {sectionData
              .filter(
                (section) =>
                  section.id !== "target-job" &&
                  section.id !== "work-experience" &&
                  section.id !== "skills-expertise" &&
                  section.id !== "languages" &&
                  section.id !== "education-qualifications" &&
                  section.id !== "other-assets"
              )
              .map((section) => (
                <SectionCard
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  description={section.description}
                />
              ))}
          </main>
        </div>

        <ProfileModal
          isOpen={isProfileModalOpen}
          formData={formData}
          errors={formErrors}
          onClose={closeProfileModal}
          onChange={handleFormChange}
          onSave={handleProfileSave}
          onFileChange={handleProfilePictureChange}
          onDeletePicture={handleDeleteProfilePicture}
        />

        <TargetJobModal
          isOpen={isTargetJobModalOpen}
          formData={targetJobForm}
          errors={targetJobErrors}
          onClose={closeTargetJobModal}
          onChange={handleTargetJobChange}
          onSave={handleTargetJobSave}
          jobTitleSuggestions={filteredJobTitles}
          locationSuggestions={filteredLocations}
        />

        <WorkExperienceModal
          isOpen={isWorkExperienceModalOpen}
          experiences={workExperienceDraft}
          formData={workExperienceForm}
          errors={workExperienceErrors}
          editingId={editingExperienceId}
          isFormVisible={isWorkExperienceFormVisible}
          onClose={closeWorkExperienceModal}
          onChange={handleWorkExperienceChange}
          onSaveExperience={handleSaveExperienceItem}
          onEditExperience={handleEditExperienceItem}
          onDeleteExperience={handleDeleteExperienceItem}
          onStartNew={handleStartNewExperience}
          onSaveAll={handleSaveAllExperiences}
          jobTitleSuggestions={filteredWorkExperienceJobTitles}
          locationSuggestions={filteredWorkExperienceLocations}
        />

        <SkillsExpertiseModal
          isOpen={isSkillsModalOpen}
          searchValue={skillsSearch}
          selectedSkills={skillsDraft}
          filteredSuggestions={filteredSkillSuggestions}
          onClose={closeSkillsModal}
          onSearchChange={setSkillsSearch}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onSave={handleSaveSkills}
          showSuggestions={skillsSearch.trim().length > 0}
        />

        <LanguagesModal
          isOpen={isLanguagesModalOpen}
          searchValue={languagesSearch}
          selectedLanguages={languagesDraft}
          filteredSuggestions={filteredLanguageSuggestions}
          onClose={closeLanguagesModal}
          onSearchChange={setLanguagesSearch}
          onAddLanguage={handleAddLanguage}
          onRemoveLanguage={handleRemoveLanguage}
          onSave={handleSaveLanguages}
          showSuggestions={languagesSearch.trim().length > 0}
        />

        <EducationQualificationsModal
          isOpen={isEducationModalOpen}
          educations={educationDraft}
          formData={educationForm}
          errors={educationErrors}
          editingId={editingEducationId}
          isFormVisible={isEducationFormVisible}
          onClose={closeEducationModal}
          onChange={handleEducationChange}
          onSaveEducation={handleSaveEducationItem}
          onEditEducation={handleEditEducationItem}
          onDeleteEducation={handleDeleteEducationItem}
          onStartNew={handleStartNewEducation}
          onSaveAll={handleSaveAllEducation}
        />

        <OtherAssetsModal
          isOpen={isOtherAssetsModalOpen}
          formData={otherAssetsForm}
          errors={otherAssetsErrors}
          onClose={closeOtherAssetsModal}
          onChange={handleOtherAssetsChange}
          onSave={handleSaveOtherAssets}
        />
      </div>
    </div>
  );
}
