import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaEdit, FaPlus, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../../styles/professionalProfile.css';

const ProfessionalProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'work', 'education', 'skills', 'languages', 'target', 'assets', 'headline'
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/uni/students/profile');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      { key: 'profileHeadline', score: 10 },
      { key: 'isAvailable', score: 5 },
      { key: 'bio', score: 10 },
      { key: 'education', score: 15, isArray: true },
      { key: 'workExperience', score: 20, isArray: true },
      { key: 'skills', score: 15, isArray: true },
      { key: 'languages', score: 10, isArray: true },
      { key: 'targetJob', score: 10, isNested: true }
    ];

    let total = 0;
    fields.forEach(f => {
      if (f.isArray && profile[f.key]?.length > 0) total += f.score;
      else if (f.isNested && Object.values(profile[f.key] || {}).some(v => !!v)) total += f.score;
      else if (!f.isArray && !f.isNested && !!profile[f.key]) total += f.score;
    });
    return Math.min(total, 100);
  };

  const updateProfile = async (data) => {
    try {
      const res = await axios.put('http://localhost:5000/api/uni/students/profile', data);
      setProfile(res.data);
      setSuccess('Profile updated successfully! ✨');
      setTimeout(() => setSuccess(''), 3000);
      setActiveModal(null);
    } catch (err) {
      setError('Update failed. Please try again.');
    }
  };

  const toggleAvailability = () => {
    updateProfile({ isAvailable: !profile.isAvailable });
  };

  if (loading) return <div className="loading-container" style={{padding: '120px', textAlign: 'center'}}><h2>Loading your professional profile...</h2></div>;

  if (error || !profile) return (
    <div className="error-container" style={{padding: '120px', textAlign: 'center'}}>
      <h2>{error || 'No student profile found.'}</h2>
      <p>Please make sure you are logged in as a student.</p>
      <button className="btn btn-primary" style={{marginTop: 20}} onClick={() => navigate('/student/home')}>Back to Home</button>
    </div>
  );

  const completion = calculateCompletion();

  return (
    <div className="prof-profile-page fade-in-up">
      <div className="prof-container">
        {/* Header Section */}
        <section className="prof-header-card">
          <div className="prof-user-info">
            <div className="prof-avatar">
              {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
            </div>
            <div className="prof-title-group">
              <h1>{profile?.firstName} {profile?.lastName}</h1>
              <p className="headline-text">
                {profile?.profileHeadline || 'No headline set'} 
                <button className="icon-btn-small" onClick={() => { setActiveModal('headline'); setFormData({ profileHeadline: profile?.profileHeadline }) }}><FaEdit /></button>
              </p>
              <div className="prof-contact-meta">
                <span>{profile?.phone || 'Phone not set'}</span> • <span>{user?.email}</span>
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
                className={`status-toggle ${profile?.isAvailable ? 'available' : ''}`}
                onClick={toggleAvailability}
              >
                {profile?.isAvailable ? 'Available' : 'Not Available'}
              </button>
            </div>
          </div>
        </section>

        <div className="prof-main-layout">
          {/* Sidebar */}
          <aside className="prof-sidebar">
            <div className="completion-card">
              <div className="completion-header">
                <strong>Complete your profile</strong>
                <span>{completion}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completion}%` }}></div>
              </div>
              <p>Track how much of your profile is filled and improve your visibility.</p>
            </div>

            <nav className="prof-nav">
              <button className="prof-nav-item active" onClick={() => navigate('/student/profile/professional')}>Professional Profile</button>
              <button className="prof-nav-item" onClick={() => navigate('/student/job-portal/applications')}>My Applications</button>
              <button className="prof-nav-item" onClick={() => navigate('/student/job-portal/saved')}>Saved Jobs</button>
              <div style={{ margin: '10px 0', borderTop: '1px solid #e2e8f0' }}></div>
              <button className="prof-nav-item" onClick={() => navigate('/profile')}>⚙️ Account Settings</button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="prof-content">
            {success && <div className="alert-success">{success}</div>}
            
            {/* Target Job */}
            <Section 
              title="Target Job" 
              icon={<FaCheckCircle />} 
              onAdd={() => { setActiveModal('target'); setFormData(profile.targetJob || {}) }}
              isStarted={Object.values(profile.targetJob || {}).some(v => !!v)}
            >
              {profile.targetJob?.title && (
                <div className="data-display">
                  <strong>{profile.targetJob.title}</strong>
                  <p>{profile.targetJob.jobType} • {profile.targetJob.location}</p>
                </div>
              )}
            </Section>

            {/* Work Experience */}
            <Section 
              title="Work Experience" 
              icon={<FaCheckCircle />} 
              onAdd={() => { setActiveModal('work'); setFormData({}) }}
              isStarted={profile.workExperience?.length > 0}
            >
              {profile.workExperience?.map((work, i) => (
                <div key={i} className="data-item">
                  <div className="item-header">
                    <strong>{work.role} at {work.company}</strong>
                    <span>{new Date(work.startDate).getFullYear()} - {work.current ? 'Present' : new Date(work.endDate).getFullYear()}</span>
                  </div>
                  <p>{work.description}</p>
                </div>
              ))}
            </Section>

            {/* Education */}
            <Section 
              title="Education & Qualifications" 
              icon={<FaCheckCircle />} 
              onAdd={() => { setActiveModal('education'); setFormData({}) }}
              isStarted={profile.education?.length > 0}
            >
              {profile.education?.map((edu, i) => (
                <div key={i} className="data-item">
                  <div className="item-header">
                    <strong>{edu.degree} in {edu.fieldOfStudy}</strong>
                    <span>{edu.institution}</span>
                  </div>
                </div>
              ))}
            </Section>

            {/* Skills */}
            <Section title="Skills & Expertise" icon={<FaCheckCircle />} onAdd={() => setActiveModal('skills')} isStarted={profile.skills?.length > 0}>
               <div className="skill-tags">
                 {profile.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
               </div>
            </Section>

            {/* Languages */}
            <Section title="Languages" icon={<FaCheckCircle />} onAdd={() => setActiveModal('languages')} isStarted={profile.languages?.length > 0}>
               <div className="language-list">
                 {profile.languages?.map(l => <span key={l.language}>{l.language} ({l.proficiency})</span>)}
               </div>
            </Section>
          </main>
        </div>
      </div>

      {/* Modals (Simplified for brevity) */}
      {activeModal === 'headline' && (
        <Modal title="Edit Headline" onClose={() => setActiveModal(null)} onSave={() => updateProfile(formData)}>
          <input 
            type="text" 
            value={formData.profileHeadline} 
            onChange={e => setFormData({ profileHeadline: e.target.value })}
            placeholder="e.g. Computer Science Student at University of Colombo"
          />
        </Modal>
      )}
      
      {activeModal === 'target' && (
        <Modal title="Target Job" onClose={() => setActiveModal(null)} onSave={() => updateProfile({ targetJob: formData })}>
          <div className="form-grid">
            <div className="form-col"><label>Title</label><input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="form-col"><label>Type</label><select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})}><option value="">Select</option><option value="Full-time">Full-time</option><option value="Internship">Internship</option></select></div>
          </div>
        </Modal>
      )}
      
      {activeModal === 'work' && (
        <Modal title="Add Work Experience" onClose={() => setActiveModal(null)} onSave={() => updateProfile({ workExperience: [...(profile.workExperience || []), formData] })}>
          <div className="form-grid">
            <div className="form-col"><label>Company</label><input type="text" onChange={e => setFormData({...formData, company: e.target.value})} /></div>
            <div className="form-col"><label>Role</label><input type="text" onChange={e => setFormData({...formData, role: e.target.value})} /></div>
            <div className="form-col"><label>Start Date</label><input type="date" onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
            <div className="form-col"><label>End Date</label><input type="date" disabled={formData.current} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
          </div>
          <div style={{marginTop: 15}}><label><input type="checkbox" onChange={e => setFormData({...formData, current: e.target.checked})} /> Currently working here</label></div>
          <div style={{marginTop: 15}}><label>Description</label><textarea style={{width: '100%', padding: 10, borderRadius: 8}} rows="3" onChange={e => setFormData({...formData, description: e.target.value})}></textarea></div>
        </Modal>
      )}

      {activeModal === 'education' && (
        <Modal title="Add Education" onClose={() => setActiveModal(null)} onSave={() => updateProfile({ education: [...(profile.education || []), formData] })}>
          <div className="form-grid">
            <div className="form-col"><label>Institution</label><input type="text" onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
            <div className="form-col"><label>Degree</label><input type="text" onChange={e => setFormData({...formData, degree: e.target.value})} /></div>
            <div className="form-col"><label>Field of Study</label><input type="text" onChange={e => setFormData({...formData, fieldOfStudy: e.target.value})} /></div>
            <div className="form-col"><label>End Year</label><input type="number" onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
          </div>
        </Modal>
      )}

      {activeModal === 'skills' && (
        <Modal title="Skills" onClose={() => setActiveModal(null)} onSave={() => updateProfile({ skills: formData.skills.split(',').map(s => s.trim()) })}>
          <label>Skills (comma separated)</label>
          <textarea 
            style={{width: '100%', padding: 10, borderRadius: 8}} 
            rows="4" 
            defaultValue={profile.skills?.join(', ')}
            onChange={e => setFormData({ skills: e.target.value })}
          ></textarea>
        </Modal>
      )}

      {activeModal === 'languages' && (
        <Modal title="Add Language" onClose={() => setActiveModal(null)} onSave={() => updateProfile({ languages: [...(profile.languages || []), formData] })}>
          <div className="form-grid">
            <div className="form-col"><label>Language</label><input type="text" onChange={e => setFormData({...formData, language: e.target.value})} /></div>
            <div className="form-col"><label>Proficiency</label>
              <select onChange={e => setFormData({...formData, proficiency: e.target.value})}>
                <option value="">Select</option>
                <option value="Elementary">Elementary</option>
                <option value="Professional Working">Professional Working</option>
                <option value="Native/Bilingual">Native/Bilingual</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Section = ({ title, icon, onAdd, children, isStarted }) => (
  <div className="prof-section-card">
    <div className="section-header">
      <div className="title-area">
        <h3>{title}</h3>
        {!isStarted && <span className="not-started-badge">Not started</span>}
      </div>
      <button className="add-btn" onClick={onAdd}><FaPlus /> Add</button>
    </div>
    <div className="section-body">
      {isStarted ? children : <p className="empty-hint">Tell recruiters more about your {title.toLowerCase()}.</p>}
    </div>
  </div>
);

const Modal = ({ title, children, onClose, onSave }) => (
  <div className="prof-modal-overlay">
    <div className="prof-modal">
      <div className="modal-header">
        <h3>{title}</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">{children}</div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={onSave}>Save Changes</button>
      </div>
    </div>
  </div>
);

export default ProfessionalProfile;
