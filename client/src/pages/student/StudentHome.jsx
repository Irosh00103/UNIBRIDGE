
import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import '../../styles/studentHome.css';

const API_BASE = 'http://localhost:5000/api';
const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const SEMESTER_OPTIONS = ['Semester 1', 'Semester 2'];

const normalizeSpace = (value = '') => value.trim().replace(/\s+/g, ' ');

const isValidHttpUrl = (value = '') => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('ub_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function calculateProfileCompletion(profile) {
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
    Object.values(profile.targetJob || {}).some(Boolean),
    Object.values(profile.otherAssets || {}).some(Boolean),
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function formatRelativeTime(value) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

// ========== Helper: useCounter (with cleanup) ==========
function useCounter(target, duration = 1200) {
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    let frameId;

    const update = () => {
      start = Math.min(start + step, target);
      if (ref.current) ref.current.textContent = Math.floor(start);
      if (start < target) frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return ref;
}

// ========== Particle Canvas Background ==========
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const initParticles = (width, height) => {
      particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.8 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.4 + 0.1,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="student-canvas" />;
}

// ========== Hero Section ==========
function Hero({ user, navigate }) {
  const firstName = user?.name?.split(' ')[0] ?? 'Student';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <section className="dashboard-hero fade-in-up">
      <div className="hero-badge">
        <span className="badge-dot"></span>
        Student Portal
      </div>
      <h1 className="hero-title">
        {greeting},{' '}
        <span className="gradient-text">{firstName}!</span>
      </h1>
      <p className="hero-subtitle">
        Your launchpad for materials, opportunities, and peer learning — all in one place.
      </p>
    </section>
  );
}

function ProfileSnapshot({ user, navigate, profileCompletion }) {
  const fullName = user?.name || 'Student User';
  const firstLetter = fullName.charAt(0).toUpperCase();

  return (
    <aside className="profile-snapshot fade-in-up">
      <div className="snapshot-avatar">{firstLetter}</div>
      <h3>{fullName}</h3>
      <p>{user?.email || 'student@unibridge.lk'}</p>

      <div className="snapshot-progress-block">
        <div className="snapshot-progress-head">
          <span>Profile completion</span>
          <strong>{profileCompletion}%</strong>
        </div>
        <div className="snapshot-progress-track">
          <div className="snapshot-progress-fill" style={{ width: `${profileCompletion}%` }}></div>
        </div>
      </div>

      <div className="snapshot-quick-actions">
        <button type="button" onClick={() => navigate('/profile')}>Account Settings</button>
        <button type="button" onClick={() => navigate('/student/profile/professional')}>Professional Profile</button>
        <button type="button" onClick={() => navigate('/student/job-portal/applications')}>My Applications</button>
      </div>
    </aside>
  );
}

// ========== Stat Card ==========
function StatCard({ icon, value, label, delay }) {
  const numRef = useCounter(value);
  return (
    <div className={`stat-card fade-in-up`} style={{ animationDelay: `${delay * 0.1}s` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-number" ref={numRef}>0</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatGrid({ stats }) {
  return (
    <section className="dashboard-section">
      <div className="section-title-wrap">
        <h2>Overview</h2>
        <p>Your learning and career activity at a glance.</p>
      </div>
      <div className="stats-grid">
      {stats.map((stat, idx) => (
        <StatCard key={stat.label} {...stat} delay={idx + 1} />
      ))}
      </div>
    </section>
  );
}

// ========== Feature Card ==========
function FeatureCard({ icon, title, desc, label, path, accent, delay, navigate }) {
  return (
    <div
      className="feature-card fade-in-up"
      style={{ '--card-accent': accent, animationDelay: `${delay * 0.12}s` }}
    >
      <div className="feature-icon">{icon}</div>
      <div className="feature-title">{title}</div>
      <p className="feature-desc">{desc}</p>
      <button
        className="feature-btn"
        onClick={() => navigate(path)}
        aria-label={`Go to ${title}`}
      >
        {label} →
      </button>
    </div>
  );
}

function FeatureGrid({ features, navigate }) {
  return (
    <section className="dashboard-section">
      <div className="section-title-wrap">
        <h2>Explore UniBridge</h2>
        <p>Jump into the tools you use every day.</p>
      </div>
      <div className="features-grid">
      {features.map((feat, idx) => (
        <FeatureCard key={feat.title} {...feat} delay={idx + 1} navigate={navigate} />
      ))}
      </div>
    </section>
  );
}

// ========== Recent Activity Item ==========
function RecentItem({ icon, title, meta, navigate, path }) {
  return (
    <div className="recent-item" onClick={() => navigate(path)} role="button" tabIndex={0}>
      <div className="recent-icon">{icon}</div>
      <div className="recent-content">
        <h4>{title}</h4>
        <p>{meta}</p>
      </div>
      <span className="recent-arrow">›</span>
    </div>
  );
}

function RecentActivity({ activities, navigate }) {
  return (
    <section className="recent-section fade-in-up">
      <div className="recent-header">
        <h2>⚡ Recent Activity</h2>
        <span className="recent-badge">Live Feed</span>
      </div>
      <div className="recent-grid">
        {activities.length > 0 ? (
          activities.map((item) => (
            <RecentItem key={`${item.title}-${item.meta}`} {...item} navigate={navigate} />
          ))
        ) : (
          <div className="recent-item">
            <div className="recent-icon">ℹ️</div>
            <div className="recent-content">
              <h4>No recent activity yet</h4>
              <p>Start exploring materials, jobs, and kuppi sessions to see updates here.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ========== Main Component ==========
const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    profileCompletion: 0,
    materialsSaved: 0,
    kuppisJoined: 0,
    savedJobs: 0,
    recentActivity: [],
  });
  const [myKuppis, setMyKuppis] = useState([]);
  const [myKuppiLoading, setMyKuppiLoading] = useState(true);
  const [myKuppiError, setMyKuppiError] = useState('');
  const [editingKuppiId, setEditingKuppiId] = useState('');
  const [kuppiSaving, setKuppiSaving] = useState(false);
  const [kuppiForm, setKuppiForm] = useState({
    title: '',
    module: '',
    year: '',
    semester: '',
    date: '',
    time: '',
    location: '',
    description: '',
    maxParticipants: ''
  });

  const fetchMyKuppis = async () => {
    try {
      setMyKuppiLoading(true);
      const headers = getAuthHeaders();
      const res = await axios.get(`${API_BASE}/kuppi/posts/mine`, { headers });
      setMyKuppis(res.data?.data || []);
      setMyKuppiError('');
    } catch (err) {
      setMyKuppiError(err.response?.data?.message || 'Failed to load your Kuppi sessions');
    } finally {
      setMyKuppiLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'student') return;
    fetchMyKuppis();
  }, [user?.id, user?.role]);

  const startEditKuppi = (kuppi) => {
    const dateObj = new Date(kuppi.date);
    const datePart = Number.isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
    const timePart = Number.isNaN(dateObj.getTime())
      ? ''
      : dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

    setEditingKuppiId(kuppi._id);
    setKuppiForm({
      title: kuppi.title || '',
      module: kuppi.module || '',
      year: kuppi.year || '',
      semester: kuppi.semester || '',
      date: datePart,
      time: timePart,
      location: kuppi.location || '',
      description: kuppi.description || '',
      maxParticipants: kuppi.maxParticipants ? String(kuppi.maxParticipants) : ''
    });
    setMyKuppiError('');
  };

  const cancelEditKuppi = () => {
    setEditingKuppiId('');
    setKuppiForm({
      title: '',
      module: '',
      year: '',
      semester: '',
      date: '',
      time: '',
      location: '',
      description: '',
      maxParticipants: ''
    });
    setMyKuppiError('');
  };

  const saveKuppiUpdate = async (e) => {
    e.preventDefault();
    setMyKuppiError('');

    const title = normalizeSpace(kuppiForm.title);
    const moduleCode = kuppiForm.module.trim().toUpperCase();
    const year = kuppiForm.year;
    const semester = kuppiForm.semester;
    const location = normalizeSpace(kuppiForm.location);
    const description = normalizeSpace(kuppiForm.description);
    const maxRaw = String(kuppiForm.maxParticipants || '').trim();

    if (title.length < 5 || title.length > 120) {
      setMyKuppiError('Session title must be between 5 and 120 characters.');
      return;
    }

    if (!/^[A-Z]{2,6}\d{2,4}[A-Z]?$/.test(moduleCode)) {
      setMyKuppiError('Module code must look like PHY101 or CS2040.');
      return;
    }

    if (!YEAR_OPTIONS.includes(year)) {
      setMyKuppiError('Please select a valid academic year.');
      return;
    }

    if (!SEMESTER_OPTIONS.includes(semester)) {
      setMyKuppiError('Please select a valid semester.');
      return;
    }

    if (!location || !isValidHttpUrl(location)) {
      setMyKuppiError('Kuppi link must be a valid http/https URL.');
      return;
    }

    if (description.length < 10 || description.length > 1000) {
      setMyKuppiError('Description must be between 10 and 1000 characters.');
      return;
    }

    if (!kuppiForm.date || !kuppiForm.time) {
      setMyKuppiError('Date and time are required.');
      return;
    }

    const dateIso = `${kuppiForm.date}T${kuppiForm.time}:00`;
    if (Number.isNaN(new Date(dateIso).getTime()) || new Date(dateIso) <= new Date()) {
      setMyKuppiError('Date and time must be in the future.');
      return;
    }

    if (maxRaw && (!/^\d+$/.test(maxRaw) || Number(maxRaw) < 2 || Number(maxRaw) > 500)) {
      setMyKuppiError('Max participants must be between 2 and 500.');
      return;
    }

    try {
      setKuppiSaving(true);
      const headers = getAuthHeaders();
      await axios.put(`${API_BASE}/kuppi/posts/${editingKuppiId}`, {
        title,
        module: moduleCode,
        year,
        semester,
        date: dateIso,
        location,
        description,
        maxParticipants: maxRaw
      }, { headers });
      cancelEditKuppi();
      fetchMyKuppis();
    } catch (err) {
      setMyKuppiError(err.response?.data?.message || 'Failed to update Kuppi session');
    } finally {
      setKuppiSaving(false);
    }
  };

  const deleteKuppi = async (kuppiId) => {
    const confirmed = window.confirm('Delete this Kuppi session?');
    if (!confirmed) return;

    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_BASE}/kuppi/posts/${kuppiId}`, { headers });
      if (editingKuppiId === kuppiId) {
        cancelEditKuppi();
      }
      fetchMyKuppis();
    } catch (err) {
      setMyKuppiError(err.response?.data?.message || 'Failed to delete Kuppi session');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const headers = getAuthHeaders();

        const [studentProfileRes, materialsRes, kuppiPostsRes, savedJobsRes, applicationsRes] = await Promise.all([
          axios.get(`${API_BASE}/uni/students/profile`, { headers }),
          axios.get(`${API_BASE}/materials`, { headers }),
          axios.get(`${API_BASE}/kuppi/posts`, { headers }),
          axios.get(`${API_BASE}/saved-jobs`, { headers }),
          axios.get(`${API_BASE}/applications/portal/mine`, { headers }),
        ]);

        const profile = studentProfileRes.data || {};
        const profileCompletion = calculateProfileCompletion(profile);

        const materials = materialsRes.data?.data || [];
        const materialsSaved = materials.filter((material) => material.userLiked).length;

        const kuppiPosts = kuppiPostsRes.data?.data || [];
        const kuppisJoined = kuppiPosts.filter((post) => post.userJoined).length;

        const savedJobsList = savedJobsRes.data?.data || [];
        const savedJobs = savedJobsList.length;

        const myApplications = applicationsRes.data?.data || [];
        const userId = user?.id;

        const activityItems = [
          ...materials
            .filter((material) => String(material.studentId) === String(userId))
            .map((material) => ({
              icon: '📚',
              title: `You uploaded: ${material.title}`,
              meta: `${formatRelativeTime(material.createdAt)} · Lecture Materials`,
              path: '/student/materials',
              timestamp: material.createdAt,
            })),
          ...kuppiPosts
            .filter((post) => post.userJoined)
            .map((post) => ({
              icon: '🎓',
              title: `You joined Kuppi: ${post.title}`,
              meta: `${formatRelativeTime(post.createdAt || post.date)} · Kuppi Hub`,
              path: '/student/kuppi',
              timestamp: post.createdAt || post.date,
            })),
          ...savedJobsList.map((savedJob) => ({
            icon: '🔖',
            title: `Saved job: ${savedJob.jobId?.title || 'Job opportunity'}`,
            meta: `${formatRelativeTime(savedJob.createdAt)} · Saved Jobs`,
            path: '/student/job-portal/saved',
            timestamp: savedJob.createdAt,
          })),
          ...myApplications.map((application) => ({
            icon: '💼',
            title: `Applied to: ${application.jobId?.title || 'Job opportunity'}`,
            meta: `${formatRelativeTime(application.createdAt || application.appliedAt)} · Job Portal`,
            path: '/student/job-portal/applications',
            timestamp: application.createdAt || application.appliedAt,
          })),
        ]
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
          .slice(0, 5)
          .map(({ timestamp, ...rest }) => rest);

        if (!isMounted) return;

        setDashboardData({
          profileCompletion,
          materialsSaved,
          kuppisJoined,
          savedJobs,
          recentActivity: activityItems,
        });
      } catch (error) {
        if (!isMounted) return;
        setDashboardData((prev) => ({ ...prev, recentActivity: [] }));
      }
    };

    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user?.id]);

  const stats = useMemo(() => ([
    { icon: '📚', value: dashboardData.materialsSaved, label: 'Materials Saved' },
    { icon: '🎓', value: dashboardData.kuppisJoined, label: 'Kuppis Joined' },
    { icon: '🔖', value: dashboardData.savedJobs, label: 'Saved Jobs' },
  ]), [dashboardData.materialsSaved, dashboardData.kuppisJoined, dashboardData.savedJobs]);

  const features = [
    {
      icon: '📚', title: 'Lecture Materials', accent: '#3b82f6',
      desc: 'Browse, upload, and share study notes, slides, and resources with your batch.',
      label: 'Explore Materials', path: '/student/materials',
    },
    {
      icon: '💼', title: 'Job Portal', accent: '#f59e0b',
      desc: 'Discover internships, graduate roles, and career opportunities curated for students.',
      label: 'Browse Jobs', path: '/student/job-portal',
    },
    {
      icon: '🎓', title: 'Kuppi Hub', accent: '#ec489a',
      desc: 'Organise or join peer study sessions. Collaborative learning, made easy.',
      label: 'Open Kuppi Hub', path: '/student/kuppi',
    },
    {
      icon: '🔖', title: 'Saved Jobs', accent: '#10b981',
      desc: 'Keep track of job opportunities you are interested in and apply later.',
      label: 'View Saved', path: '/student/job-portal/saved',
    },
  ];

  const recentActivity = dashboardData.recentActivity;

  return (
    <>
      <ParticleCanvas />
      <div className="student-dashboard">
        <div className="container">
          <div className="dashboard-top-grid">
            <Hero user={user} navigate={navigate} />
            <ProfileSnapshot user={user} navigate={navigate} profileCompletion={dashboardData.profileCompletion} />
          </div>
          <StatGrid stats={stats} />
          <FeatureGrid features={features} navigate={navigate} />
          <RecentActivity activities={recentActivity} navigate={navigate} />

          {user?.role === 'student' && (
            <section className="dashboard-section">
              <div className="section-title-wrap">
                <h2>My Kuppi Sessions</h2>
                <p>Manage sessions you created directly from your dashboard.</p>
              </div>

              {myKuppiError && <div className="alert alert-error">{myKuppiError}</div>}

              {myKuppiLoading ? (
                <div className="recent-item">
                  <div className="recent-icon">⏳</div>
                  <div className="recent-content">
                    <h4>Loading your Kuppi sessions...</h4>
                  </div>
                </div>
              ) : myKuppis.length === 0 ? (
                <div className="recent-item">
                  <div className="recent-icon">🎓</div>
                  <div className="recent-content">
                    <h4>No Kuppi sessions created yet</h4>
                    <p>Create one from Kuppi Hub and manage it here.</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {myKuppis.map((k) => (
                    <div key={k._id} className="card" style={{ padding: '16px', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>{k.title}</h3>
                          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                            {k.module}
                            {k.year ? ` | ${k.year}` : ''}
                            {k.semester ? ` | ${k.semester}` : ''}
                            {' | '}
                            {new Date(k.date).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-outline" type="button" onClick={() => startEditKuppi(k)}>Edit</button>
                          <button className="btn" type="button" onClick={() => deleteKuppi(k._id)} style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>Delete</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                        <a href={k.location} target="_blank" rel="noreferrer">{k.location}</a>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>{k.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {editingKuppiId && (
                <form onSubmit={saveKuppiUpdate} className="card" style={{ marginTop: '18px', padding: '18px', borderRadius: '14px' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Edit Kuppi Session</h3>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Session Title</label>
                    <input value={kuppiForm.title} onChange={(e) => setKuppiForm((prev) => ({ ...prev, title: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Module</label>
                    <input value={kuppiForm.module} onChange={(e) => setKuppiForm((prev) => ({ ...prev, module: e.target.value }))} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Year</label>
                      <select value={kuppiForm.year} onChange={(e) => setKuppiForm((prev) => ({ ...prev, year: e.target.value }))} required>
                        <option value="">Select year</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Semester</label>
                      <select value={kuppiForm.semester} onChange={(e) => setKuppiForm((prev) => ({ ...prev, semester: e.target.value }))} required>
                        <option value="">Select semester</option>
                        {SEMESTER_OPTIONS.map((semester) => (
                          <option key={semester} value={semester}>{semester}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Date</label>
                      <input type="date" value={kuppiForm.date} onChange={(e) => setKuppiForm((prev) => ({ ...prev, date: e.target.value }))} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label>Time</label>
                      <input type="time" value={kuppiForm.time} onChange={(e) => setKuppiForm((prev) => ({ ...prev, time: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Kuppi Link</label>
                    <input type="url" value={kuppiForm.location} onChange={(e) => setKuppiForm((prev) => ({ ...prev, location: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label>Max Participants (Optional)</label>
                    <input type="number" min={2} max={500} value={kuppiForm.maxParticipants} onChange={(e) => setKuppiForm((prev) => ({ ...prev, maxParticipants: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Description</label>
                    <textarea value={kuppiForm.description} onChange={(e) => setKuppiForm((prev) => ({ ...prev, description: e.target.value }))} required />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" type="submit" disabled={kuppiSaving}>{kuppiSaving ? 'Saving...' : 'Save Kuppi'}</button>
                    <button className="btn btn-outline" type="button" onClick={cancelEditKuppi}>Cancel</button>
                  </div>
                </form>
              )}
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentHome;