import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobs } from '../../context/JobsContext';
import { FaBookmark, FaRegBookmark, FaArrowLeft } from 'react-icons/fa';
import '../../styles/jobPortalDetail.css';

const JobPortalDetail = () => {
  const { id } = useParams();
  const { jobs, jobsLoading, isJobSaved, saveJob, unsaveJob, addApplication, hasAppliedToJob } = useJobs();
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const job = useMemo(() => jobs.find(j => j.id === id), [jobs, id]);

  if (jobsLoading) return <div className="jp-detail"><div className="loading">Loading job details…</div></div>;
  if (!job) return <div className="jp-detail"><div className="empty-state"><h3>Job not found</h3><p>The job you're looking for doesn't exist or has been removed.</p></div></div>;

  const applied = hasAppliedToJob(job.id);

  const handleAnswerChange = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleApply = async () => {
    setSubmitting(true);
    setErrorMsg('');
    const result = await addApplication(job, answers);
    setSubmitting(false);
    if (result.success) {
      setSuccessMsg('Application submitted successfully! ✅');
    } else {
      setErrorMsg(result.message);
    }
  };

  const toggleSave = () => {
    if (isJobSaved(job.id)) unsaveJob(job.id);
    else saveJob(job);
  };

  return (
    <div className="jp-detail fade-in-up">
      <Link to="/student/job-portal" className="jp-back-link"><FaArrowLeft /> Back to Job Portal</Link>

      {/* Header */}
      <div className="jp-detail-header">
        <div className="jp-detail-top">
          <div>
            <span className="jp-card-badge">{job.type || job.status}</span>
          </div>
          <button className={`jp-save-btn ${isJobSaved(job.id) ? 'saved' : ''}`} onClick={toggleSave} title={isJobSaved(job.id) ? 'Unsave' : 'Save'}>
            {isJobSaved(job.id) ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
        <h1 className="jp-detail-title">{job.title}</h1>
        <div className="jp-detail-company">🏢 {job.company || job.employerName}</div>
        <div className="jp-detail-meta">
          {job.location && <span className="jp-meta-tag">📍 {job.location}</span>}
          {job.workMode && <span className="jp-meta-tag">🏠 {job.workMode}</span>}
          {job.experience && <span className="jp-meta-tag">📊 {job.experience}</span>}
          {job.salary && <span className="jp-meta-tag">💰 {job.salary}</span>}
          {job.deadline && <span className="jp-meta-tag">📅 Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
          {job.qualification && <span className="jp-meta-tag">🎓 {job.qualification}</span>}
        </div>
        <div className="jp-detail-overview">{job.overview || job.description}</div>
        {job.applyLink && (
          <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 16 }}>
            Visit Official Apply Link
          </a>
        )}
      </div>

      {/* Responsibilities */}
      {job.responsibilities?.length > 0 && (
        <div className="jp-detail-section">
          <h2>📋 Responsibilities</h2>
          <ul>{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      {/* Requirements */}
      {job.requirements?.length > 0 && (
        <div className="jp-detail-section">
          <h2>✅ Requirements</h2>
          <ul>{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
      )}

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="jp-detail-section">
          <h2>🛠 Skills</h2>
          <div className="jp-detail-skills">
            {job.skills.map(s => <span key={s} className="jp-skill-tag">{s}</span>)}
          </div>
        </div>
      )}

      {/* Apply Section */}
      <div className="jp-detail-section">
        <h2>🚀 Apply Now</h2>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        {applied || successMsg ? (
          <div className="jp-applied-badge">✅ You have applied for this job</div>
        ) : (
          <>
            {/* Screening Questions */}
            {job.screeningQuestions?.length > 0 && (
              <div className="jp-screening">
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
                  Please answer the screening questions below before submitting your application.
                </p>
                {job.screeningQuestions.map(q => (
                  <div key={q.id} className="jp-screening-question">
                    <label>{q.question}</label>
                    {q.type === 'textarea' ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Type your answer here…"
                      />
                    ) : (
                      <select
                        value={answers[q.id] || ''}
                        onChange={e => handleAnswerChange(q.id, e.target.value)}
                      >
                        <option value="">Select an option…</option>
                        {(q.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="jp-detail-actions">
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default JobPortalDetail;
