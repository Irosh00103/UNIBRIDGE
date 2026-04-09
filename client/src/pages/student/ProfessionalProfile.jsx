import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaEnvelope,
  FaPhoneAlt,
  FaBirthdayCake,
  FaUser,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaRegFileAlt
} from 'react-icons/fa';
import '../../styles/professionalProfile.css';

const TARGET_JOB_FIELDS = [
  'jobTitle',
  'desiredLocation',
  'contractType',
  'remoteWork',
  'experienceLevel',
  'minimumSalary',
  'summary'
];

const SKILL_OPTIONS = [
  'Java',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'C++',
  'C#',
  'PHP',
  'Go',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'HTML',
  'CSS',
  'UI Design',
  'UX Research',
  'Figma',
  'Problem Solving',
  'Communication',
  'Teamwork',
  'Project Management'
];

const LANGUAGE_OPTIONS = [
  'English',
  'Sinhala',
  'Tamil',
  'French',
  'German',
  'Spanish',
  'Japanese',
  'Mandarin',
  'Hindi',
  'Arabic'
];

const JOB_TITLE_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Product Designer',
  'QA Engineer',
  'DevOps Engineer',
  'Business Analyst',
  'Project Coordinator'
];

const LOCATION_SUGGESTIONS = [
  'Colombo, Sri Lanka',
  'Kandy, Sri Lanka',
  'Galle, Sri Lanka',
  'Remote',
  'Hybrid - Colombo',
  'Dubai, UAE',
  'Singapore',
  'Bangalore, India',
  'London, UK',
  'Berlin, Germany'
];

const emptyTargetJob = {};
const emptyOtherAssets = { linkedin: '', github: '', website: '' };

const digitsOnly = (value, maxLength) => (value || '').replace(/\D/g, '').slice(0, maxLength);

const isHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    currentPosition: '',
    gender: '',
    profilePicture: null,
    isAvailable: false,
    targetJob: {},
    workExperiences: [],
    educationItems: [],
    skills: [],
    languages: [],
    otherAssets: {}
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [modalErrors, setModalErrors] = useState({});

  const [workExperiencesDraft, setWorkExperiencesDraft] = useState([]);
  const [educationItemsDraft, setEducationItemsDraft] = useState([]);
  const [selectionDraft, setSelectionDraft] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    setModalErrors({});

    if (activeModal === 'work') {
      setWorkExperiencesDraft([...(profile.workExperiences || [])]);
      setFormData({});
    } else if (activeModal === 'education') {
      setEducationItemsDraft([...(profile.educationItems || [])]);
      setFormData({});
    } else if (activeModal === 'skills') {
      setSelectionDraft([...(profile.skills || [])]);
      setSearchQuery('');
      setFormData({});
    } else if (activeModal === 'languages') {
      setSelectionDraft([...(profile.languages || [])]);
      setSearchQuery('');
      setFormData({});
    }
  }, [activeModal]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/uni/students/profile');
      const data = res.data || {};
      setProfile({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: digitsOnly(data.phone || '', 10),
        birthDate: data.birthDate || '',
        currentPosition: data.currentPosition || '',
        gender: data.gender || '',
        profilePicture: data.profilePicture || null,
        isAvailable: data.isAvailable || false,
        targetJob: data.targetJob || {},
        workExperiences: data.workExperiences || [],
        educationItems: data.educationItems || [],
        skills: data.skills || [],
        languages: data.languages || [],
        otherAssets: data.otherAssets || {}
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setModalErrors({});
    setSearchQuery('');
  };

  const updateProfile = async (data) => {
    try {
      const res = await axios.put('http://localhost:5000/api/uni/students/profile', data);
      const updatedData = res.data || {};
      setProfile((prevProfile) => ({
        ...prevProfile,
        ...updatedData,
        targetJob: updatedData.targetJob || prevProfile.targetJob || {},
        workExperiences: updatedData.workExperiences || prevProfile.workExperiences || [],
        educationItems: updatedData.educationItems || prevProfile.educationItems || [],
        skills: updatedData.skills || prevProfile.skills || [],
        languages: updatedData.languages || prevProfile.languages || [],
        otherAssets: updatedData.otherAssets || prevProfile.otherAssets || {}
      }));
      setError('');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      closeModal();
    } catch (err) {
      setError('Update failed. Please try again.');
      console.error('Profile update error:', err);
    }
  };

  const calculateCompletion = () => {
    if (!profile) return 0;

    const checks = [
      Boolean(profile.firstName),
      Boolean(profile.lastName),
      Boolean(profile.phone),
      Boolean(profile.birthDate),
      Boolean(profile.currentPosition),
      Boolean(profile.gender),
      Boolean(profile.profilePicture),
      (profile.workExperiences || []).length > 0,
      (profile.educationItems || []).length > 0,
      (profile.skills || []).length > 0,
      (profile.languages || []).length > 0,
      Object.values(profile.targetJob || {}).some((v) => !!v),
      Object.values(profile.otherAssets || {}).some((v) => !!v)
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalErrors((prev) => ({ ...prev, profilePicture: 'Only image files are allowed.' }));
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setModalErrors((prev) => ({ ...prev, profilePicture: 'Profile picture must be less than 4 MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      setModalErrors((prev) => ({ ...prev, profilePicture: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateAndBuildTargetJob = () => {
    const cleaned = {
      jobTitle: (formData.jobTitle || '').trim(),
      desiredLocation: (formData.desiredLocation || '').trim(),
      contractType: (formData.contractType || '').trim(),
      remoteWork: (formData.remoteWork || '').trim(),
      experienceLevel: (formData.experienceLevel || '').trim(),
      minimumSalary: digitsOnly(formData.minimumSalary || '', 9),
      summary: (formData.summary || '').slice(0, 300).trim()
    };

    const hasAnyTargetField = TARGET_JOB_FIELDS.some((field) => Boolean(cleaned[field]));

    if (!hasAnyTargetField) {
      return { value: emptyTargetJob, errors: {} };
    }

    const errors = {};
    if (!cleaned.jobTitle) {
      errors.jobTitle = 'Job title is required when adding target job details.';
    }

    if (Object.keys(errors).length > 0) {
      return { value: null, errors };
    }

    const normalized = {
      ...cleaned,
      currency: cleaned.minimumSalary ? (formData.currency || 'LKR') : ''
    };

    return { value: normalized, errors: {} };
  };

  const saveProfileSection = () => {
    const payload = {
      firstName: (formData.firstName || '').trim(),
      lastName: (formData.lastName || '').trim(),
      phone: digitsOnly(formData.phone || '', 10),
      birthDate: formData.birthDate || '',
      currentPosition: (formData.currentPosition || '').trim(),
      gender: formData.gender || '',
      profilePicture: formData.profilePicture || null
    };

    updateProfile(payload);
  };

  const saveTargetSection = () => {
    const { value, errors } = validateAndBuildTargetJob();
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    updateProfile({ targetJob: value });
  };

  const saveOtherAssetsSection = () => {
    const cleaned = {
      linkedin: (formData.linkedin || '').trim(),
      github: (formData.github || '').trim(),
      website: (formData.website || '').trim()
    };

    const errors = {};
    if (cleaned.linkedin && !isHttpUrl(cleaned.linkedin)) {
      errors.linkedin = 'Enter a valid LinkedIn URL that starts with http:// or https://.';
    }
    if (cleaned.github && !isHttpUrl(cleaned.github)) {
      errors.github = 'Enter a valid GitHub URL that starts with http:// or https://.';
    }
    if (cleaned.website && !isHttpUrl(cleaned.website)) {
      errors.website = 'Enter a valid website URL that starts with http:// or https://.';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    const hasAnyLink = Boolean(cleaned.linkedin || cleaned.github || cleaned.website);
    updateProfile({ otherAssets: hasAnyLink ? cleaned : emptyOtherAssets });
  };

  const saveWorkDraftEntry = () => {
    const cleaned = {
      id: formData.id || Date.now(),
      jobTitle: (formData.jobTitle || '').trim(),
      companyName: (formData.companyName || '').trim(),
      employmentType: (formData.employmentType || '').trim(),
      location: (formData.location || '').trim(),
      startDate: formData.startDate || '',
      endDate: formData.currentlyWorking ? '' : formData.endDate || '',
      currentlyWorking: Boolean(formData.currentlyWorking),
      description: (formData.description || '').slice(0, 400).trim()
    };

    const errors = {};
    if (!cleaned.jobTitle) errors.jobTitle = 'Job title is required.';
    if (!cleaned.companyName) errors.companyName = 'Company name is required.';
    if (!cleaned.employmentType) errors.employmentType = 'Employment type is required.';
    if (!cleaned.startDate) errors.startDate = 'Start date is required.';
    if (!cleaned.currentlyWorking && !cleaned.endDate) {
      errors.endDate = 'End date is required unless you currently work there.';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setModalErrors({});
    setWorkExperiencesDraft((prev) => {
      if (typeof formData.editIndex === 'number') {
        return prev.map((item, idx) => (idx === formData.editIndex ? cleaned : item));
      }
      return [...prev, cleaned];
    });
    setFormData({});
  };

  const saveEducationDraftEntry = () => {
    const cleaned = {
      id: formData.id || Date.now(),
      title: (formData.title || '').trim(),
      level: (formData.level || '').trim(),
      institution: (formData.institution || '').trim(),
      fromDate: formData.fromDate || '',
      toDate: formData.currentlyStudying ? '' : formData.toDate || '',
      currentlyStudying: Boolean(formData.currentlyStudying),
      projectsInvolved: (formData.projectsInvolved || '').trim()
    };

    const errors = {};
    if (!cleaned.title) errors.title = 'Title is required.';
    if (!cleaned.level) errors.level = 'Level is required.';
    if (!cleaned.institution) errors.institution = 'Institution is required.';
    if (!cleaned.fromDate) errors.fromDate = 'From date is required.';
    if (!cleaned.currentlyStudying && !cleaned.toDate) {
      errors.toDate = 'To date is required unless you are still studying there.';
    }

    if (cleaned.fromDate && cleaned.toDate && cleaned.toDate < cleaned.fromDate) {
      errors.toDate = 'Ending date cannot be earlier than starting date.';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setModalErrors({});
    setEducationItemsDraft((prev) => {
      if (typeof formData.editIndex === 'number') {
        return prev.map((item, idx) => (idx === formData.editIndex ? cleaned : item));
      }
      return [...prev, cleaned];
    });
    setFormData({});
  };

  const saveDraftListToServer = () => {
    if (activeModal === 'work') {
      updateProfile({ workExperiences: workExperiencesDraft });
    } else if (activeModal === 'education') {
      updateProfile({ educationItems: educationItemsDraft });
    }
  };

  const addSelectionItem = (rawValue) => {
    const options = activeModal === 'skills' ? SKILL_OPTIONS : LANGUAGE_OPTIONS;
    const exactOption = options.find((opt) => opt.toLowerCase() === rawValue.toLowerCase());
    if (!exactOption) return;

    const exists = selectionDraft.some((item) => item.toLowerCase() === exactOption.toLowerCase());
    if (exists) return;

    setSelectionDraft((prev) => [...prev, exactOption]);
    setSearchQuery('');
  };

  const filteredSuggestions = (() => {
    const options = activeModal === 'skills' ? SKILL_OPTIONS : LANGUAGE_OPTIONS;
    const selectedSet = new Set(selectionDraft.map((item) => item.toLowerCase()));

    return options
      .filter((item) => !selectedSet.has(item.toLowerCase()))
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        return item.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .slice(0, searchQuery.trim() ? 20 : 8);
  })();

  const saveSelectionToServer = () => {
    if (activeModal === 'skills') {
      updateProfile({ skills: selectionDraft });
    } else if (activeModal === 'languages') {
      updateProfile({ languages: selectionDraft });
    }
  };

  const completion = calculateCompletion();

  if (loading) {
    return (
      <div className="prof-profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Loading your professional identity...</h2>
      </div>
    );
  }

  if (error && !profile.firstName && !profile.lastName) {
    return (
      <div className="prof-profile-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="prof-profile-page fade-in-up">
      <div className="prof-container">
        <section className="prof-header-card">
          <div className="prof-user-info">
            <div className="prof-avatar">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              ) : (
                <span>
                  {profile.firstName?.charAt(0) || 'P'}
                  {profile.lastName?.charAt(0) || ''}
                </span>
              )}
            </div>
            <div className="prof-title-group">
              <h1>
                {profile.firstName || 'First'} {profile.lastName || 'Last'}
              </h1>
              <p className="headline-text">
                {profile.currentPosition || 'Profile headline not filled'}
                <button
                  className="icon-btn-small"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                  onClick={() => {
                    setActiveModal('profile');
                    setFormData(profile);
                  }}
                >
                  <FaEdit />
                </button>
              </p>
              <div className="prof-contact-meta">
                <span>
                  <FaEnvelope /> {user?.email || 'Email not set'}
                </span>
                <span>
                  <FaPhoneAlt /> {profile.phone || 'Not filled'}
                </span>
                <span>
                  <FaBirthdayCake /> {profile.birthDate || 'Not filled'}
                </span>
                <span>
                  <FaUser /> {profile.gender ? (profile.gender === 'woman' ? 'Woman' : 'Man') : 'Not filled'}
                </span>
              </div>
            </div>
          </div>

          <div className="prof-status-section">
            <div className="status-toggle-card">
              <div className="status-info">
                <strong>My Status</strong>
                <p>Show you're available for opportunities!</p>
              </div>
              <button
                className={`status-toggle ${profile.isAvailable ? 'available' : ''}`}
                onClick={() => updateProfile({ isAvailable: !profile.isAvailable })}
              >
                {profile.isAvailable ? 'Available' : 'Not Available'}
              </button>
            </div>
          </div>
        </section>

        <div className="prof-main-layout">
          <aside className="prof-sidebar">
            <div className="completion-card">
              <div className="completion-header">
                <strong>Profile Strength</strong>
                <span>{completion}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completion}%` }}></div>
              </div>
              <p>Track how much of your profile is filled and improve your visibility.</p>
            </div>

            <nav className="prof-nav">
              <button className="prof-nav-item active" onClick={() => navigate('/student/profile/professional')}>
                Professional Profile
              </button>
              <button className="prof-nav-item" onClick={() => navigate('/student/job-portal/applications')}>
                My Applications
              </button>
              <button className="prof-nav-item" onClick={() => navigate('/student/job-portal/saved')}>
                Saved Jobs
              </button>
            </nav>
          </aside>

          <main className="prof-content">
            {success && (
              <div
                className="alert-success"
                style={{
                  padding: '15px',
                  background: '#ecfdf5',
                  color: '#059669',
                  borderRadius: '12px',
                  border: '1px solid #10b981',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaCheckCircle /> {success}
              </div>
            )}

            {error && (
              <div
                className="alert-error"
                style={{
                  padding: '15px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '12px',
                  border: '1px solid #fca5a5',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaExclamationCircle /> {error}
              </div>
            )}

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Target Job</h3>
                  {(!profile.targetJob || !Object.values(profile.targetJob).some((v) => !!v)) && (
                    <span className="not-started-badge">Not started</span>
                  )}
                </div>
                <button
                  className="add-btn"
                  onClick={() => {
                    setActiveModal('target');
                    setFormData(profile.targetJob || {});
                  }}
                >
                  <FaPlus /> Add
                </button>
              </div>
              <div className="section-body">
                {profile.targetJob?.jobTitle ? (
                  <div className="data-display">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>{profile.targetJob.jobTitle}</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {profile.targetJob.contractType || 'Not specified'}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>
                      {profile.targetJob.desiredLocation && (
                        <>
                          <FaMapMarkerAlt /> {profile.targetJob.desiredLocation}
                        </>
                      )}
                      {profile.targetJob.minimumSalary && (
                        <>
                          {' '}
                          <FaMoneyBillWave /> {profile.targetJob.currency || 'LKR'} {profile.targetJob.minimumSalary}
                        </>
                      )}
                    </p>
                    {profile.targetJob.summary && (
                      <p style={{ marginTop: '12px', fontSize: '14px' }}>{profile.targetJob.summary}</p>
                    )}
                  </div>
                ) : (
                  <p className="empty-hint">Tell recruiters what kind of roles you are looking for.</p>
                )}
              </div>
            </div>

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Work Experience</h3>
                  {(!profile.workExperiences || profile.workExperiences.length === 0) && (
                    <span className="not-started-badge">Not started</span>
                  )}
                </div>
                <button className="add-btn" onClick={() => setActiveModal('work')}>
                  <FaPlus /> Add
                </button>
              </div>
              <div className="section-body">
                {profile.workExperiences && profile.workExperiences.length > 0 ? (
                  profile.workExperiences.map((work, i) => (
                    <div key={work.id || i} className="data-item">
                      <div className="item-header">
                        <strong>
                          {work.jobTitle || 'Job Title'} at {work.companyName || 'Company'}
                        </strong>
                        <span>
                          {work.startDate || 'Start Date'} - {work.currentlyWorking ? 'Present' : work.endDate || 'End Date'}
                        </span>
                      </div>
                      <p>{work.description || 'No description provided'}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-hint">Highlight your past and current professional roles.</p>
                )}
              </div>
            </div>

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Education & Qualifications</h3>
                  {(!profile.educationItems || profile.educationItems.length === 0) && (
                    <span className="not-started-badge">Not started</span>
                  )}
                </div>
                <button className="add-btn" onClick={() => setActiveModal('education')}>
                  <FaPlus /> Add
                </button>
              </div>
              <div className="section-body">
                {profile.educationItems && profile.educationItems.length > 0 ? (
                  profile.educationItems.map((edu, i) => (
                    <div key={edu.id || i} className="data-item">
                      <div className="item-header">
                        <strong>
                          {edu.level || 'Level'} in {edu.title || 'Title'}
                        </strong>
                        <span>
                          {edu.fromDate || 'From Date'} - {edu.currentlyStudying ? 'Present' : edu.toDate || 'To Date'}
                        </span>
                      </div>
                      <p style={{ color: '#64748b' }}>{edu.institution || 'Institution'}</p>
                    </div>
                  ))
                ) : (
                  <p className="empty-hint">List your degrees, diplomas, or certificates.</p>
                )}
              </div>
            </div>

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Skills & Expertise</h3>
                  {(!profile.skills || profile.skills.length === 0) && <span className="not-started-badge">Not started</span>}
                </div>
                <button className="add-btn" onClick={() => setActiveModal('skills')}>
                  <FaPlus /> Manage
                </button>
              </div>
              <div className="section-body">
                <div className="skill-tags">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((s) => (
                      <span key={s} className="skill-tag">
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="empty-hint">Showcase your technical and soft skills.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Languages</h3>
                  {(!profile.languages || profile.languages.length === 0) && (
                    <span className="not-started-badge">Not started</span>
                  )}
                </div>
                <button className="add-btn" onClick={() => setActiveModal('languages')}>
                  <FaPlus /> Manage
                </button>
              </div>
              <div className="section-body">
                <div className="skill-tags">
                  {profile.languages && profile.languages.length > 0 ? (
                    profile.languages.map((lang) => (
                      <span key={lang} className="skill-tag">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <p className="empty-hint">Let recruiters know which languages you can use professionally.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="prof-section-card">
              <div className="section-header">
                <div className="title-area">
                  <h3>Other Assets</h3>
                  {(!profile.otherAssets || !Object.values(profile.otherAssets).some((v) => !!v)) && (
                    <span className="not-started-badge">Not started</span>
                  )}
                </div>
                <button
                  className="add-btn"
                  onClick={() => {
                    setActiveModal('other-assets');
                    setFormData({ ...emptyOtherAssets, ...(profile.otherAssets || {}) });
                  }}
                >
                  <FaPlus /> Manage
                </button>
              </div>
              <div className="section-body">
                {profile.otherAssets && Object.values(profile.otherAssets).some((v) => !!v) ? (
                  <div className="other-assets-links">
                    {profile.otherAssets.linkedin && (
                      <a href={profile.otherAssets.linkedin} target="_blank" rel="noreferrer" className="asset-link">
                        <FaLinkedin /> LinkedIn
                      </a>
                    )}
                    {profile.otherAssets.github && (
                      <a href={profile.otherAssets.github} target="_blank" rel="noreferrer" className="asset-link">
                        <FaGithub /> GitHub
                      </a>
                    )}
                    {profile.otherAssets.website && (
                      <a href={profile.otherAssets.website} target="_blank" rel="noreferrer" className="asset-link">
                        <FaGlobe /> Website
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="empty-hint">Add links to support and accelerate your applications.</p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {activeModal && (
        <div className="prof-modal-overlay">
          <div className="prof-modal">
            <div className="modal-header">
              <div>
                <h3>
                  {activeModal === 'target'
                    ? 'Target Job'
                    : activeModal === 'work'
                    ? 'Work Experience'
                    : activeModal === 'education'
                    ? 'Education'
                    : activeModal === 'skills'
                    ? 'Skills & Expertise'
                    : activeModal === 'languages'
                    ? 'Languages'
                    : activeModal === 'profile'
                    ? 'Personal Information'
                    : activeModal === 'other-assets'
                    ? 'Other Assets'
                    : 'Profile'}
                </h3>
                <p>
                  {activeModal === 'target'
                    ? "Tell recruiters more about the kind of job you're looking for."
                    : activeModal === 'work'
                    ? 'Add, edit, and review your work experience entries before final save.'
                    : activeModal === 'education'
                    ? 'Add, edit, and review your education entries before final save.'
                    : activeModal === 'skills'
                    ? 'Search and add skills from the predefined list.'
                    : activeModal === 'languages'
                    ? 'Search and add languages from the predefined list.'
                    : activeModal === 'profile'
                    ? 'Update your personal details and contact information.'
                    : 'Add professional links to support your applications.'}
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              {activeModal === 'profile' && (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Profile Picture</label>
                    <div className="profile-picture-upload">
                      {formData.profilePicture ? (
                        <div className="profile-picture-preview">
                          <img
                            src={formData.profilePicture}
                            alt="Profile preview"
                            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
                          />
                          <div className="profile-picture-actions">
                            <button type="button" className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
                              Change
                            </button>
                            <button
                              type="button"
                              className="btn-danger"
                              onClick={() => setFormData((prev) => ({ ...prev, profilePicture: null }))}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="profile-picture-empty">
                          <div className="upload-placeholder" onClick={() => fileInputRef.current?.click()}>
                            <div className="illustration-box" style={{ width: '60px', height: '60px', fontSize: '24px', marginBottom: '10px' }}>
                              <FaPlus />
                            </div>
                            <p>Add a file</p>
                            <small>Drag and drop a file here or...</small>
                            <button type="button" className="btn-primary" style={{ marginTop: '10px' }}>
                              Choose a file
                            </button>
                          </div>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleProfilePictureChange}
                      />
                    </div>
                    <small className="form-help">Pick a picture below 4 MB in which you look natural and smile.</small>
                    {modalErrors.profilePicture && <small className="field-error">{modalErrors.profilePicture}</small>}
                  </div>

                  <div className="form-group full-width">
                    <label>Gender</label>
                    <div className="gender-options">
                      <label
                        className={`radio-option-card ${formData.gender === 'woman' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, gender: prev.gender === 'woman' ? '' : 'woman' }))
                        }
                      >
                        <div className="radio-circle">
                          <div className="inner"></div>
                        </div>
                        <span>I'm a woman</span>
                      </label>
                      <label
                        className={`radio-option-card ${formData.gender === 'man' ? 'active' : ''}`}
                        onClick={() => setFormData((prev) => ({ ...prev, gender: prev.gender === 'man' ? '' : 'man' }))}
                      >
                        <div className="radio-circle">
                          <div className="inner"></div>
                        </div>
                        <span>I'm a man</span>
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]*"
                      value={formData.phone || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, phone: digitsOnly(e.target.value, 10) }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Birth Date</label>
                    <input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Current Position</label>
                    <input
                      type="text"
                      placeholder="e.g. Product Designer"
                      value={formData.currentPosition || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currentPosition: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'target' && (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>
                      Job title <span className="recommended-tag">Recommended</span>
                    </label>
                    <input
                      type="text"
                      list="job-title-suggestions"
                      placeholder="e.g. Product Manager"
                      value={formData.jobTitle || ''}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, jobTitle: e.target.value }));
                        setModalErrors((prev) => ({ ...prev, jobTitle: '' }));
                      }}
                    />
                    <datalist id="job-title-suggestions">
                      {JOB_TITLE_SUGGESTIONS.map((jobTitle) => (
                        <option key={jobTitle} value={jobTitle} />
                      ))}
                    </datalist>
                    {modalErrors.jobTitle && <small className="field-error">{modalErrors.jobTitle}</small>}
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Desired work location <span className="recommended-tag">Recommended</span>
                    </label>
                    <input
                      type="text"
                      list="location-suggestions"
                      placeholder="City, region, country"
                      value={formData.desiredLocation || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, desiredLocation: e.target.value }))}
                    />
                    <datalist id="location-suggestions">
                      {LOCATION_SUGGESTIONS.map((location) => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>Contract type</label>
                    <select
                      value={formData.contractType || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, contractType: e.target.value }))}
                    >
                      <option value="">Select</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Remote work</label>
                    <div className="remote-work-grid">
                      <div
                        className={`remote-option-card ${formData.remoteWork === 'A few days at home' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            remoteWork: prev.remoteWork === 'A few days at home' ? '' : 'A few days at home'
                          }))
                        }
                      >
                        <h4>A few days at home</h4>
                        <p>Work mainly in the office but can take some remote days.</p>
                      </div>
                      <div
                        className={`remote-option-card ${formData.remoteWork === 'Occasional remote' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            remoteWork: prev.remoteWork === 'Occasional remote' ? '' : 'Occasional remote'
                          }))
                        }
                      >
                        <h4>Occasional remote</h4>
                        <p>Can work from home a few days a week.</p>
                      </div>
                      <div
                        className={`remote-option-card ${formData.remoteWork === 'Fully-remote' ? 'active' : ''}`}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            remoteWork: prev.remoteWork === 'Fully-remote' ? '' : 'Fully-remote'
                          }))
                        }
                      >
                        <h4>Fully-remote</h4>
                        <p>Can work fully from home.</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>
                      Level of experience <span className="recommended-tag">Recommended</span>
                    </label>
                    <div className="experience-pills">
                      {['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years'].map((lvl) => (
                        <div
                          key={lvl}
                          className={`exp-pill ${formData.experienceLevel === lvl ? 'active' : ''}`}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              experienceLevel: prev.experienceLevel === lvl ? '' : lvl
                            }))
                          }
                        >
                          {lvl}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Minimum gross salary a month</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Example: 40000"
                      value={formData.minimumSalary || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minimumSalary: digitsOnly(e.target.value, 9) }))
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={formData.currency || 'LKR'}
                      onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                    >
                      <option value="LKR">Sri Lankan Rupee (LKR)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Share what you are looking for with your own words</label>
                    <textarea
                      rows="4"
                      value={formData.summary || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, summary: e.target.value.slice(0, 300) }))
                      }
                      placeholder="Describe your drivers, what you are looking for."
                    ></textarea>
                    <small className="form-help form-counter">{(formData.summary || '').length}/300</small>
                  </div>
                </div>
              )}

              {(activeModal === 'work' || activeModal === 'education') && (
                <div className="list-management-container">
                  <div className="modal-list-manager">
                    {(activeModal === 'work' ? workExperiencesDraft : educationItemsDraft).length > 0 ? (
                      (activeModal === 'work' ? workExperiencesDraft : educationItemsDraft).map((item, idx) => (
                        <div key={item.id || idx} className="manager-item">
                          <div className="item-info">
                            <h4>{activeModal === 'work' ? item.jobTitle : item.title}</h4>
                            <p>{activeModal === 'work' ? item.companyName : item.institution}</p>
                          </div>
                          <div className="item-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => setFormData({ ...item, isAdding: true, editIndex: idx })}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => {
                                if (activeModal === 'work') {
                                  setWorkExperiencesDraft((prev) => prev.filter((_, index) => index !== idx));
                                } else {
                                  setEducationItemsDraft((prev) => prev.filter((_, index) => index !== idx));
                                }
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-container">
                        <div className="illustration-box">
                          <FaBriefcase />
                        </div>
                        <h4>No entries yet</h4>
                        <p>Tell recruiters more about your past and current experiences.</p>
                      </div>
                    )}

                    <button
                      className="add-list-item-btn"
                      onClick={() => {
                        setModalErrors({});
                        setFormData({ id: Date.now(), isAdding: true });
                      }}
                    >
                      <FaPlus /> {activeModal === 'work' ? 'Add experience' : 'Add education'}
                    </button>
                  </div>

                  {formData.isAdding && (
                    <div
                      className="form-grid fade-in-up"
                      style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}
                    >
                      {activeModal === 'work' ? (
                        <>
                          <div className="form-group full-width">
                            <label>Job title</label>
                            <input
                              type="text"
                              placeholder="e.g. Software Engineering Intern"
                              value={formData.jobTitle || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
                            />
                            {modalErrors.jobTitle && <small className="field-error">{modalErrors.jobTitle}</small>}
                          </div>

                          <div className="form-group">
                            <label>Company name</label>
                            <input
                              type="text"
                              placeholder="e.g. WSO2"
                              value={formData.companyName || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                            />
                            {modalErrors.companyName && <small className="field-error">{modalErrors.companyName}</small>}
                          </div>

                          <div className="form-group">
                            <label>Location</label>
                            <input
                              type="text"
                              placeholder="e.g. Colombo, Sri Lanka"
                              value={formData.location || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                            />
                          </div>

                          <div className="form-group">
                            <label>Employment type</label>
                            <select
                              value={formData.employmentType || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, employmentType: e.target.value }))}
                            >
                              <option value="">Select</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Internship">Internship</option>
                              <option value="Contract">Contract</option>
                            </select>
                            {modalErrors.employmentType && <small className="field-error">{modalErrors.employmentType}</small>}
                          </div>

                          <div className="form-group">
                            <label>Start date</label>
                            <input
                              type="month"
                              max={currentMonth}
                              value={formData.startDate || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                            {modalErrors.startDate && <small className="field-error">{modalErrors.startDate}</small>}
                          </div>

                          <div className="form-group">
                            <label>End date</label>
                            <input
                              type="month"
                              min={formData.startDate || ''}
                              max={currentMonth}
                              value={formData.endDate || ''}
                              disabled={formData.currentlyWorking}
                              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                            {modalErrors.endDate && <small className="field-error">{modalErrors.endDate}</small>}
                          </div>

                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.currentlyWorking || false}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    currentlyWorking: e.target.checked,
                                    endDate: e.target.checked ? '' : prev.endDate || ''
                                  }))
                                }
                              />
                              I currently work here
                            </label>
                          </div>

                          <div className="form-group full-width">
                            <label>Description / responsibilities</label>
                            <textarea
                              rows="3"
                              placeholder="Briefly describe what you worked on, your responsibilities, etc."
                              value={formData.description || ''}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, description: e.target.value.slice(0, 400) }))
                              }
                            ></textarea>
                            <small className="form-help form-counter">{(formData.description || '').length}/400</small>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="form-group full-width">
                            <label>Title</label>
                            <input
                              type="text"
                              placeholder="e.g. BSc (Hons) in Computer Science"
                              value={formData.title || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            />
                            {modalErrors.title && <small className="field-error">{modalErrors.title}</small>}
                          </div>

                          <div className="form-group">
                            <label>Level</label>
                            <select
                              value={formData.level || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                            >
                              <option value="">Select</option>
                              <option value="Bachelor's">Bachelor's</option>
                              <option value="Master's">Master's</option>
                              <option value="PhD">PhD</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Certificate">Certificate</option>
                            </select>
                            {modalErrors.level && <small className="field-error">{modalErrors.level}</small>}
                          </div>

                          <div className="form-group">
                            <label>University, school or body</label>
                            <input
                              type="text"
                              placeholder="e.g. University of Colombo"
                              value={formData.institution || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
                            />
                            {modalErrors.institution && <small className="field-error">{modalErrors.institution}</small>}
                          </div>

                          <div className="form-group">
                            <label>From</label>
                            <input
                              type="month"
                              max={currentMonth}
                              value={formData.fromDate || ''}
                              onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
                            />
                            {modalErrors.fromDate && <small className="field-error">{modalErrors.fromDate}</small>}
                          </div>

                          <div className="form-group">
                            <label>To</label>
                            <input
                              type="month"
                              min={formData.fromDate || ''}
                              max={currentMonth}
                              value={formData.toDate || ''}
                              disabled={formData.currentlyStudying}
                              onChange={(e) => setFormData((prev) => ({ ...prev, toDate: e.target.value }))}
                            />
                            {modalErrors.toDate && <small className="field-error">{modalErrors.toDate}</small>}
                          </div>

                          <div className="form-group full-width">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.currentlyStudying || false}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    currentlyStudying: e.target.checked,
                                    toDate: e.target.checked ? '' : prev.toDate || ''
                                  }))
                                }
                              />
                              I'm still studying here
                            </label>
                          </div>

                          <div className="form-group full-width">
                            <label>Projects involved</label>
                            <textarea
                              rows="3"
                              placeholder="e.g. Final year software engineering project..."
                              value={formData.projectsInvolved || ''}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, projectsInvolved: e.target.value }))
                              }
                            ></textarea>
                          </div>
                        </>
                      )}

                      <div className="form-footer" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                        <button className="btn-primary" onClick={activeModal === 'work' ? saveWorkDraftEntry : saveEducationDraftEntry}>
                          {typeof formData.editIndex === 'number' ? 'Update Entry' : 'Add Entry'}
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            setFormData({});
                            setModalErrors({});
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(activeModal === 'skills' || activeModal === 'languages') && (
                <div className="skills-management">
                  <div className="search-input-wrapper">
                    <FaBriefcase className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder={
                        activeModal === 'skills'
                          ? 'Search skills from list (e.g. React)'
                          : 'Search languages from list (e.g. English)'
                      }
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSelectionItem(searchQuery.trim());
                        }
                      }}
                    />
                  </div>

                  <div className="skill-tags" style={{ marginBottom: '16px' }}>
                    {selectionDraft.map((item, idx) => (
                      <span key={`${item}-${idx}`} className="skill-tag">
                        {item}
                        <FaTimes
                          style={{ marginLeft: '8px', cursor: 'pointer' }}
                          onClick={() => setSelectionDraft((prev) => prev.filter((_, i) => i !== idx))}
                        />
                      </span>
                    ))}
                  </div>

                  <div className="suggestion-list">
                    {filteredSuggestions.map((item) => (
                      <button key={item} type="button" className="suggestion-chip" onClick={() => addSelectionItem(item)}>
                        {item}
                      </button>
                    ))}
                  </div>

                  {selectionDraft.length === 0 && (
                    <div className="empty-state-container">
                      <div className="illustration-box">
                        {activeModal === 'skills' ? <FaRegFileAlt /> : <FaGlobe />}
                      </div>
                      <h4>Start building your list</h4>
                      <p>Search and select {activeModal} to add them to your list.</p>
                    </div>
                  )}
                </div>
              )}

              {activeModal === 'other-assets' && (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>LinkedIn</label>
                    <input
                      type="url"
                      placeholder="https://www.linkedin.com/in/your-profile"
                      value={formData.linkedin || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    />
                    {modalErrors.linkedin && <small className="field-error">{modalErrors.linkedin}</small>}
                  </div>
                  <div className="form-group full-width">
                    <label>GitHub</label>
                    <input
                      type="url"
                      placeholder="https://github.com/your-username"
                      value={formData.github || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                    />
                    {modalErrors.github && <small className="field-error">{modalErrors.github}</small>}
                  </div>
                  <div className="form-group full-width">
                    <label>Website / Portfolio</label>
                    <input
                      type="url"
                      placeholder="https://your-portfolio.com"
                      value={formData.website || ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                    />
                    {modalErrors.website && <small className="field-error">{modalErrors.website}</small>}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>
                {activeModal === 'work' || activeModal === 'education' ? 'Close' : 'Cancel'}
              </button>

              {(activeModal === 'profile' ||
                activeModal === 'target' ||
                activeModal === 'other-assets' ||
                activeModal === 'work' ||
                activeModal === 'education' ||
                activeModal === 'skills' ||
                activeModal === 'languages') && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (activeModal === 'profile') saveProfileSection();
                    if (activeModal === 'target') saveTargetSection();
                    if (activeModal === 'other-assets') saveOtherAssetsSection();
                    if (activeModal === 'work' || activeModal === 'education') saveDraftListToServer();
                    if (activeModal === 'skills' || activeModal === 'languages') saveSelectionToServer();
                  }}
                >
                  {activeModal === 'work' || activeModal === 'education' ? 'Save All' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalProfile;
