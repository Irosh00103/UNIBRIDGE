import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const EMPTY_FORM = {
    title: '',
    company: '',
    location: '',
    venue: '',
    type: 'Internship',
    workMode: 'Hybrid',
    category: '',
    experience: '',
    qualification: '',
    salary: '',
    salaryRange: '',
    applyLink: '',
    logo: '',
    sideSummary: '',
    overview: '',
    description: '',
    responsibilitiesText: '',
    requirementsText: '',
    skillsText: '',
    screeningQuestionsText: '',
    deadline: '',
};

const toLineArray = (value) =>
    value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

const CreateJob = () => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { user } = useAuth();

    const validate = () => {
        let tempErrors = {};
        if (!formData.title) tempErrors.title = 'Title is required';
        if (!formData.company) tempErrors.company = 'Company is required';
        if (!formData.location) tempErrors.location = 'Location is required';
        if (!formData.overview) tempErrors.overview = 'Overview is required';
        if (!formData.description) tempErrors.description = 'Description is required';
        if (!formData.applyLink) tempErrors.applyLink = 'Apply link is required';
        else if (!formData.applyLink.startsWith('http')) tempErrors.applyLink = 'Apply link must start with http:// or https://';
        if (formData.logo && !formData.logo.startsWith('http')) {
            tempErrors.logo = 'Logo URL must start with http:// or https://';
        }

        const responsibilities = toLineArray(formData.responsibilitiesText);
        const requirements = toLineArray(formData.requirementsText);

        if (responsibilities.length === 0) {
            tempErrors.responsibilitiesText = 'Add at least one responsibility (one per line)';
        }
        if (requirements.length === 0) {
            tempErrors.requirementsText = 'Add at least one requirement (one per line)';
        }

        if (!formData.deadline) {
            tempErrors.deadline = 'Deadline is required';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (deadlineDate <= today) {
                tempErrors.deadline = 'Deadline must be a future date';
            }
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setApiError('');
        
        if (!validate()) return;
        
        setLoading(true);
        try {
            const responsibilities = toLineArray(formData.responsibilitiesText);
            const requirements = toLineArray(formData.requirementsText);
            const skills = toLineArray(formData.skillsText);
            const screeningLines = toLineArray(formData.screeningQuestionsText);

            const payload = {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                venue: formData.venue,
                type: formData.type,
                workMode: formData.workMode,
                category: formData.category,
                experience: formData.experience,
                qualification: formData.qualification,
                salary: formData.salary,
                salaryRange: formData.salaryRange,
                applyLink: formData.applyLink,
                logo: formData.logo,
                sideSummary: formData.sideSummary,
                overview: formData.overview,
                description: formData.description,
                responsibilities,
                requirements,
                skills,
                screeningQuestions: screeningLines.map((question, index) => ({
                    id: `sq-${index + 1}`,
                    type: 'textarea',
                    question,
                    options: [],
                })),
                deadline: formData.deadline,
                postedDate: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                }),
            };

            const token = localStorage.getItem('ub_token');
            const res = await axios.post('http://localhost:5000/api/jobs', payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (res.data.success) {
                setSuccessMsg('Job posted successfully to the student market! 🚀');
                setFormData(EMPTY_FORM);
                setErrors({});
                setTimeout(() => {
                    navigate(user?.role === 'admin' ? '/admin/dashboard' : '/employer/dashboard');
                }, 2000);
            }
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    const handleFillSample = () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);
        const formattedDate = futureDate.toISOString().split('T')[0];

        setFormData({
            title: 'Full Stack Developer Intern',
            company: 'UniBridge Partner Company',
            location: 'Colombo, Sri Lanka',
            venue: 'Colombo Office + Remote',
            type: 'Internship',
            workMode: 'Hybrid',
            category: 'Software Engineering',
            experience: '0 - 1 year',
            qualification: 'Undergraduate in Computer Science or related field',
            salary: 'Competitive internship allowance',
            salaryRange: 'LKR 45,000 - 70,000',
            applyLink: 'https://company.example.com/jobs/123',
            logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623',
            sideSummary: 'Work with senior engineers on production-grade web features for student-focused platforms.',
            overview: 'Join our engineering team to build and improve modern web applications used by university students and recruiters.',
            description: 'We are looking for an enthusiastic full stack developer intern to join our growing team. You will work on real projects using React and Node.js. Strong communication skills required.',
            responsibilitiesText: 'Build reusable frontend components in React.\nCollaborate with backend developers on API integration.\nWrite clean, maintainable, and tested code.\nParticipate in sprint planning and demo sessions.',
            requirementsText: 'Solid understanding of JavaScript and modern ES6 syntax.\nExperience with React and REST APIs.\nBasic understanding of Node.js and databases.\nStrong communication and teamwork skills.',
            skillsText: 'React\nNode.js\nExpress\nMongoDB\nGit\nProblem Solving',
            screeningQuestionsText: 'Why are you interested in this internship?\nDescribe a project where you solved a challenging bug.\nHow would you approach learning a new technology quickly?',
            deadline: formattedDate,
        });
        setErrors({});
    };

    return (
        <div className="container page fade-in-up" style={{ padding: '100px 24px 60px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link
                    to={user?.role === 'admin' ? '/admin/dashboard' : '/employer/dashboard'}
                    style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '15px', fontWeight: '600' }}
                >
                    ← Back to Command Center
                </Link>
            </div>
            
            <div className="page-header" style={{ marginBottom: '40px', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--text-main)' }}>Publish Job Opportunity</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Post internships and full-time roles directly to the student portal.</p>
                        <div className="auth-badge" style={{ marginTop: '14px' }}>Employers & Admins</div>
                </div>
            </div>

            <div className="card" style={{ padding: '40px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
                <button type="button" className="btn btn-outline" style={{ width: '100%', marginBottom: '24px', borderStyle: 'dashed' }} onClick={handleFillSample}>✨ Auto-fill Sample Data</button>
                
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                {apiError && <div className="alert alert-error">{apiError}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Job Title / Role</label>
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Software Engineering Intern" />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Company Name</label>
                            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. UniBridge Partners" />
                            {errors.company && <span className="error-text">{errors.company}</span>}
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Location</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Colombo, Sri Lanka" />
                            {errors.location && <span className="error-text">{errors.location}</span>}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Venue / Office</label>
                            <input type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} placeholder="Remote / Hybrid / Colombo" />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Work Mode</label>
                            <select value={formData.workMode} onChange={e => setFormData({...formData, workMode: e.target.value})}>
                                <option value="On-site">On-site</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Employment Type</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Internship">Internship</option>
                                <option value="Graduate Role">Graduate Role</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Category</label>
                            <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Software Engineering" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Experience</label>
                            <input type="text" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 0 - 1 year" />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Qualification</label>
                            <input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. Undergraduate in CS" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Salary (Short)</label>
                            <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="e.g. Competitive internship allowance" />
                        </div>
                        <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                            <label>Salary Range</label>
                            <input type="text" value={formData.salaryRange} onChange={e => setFormData({...formData, salaryRange: e.target.value})} placeholder="e.g. LKR 45,000 - 70,000" />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>External Application Link *</label>
                        <input type="url" value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} placeholder="https://careers.google.com/..." />
                        {errors.applyLink && <span className="error-text">{errors.applyLink}</span>}
                    </div>

                    <div className="form-group">
                        <label>Company Logo URL (optional)</label>
                        <input type="url" value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="https://..." />
                        {errors.logo && <span className="error-text">{errors.logo}</span>}
                    </div>

                    <div className="form-group">
                        <label>Side Summary</label>
                        <textarea
                            value={formData.sideSummary}
                            onChange={e => setFormData({...formData, sideSummary: e.target.value})}
                            style={{ minHeight: '90px' }}
                            placeholder="Short summary shown in cards and side panels."
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Overview *</label>
                        <textarea
                            value={formData.overview}
                            onChange={e => setFormData({...formData, overview: e.target.value})}
                            style={{ minHeight: '120px' }}
                            placeholder="Main job overview shown in Job Portal details page."
                        ></textarea>
                        {errors.overview && <span className="error-text">{errors.overview}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Role Description</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})} 
                            style={{ minHeight: '160px' }}
                            placeholder="Describe the role, tech stack, requirements, and responsibilities..."
                        ></textarea>
                        {errors.description && <span className="error-text">{errors.description}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Key Responsibilities (one per line)</label>
                        <textarea
                            value={formData.responsibilitiesText}
                            onChange={e => setFormData({...formData, responsibilitiesText: e.target.value})}
                            style={{ minHeight: '140px' }}
                            placeholder={'Design and implement features\nCollaborate with cross-functional teams\nReview and improve code quality'}
                        ></textarea>
                        {errors.responsibilitiesText && <span className="error-text">{errors.responsibilitiesText}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Qualifications & Requirements (one per line)</label>
                        <textarea
                            value={formData.requirementsText}
                            onChange={e => setFormData({...formData, requirementsText: e.target.value})}
                            style={{ minHeight: '140px' }}
                            placeholder={'Strong fundamentals in programming\nExperience with React and REST APIs\nExcellent communication skills'}
                        ></textarea>
                        {errors.requirementsText && <span className="error-text">{errors.requirementsText}</span>}
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Skills (one per line)</label>
                        <textarea
                            value={formData.skillsText}
                            onChange={e => setFormData({...formData, skillsText: e.target.value})}
                            style={{ minHeight: '120px' }}
                            placeholder={'React\nNode.js\nSQL\nCommunication'}
                        ></textarea>
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Screening Questions (one per line)</label>
                        <textarea
                            value={formData.screeningQuestionsText}
                            onChange={e => setFormData({...formData, screeningQuestionsText: e.target.value})}
                            style={{ minHeight: '120px' }}
                            placeholder={'Why are you interested in this role?\nDescribe a relevant project you built.'}
                        ></textarea>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '32px' }}>
                        <label>Application Deadline</label>
                        <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                        {errors.deadline && <span className="error-text">{errors.deadline}</span>}
                    </div>
                    
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }} disabled={loading || !!successMsg}>
                        {loading ? 'Posting to Campus...' : 'Publish to Student Market'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
