import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentProfileApi } from '../../services/api';
import { FaCheckCircle, FaProjectDiagram, FaChartBar, FaMicrochip, FaBriefcase, FaHardHat, FaBullhorn, FaSearch, FaCogs, FaHeadset, FaCoins, FaGraduationCap, FaUsers } from 'react-icons/fa';
import '../../styles/professionalProfile.css';

const ViewStudentProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getStudentProfileApi(id);
                setProfile(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load student profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="loading-container" style={{ padding: '120px', textAlign: 'center' }}><h2>Loading professional profile...</h2></div>;

    if (error || !profile) return (
        <div className="error-container" style={{ padding: '120px', textAlign: 'center' }}>
            <h2>{error || 'Student profile not found.'}</h2>
            <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/employer/dashboard')}>Back to Dashboard</button>
        </div>
    );

    return (
        <div className="prof-profile-page fade-in-up" style={{ paddingBottom: '60px' }}>
            <div className="prof-container">
                <div style={{ marginBottom: '24px' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ← Back
                    </button>
                </div>

                {/* Header Section */}
                <section className="prof-header-card">
                    <div className="prof-user-info">
                        <div className="prof-avatar">
                            {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                        </div>
                        <div className="prof-title-group">
                            <h1>{profile?.firstName} {profile?.lastName}</h1>
                            <p className="headline-text">{profile?.profileHeadline || 'Student'}</p>
                            <div className="prof-contact-meta">
                                <span>{profile?.phone || 'No phone'}</span> • <span>{profile?.email}</span>
                            </div>
                        </div>
                    </div>
                    {profile?.isAvailable && (
                        <div className="prof-status-section">
                            <div className="badge badge-success" style={{ padding: '8px 16px', borderRadius: '20px' }}>
                                Available for Opportunities
                            </div>
                        </div>
                    )}
                </section>

                <div className="prof-main-layout">
                    <main className="prof-content" style={{ width: '100%' }}>
                        {/* Academic Profile */}
                        {(profile.university || profile.degree) && (
                            <Section title="Academic Core" icon={<FaGraduationCap />} isStarted={true}>
                                <div className="data-display" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <strong>{profile.university}</strong>
                                    {profile.degree && <span>Degree: {profile.degree}</span>}
                                    {profile.department && <span>Department: {profile.department}</span>}
                                    {profile.year && <span>Year of Study: {profile.year}</span>}
                                </div>
                            </Section>
                        )}
                        
                        {/* Target Job */}
                        {profile.targetJob?.title && (
                            <Section title="Target Job" icon={<FaCheckCircle />} isStarted={true}>
                                <div className="data-display">
                                    <strong>{profile.targetJob.title}</strong>
                                    <p>{profile.targetJob.jobType} • {profile.targetJob.location}</p>
                                </div>
                            </Section>
                        )}

                        {/* Bio */}
                        {profile.bio && (
                            <Section title="About" icon={<FaCheckCircle />} isStarted={true}>
                                <p>{profile.bio}</p>
                            </Section>
                        )}

                        {/* Work Experience */}
                        <Section title="Work Experience" icon={<FaCheckCircle />} isStarted={profile.workExperience?.length > 0}>
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
                        <Section title="Education & Qualifications" icon={<FaCheckCircle />} isStarted={profile.education?.length > 0}>
                            {profile.education?.map((edu, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{edu.degree} in {edu.fieldOfStudy}</strong>
                                        <span>{edu.institution} ({edu.endDate})</span>
                                    </div>
                                </div>
                            ))}
                        </Section>

                        {/* Skills */}
                        <Section title="Skills & Expertise" icon={<FaCheckCircle />} isStarted={profile.skills?.length > 0}>
                            <div className="skill-tags">
                                {profile.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                            </div>
                        </Section>

                        {/* Projects (Additive) */}
                        <Section title="Projects" icon={<FaProjectDiagram />} isStarted={profile.projects?.length > 0}>
                            {profile.projects?.map((proj, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{proj.title}</strong>
                                        {proj.link && <a href={proj.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: '13px' }}>View Project</a>}
                                    </div>
                                    <p>{proj.description}</p>
                                </div>
                            ))}
                        </Section>

                        {/* Certifications (Additive) */}
                        <Section title="Certifications" icon={<FaCheckCircle />} isStarted={profile.certifications?.length > 0}>
                            {profile.certifications?.map((cert, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{cert.name}</strong>
                                        <span>{cert.issuer} ({new Date(cert.date).getFullYear()})</span>
                                    </div>
                                </div>
                            ))}
                        </Section>



                        {/* Languages */}
                        <Section title="Languages" icon={<FaCheckCircle />} isStarted={profile.languages?.length > 0}>
                            <div className="language-list">
                                {profile.languages?.map(l => <span key={l.language}>{l.language} ({l.proficiency})</span>)}
                            </div>
                        </Section>
                    </main>
                </div>
            </div>
        </div>
    );
};

const Section = ({ title, icon, children, isStarted }) => (
    <div className="prof-section-card">
        <div className="section-header">
            <div className="title-area">
                <h3>{title}</h3>
            </div>
        </div>
        <div className="section-body">
            {isStarted ? children : <p className="empty-hint">No details provided for {title.toLowerCase()}.</p>}
        </div>
    </div>
);

export default ViewStudentProfile;
