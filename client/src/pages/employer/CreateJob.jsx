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

const toLineArray = (value = '') =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

export default function CreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const temp = {};
    const textOnlyRegex = /^[A-Za-z\s]+$/;

    if (!formData.title.trim()) temp.title = 'Job title is required';

    if (!formData.company.trim()) {
      temp.company = 'Company name is required';
    } else if (!textOnlyRegex.test(formData.company)) {
      temp.company = 'Numbers and symbols are not allowed';
    }

    if (!formData.location.trim()) temp.location = 'Location is required';
    if (!formData.overview.trim()) temp.overview = 'Overview is required';
    if (!formData.description.trim())
      temp.description = 'Description is required';

    if (!formData.applyLink.trim()) {
      temp.applyLink = 'Apply link is required';
    } else if (!formData.applyLink.startsWith('http')) {
      temp.applyLink = 'Apply link must start with http:// or https://';
    }

    if (formData.logo && !formData.logo.startsWith('http')) {
      temp.logo = 'Logo URL must start with http:// or https://';
    }

    if (toLineArray(formData.responsibilitiesText).length === 0) {
      temp.responsibilitiesText = 'Add at least one responsibility';
    }

    if (toLineArray(formData.requirementsText).length === 0) {
      temp.requirementsText = 'Add at least one requirement';
    }

    if (!formData.deadline) temp.deadline = 'Deadline is required';

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleFillSample = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    setFormData({
      title: 'Full Stack Developer Intern',
      company: 'UniBridge Partner Company',
      location: 'Colombo, Sri Lanka',
      venue: 'Colombo Office + Remote',
      type: 'Internship',
      workMode: 'Hybrid',
      category: 'Software Engineering',
      experience: '0 - 1 year',
      qualification:
        'Undergraduate in Computer Science or related field',
      salary: 'Competitive internship allowance',
      salaryRange: 'LKR 45,000 - 70,000',
      applyLink: 'https://company.example.com/jobs/123',
      logo:
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623',
      sideSummary:
        'Work with senior engineers on production-grade web features.',
      overview:
        'Join our engineering team to build modern applications.',
      description:
        'We are looking for an enthusiastic intern to join our growing team.',
      responsibilitiesText:
        'Build reusable frontend components\nIntegrate APIs\nWrite clean code',
      requirementsText:
        'Knowledge of JavaScript\nReact basics\nTeamwork skills',
      skillsText: 'React\nNode.js\nMongoDB\nGit',
      screeningQuestionsText:
        'Why are you interested?\nDescribe a project you built.',
      deadline: futureDate.toISOString().split('T')[0],
    });

    setErrors({});
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setSuccessMsg('');
  setApiError('');

  if (!validate()) return;

  setLoading(true);

  try {
    const screeningLines = toLineArray(
      formData.screeningQuestionsText
    );

    const payload = {
      ...formData,

      responsibilities: toLineArray(
        formData.responsibilitiesText
      ),

      requirements: toLineArray(
        formData.requirementsText
      ),

      skills: toLineArray(formData.skillsText),

      screeningQuestions: screeningLines.map(
        (question, index) => ({
          id: `sq-${index + 1}`,
          type: 'textarea',
          question,
          options: [],
        })
      ),

      postedDate: new Date().toLocaleDateString(
        'en-GB'
      ),
    };

    const token = localStorage.getItem('ub_token');

    const res = await axios.post(
      'http://localhost:5000/api/jobs',
      payload,
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    if (res.data.success) {
      setSuccessMsg('Job posted successfully 🚀');
      setFormData(EMPTY_FORM);

      setTimeout(() => {
        navigate(
          user?.role === 'admin'
            ? '/admin/dashboard'
            : '/employer/dashboard'
        );
      }, 1500);
    }
  } catch (err) {
    setApiError(
      err.response?.data?.message ||
        'Failed to post job'
    );
  } finally {
    setLoading(false);
  }
};

  const renderInput = (
    label,
    key,
    placeholder,
    type = 'text'
  ) => (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={formData[key]}
        onChange={(e) => updateField(key, e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
      {errors[key] && <span style={errorStyle}>{errors[key]}</span>}
    </div>
  );

  const renderArea = (
    label,
    key,
    placeholder,
    minHeight = '140px'
  ) => (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={formData[key]}
        onChange={(e) => updateField(key, e.target.value)}
        placeholder={placeholder}
        style={{ ...textareaStyle, minHeight }}
      />
      {errors[key] && <span style={errorStyle}>{errors[key]}</span>}
    </div>
  );

  return (
    <div style={page}>
      <div style={container}>
        <Link
          to={
            user?.role === 'admin'
              ? '/admin/dashboard'
              : '/employer/dashboard'
          }
          style={backBtn}
        >
          ← Back to Dashboard
        </Link>

        <div style={card}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <h1 style={titleStyle}>Publish Job Opportunity</h1>
            <p style={subStyle}>
              Post internships and full-time roles to the
              student market.
            </p>
          </div>

          <button
            type="button"
            onClick={handleFillSample}
            style={sampleBtn}
          >
            ✨ Auto-fill Sample Data
          </button>

          {successMsg && (
            <div style={successBox}>{successMsg}</div>
          )}
          {apiError && <div style={errorBox}>{apiError}</div>}

          <form onSubmit={handleSubmit}>
            <div style={grid}>
              {renderInput(
                'Job Title',
                'title',
                'Software Engineer Intern'
              )}
              {renderInput(
                'Company',
                'company',
                'UniBridge'
              )}
              {renderInput(
                'Location',
                'location',
                'Colombo, Sri Lanka'
              )}
              {renderInput(
                'Venue',
                'venue',
                'Remote / Hybrid'
              )}
              {renderInput(
                'Category',
                'category',
                'Software Engineering'
              )}
              {renderInput(
                'Experience',
                'experience',
                '0 - 1 year'
              )}
              {renderInput(
                'Qualification',
                'qualification',
                'Undergraduate'
              )}
              {renderInput(
                'Salary',
                'salary',
                'Competitive'
              )}
              {renderInput(
                'Salary Range',
                'salaryRange',
                'LKR 50,000 - 70,000'
              )}
              {renderInput(
                'Apply Link',
                'applyLink',
                'https://...',
                'url'
              )}
              {renderInput(
                'Logo URL',
                'logo',
                'https://...',
                'url'
              )}
              {renderInput(
                'Deadline',
                'deadline',
                '',
                'date'
              )}
            </div>

            <div style={{ marginTop: 18 }}>
              {renderArea(
                'Side Summary',
                'sideSummary',
                'Short summary',
                '100px'
              )}
              {renderArea(
                'Overview',
                'overview',
                'Main overview'
              )}
              {renderArea(
                'Description',
                'description',
                'Describe role'
              )}
              {renderArea(
                'Responsibilities',
                'responsibilitiesText',
                'One per line'
              )}
              {renderArea(
                'Requirements',
                'requirementsText',
                'One per line'
              )}
              {renderArea(
                'Skills',
                'skillsText',
                'React\nNode.js'
              )}
              {renderArea(
                'Screening Questions',
                'screeningQuestionsText',
                'One per line'
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={submitBtn}
            >
              {loading
                ? 'Posting to Campus...'
                : 'Publish to Student Market'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const page = {
  minHeight: '100vh',
  padding: '40px 20px',
  background:
    'linear-gradient(135deg,#0f172a,#111827,#1e293b)',
};

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const backBtn = {
  color: '#cbd5e1',
  textDecoration: 'none',
  fontWeight: '700',
  display: 'inline-block',
  marginBottom: '20px',
};

const card = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,.12)',
  backdropFilter: 'blur(16px)',
  borderRadius: '24px',
  padding: '32px',
  boxShadow: '0 20px 60px rgba(0,0,0,.35)',
};

const titleStyle = {
  color: '#fff',
  fontSize: '42px',
  margin: 0,
};

const subStyle = {
  color: '#cbd5e1',
  marginTop: '10px',
};

const grid = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit,minmax(260px,1fr))',
  gap: '18px',
};

const fieldWrap = {
  marginBottom: '18px',
};

const labelStyle = {
  display: 'block',
  color: '#e5e7eb',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '600',
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.06)',
  color: '#fff',
  outline: 'none',
};

const textareaStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,.12)',
  background: 'rgba(255,255,255,.06)',
  color: '#fff',
  outline: 'none',
};

const submitBtn = {
  width: '100%',
  marginTop: '24px',
  padding: '16px',
  border: 'none',
  borderRadius: '16px',
  background:
    'linear-gradient(90deg,#3b82f6,#8b5cf6)',
  color: '#fff',
  fontSize: '18px',
  fontWeight: '800',
  cursor: 'pointer',
};

const sampleBtn = {
  width: '100%',
  marginBottom: '24px',
  padding: '14px',
  borderRadius: '14px',
  border: '1px dashed rgba(255,255,255,.25)',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: '700',
};

const successBox = {
  background: 'rgba(16,185,129,.18)',
  color: '#d1fae5',
  padding: '14px',
  borderRadius: '14px',
  marginBottom: '18px',
};

const errorBox = {
  background: 'rgba(239,68,68,.18)',
  color: '#fecaca',
  padding: '14px',
  borderRadius: '14px',
  marginBottom: '18px',
};

const errorStyle = {
  display: 'block',
  color: '#fca5a5',
  marginTop: '6px',
  fontSize: '13px',
};