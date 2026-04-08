import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStudentProfileByEmailForEmployer } from '../../services/api';
import { FaCheckCircle, FaProjectDiagram, FaChartBar, FaMicrochip, FaBriefcase, FaHardHat, FaBullhorn, FaSearch, FaCogs, FaHeadset, FaCoins, FaGraduationCap, FaUsers } from 'react-icons/fa';
import '../../styles/professionalProfile.css';

const ViewStudentProfile = () => {
    const { state } = useLocation();
    const email = state?.email || '';
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                            <p className="headline-text">{profile?.currentPosition || 'Student'}</p>
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
                        {(profile.currentPosition || profile.educationItems?.length > 0) && (
                            <Section title="Academic Core" icon={<FaGraduationCap />} isStarted={true}>
                                <div className="data-display" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <strong>{profile.currentPosition || 'Student'}</strong>
                                    {profile.educationItems?.[0]?.title && <span>Degree: {profile.educationItems[0].title}</span>}
                                    {profile.educationItems?.[0]?.institution && <span>Institution: {profile.educationItems[0].institution}</span>}
                                </div>
                            </Section>
                        )}
                        
                        {/* Target Job */}
                        {profile.targetJob?.jobTitle && (
                            <Section title="Target Job" icon={<FaCheckCircle />} isStarted={true}>
                                <div className="data-display">
                                    <strong>{profile.targetJob.jobTitle}</strong>
                                    <p>{profile.targetJob.contractType || 'Any contract'} • {profile.targetJob.desiredLocation || 'Any location'}</p>
                                </div>
                            </Section>
                        )}

                        {/* Bio */}
                        {profile.targetJob?.summary && (
                            <Section title="About" icon={<FaCheckCircle />} isStarted={true}>
                                <p>{profile.targetJob.summary}</p>
                            </Section>
                        )}

                        {/* Work Experience */}
                        <Section title="Work Experience" icon={<FaCheckCircle />} isStarted={profile.workExperiences?.length > 0}>
                            {profile.workExperiences?.map((work, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{work.jobTitle || 'Role'} at {work.companyName || 'Company'}</strong>
                                        <span>{work.startDate || 'Start'} - {work.currentlyWorking ? 'Present' : (work.endDate || 'End')}</span>
                                    </div>
                                    <p>{work.description}</p>
                                </div>
                            ))}
                        </Section>

                        {/* Education */}
                        <Section title="Education & Qualifications" icon={<FaCheckCircle />} isStarted={profile.educationItems?.length > 0}>
                            {profile.educationItems?.map((edu, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{edu.level || 'Qualification'} in {edu.title || 'Title'}</strong>
                                        <span>{edu.institution || 'Institution'} ({edu.toDate || 'Present'})</span>
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
                        <Section title="Projects" icon={<FaProjectDiagram />} isStarted={Boolean(profile.educationItems?.find((item) => item.projectsInvolved))}>
                            {profile.educationItems?.filter((item) => item.projectsInvolved).map((proj, i) => (
                                <div key={i} className="data-item">
                                    <div className="item-header">
                                        <strong>{proj.title || 'Academic Project'}</strong>
                                    </div>
                                    <p>{proj.projectsInvolved}</p>
                                </div>
                            ))}
                        </Section>

                        {/* Certifications (Additive) */}
                        <Section title="Certifications" icon={<FaCheckCircle />} isStarted={Boolean(profile.otherAssets?.website || profile.otherAssets?.linkedin || profile.otherAssets?.github)}>
                            <div className="data-item">
                                <div className="item-header">
                                    <strong>Professional Links</strong>
                                </div>
                                <p>
                                    {profile.otherAssets?.linkedin ? `LinkedIn: ${profile.otherAssets.linkedin}` : 'LinkedIn not provided'}
                                </p>
                                <p>
                                    {profile.otherAssets?.github ? `GitHub: ${profile.otherAssets.github}` : 'GitHub not provided'}
                                </p>
                                <p>
                                    {profile.otherAssets?.website ? `Website: ${profile.otherAssets.website}` : 'Website not provided'}
                                </p>
                            </div>
                        </Section>



                        {/* Languages */}
                        <Section title="Languages" icon={<FaCheckCircle />} isStarted={profile.languages?.length > 0}>
                            <div className="language-list">
                                {profile.languages?.map((l) => <span key={l}>{l}</span>)}
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
