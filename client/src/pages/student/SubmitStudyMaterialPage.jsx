import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = ['Academic Context', 'Study Material Info', 'Submit Request'];

const SubmitStudyMaterialPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    year: '',
    semester: '',
    module: '',
    description: '',
    category: 'lecture',
    tags: '',
    link: ''
  });

  const titleCount = useMemo(() => form.title.length, [form.title]);
  const descriptionCount = useMemo(() => form.description.length, [form.description]);

  const validateCurrentStep = () => {
    const nextErrors = {};

    if (step === 0) {
      if (form.title.trim().length < 5 || form.title.trim().length > 120) {
        nextErrors.title = 'Title must be 5-120 characters';
      }
      if (!form.year) nextErrors.year = 'Year is required';
      if (!form.semester) nextErrors.semester = 'Semester is required';
      if (!form.module.trim()) nextErrors.module = 'Module is required';
    }

    if (step === 1) {
      if (form.description.trim().length < 20 || form.description.trim().length > 1000) {
        nextErrors.description = 'Description must be 20-1000 characters';
      }
      if (!form.link.trim()) {
        nextErrors.link = 'Resource link is required';
      } else {
        try {
          const parsed = new URL(form.link.trim());
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            nextErrors.link = 'Link must start with http:// or https://';
          }
        } catch {
          nextErrors.link = 'Please provide a valid URL';
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, 2));
  };

  const goBack = () => {
    if (step === 0) {
      navigate('/student/materials');
      return;
    }
    setStep((current) => Math.max(current - 1, 0));
  };

  const submitRequest = async () => {
    try {
      setSubmitting(true);
      setErrors({});

      await axios.post('http://localhost:5000/api/materials', {
        title: form.title,
        year: form.year,
        semester: form.semester,
        module: form.module,
        description: form.description,
        category: form.category,
        tags: form.tags,
        type: 'PDF',
        link: form.link
      });

      setStatus('Submitted successfully. Your material is now pending admin review.');
      setTimeout(() => navigate('/student/materials'), 1500);
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Submit Study Material</h1>
        <p className="mt-1 text-sm text-slate-600">Complete the 3-step workflow and submit for review.</p>
      </div>

      <div className="card-soft">
        <div className="stepper-row">
          {steps.map((item, index) => (
            <div key={item} className={`stepper-item ${index <= step ? 'active' : ''}`}>
              <span className="stepper-index">{index + 1}</span>
              <span className="stepper-label">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft space-y-3">
        {step === 0 && (
          <>
            <label className="text-sm font-medium text-slate-700">Title ({titleCount}/120)</label>
            <input className="input-base" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}

            <div className="grid gap-3 md:grid-cols-3">
              <select className="input-base" value={form.year} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}>
                <option value="">Select Year</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <select className="input-base" value={form.semester} onChange={(event) => setForm((current) => ({ ...current, semester: event.target.value }))}>
                <option value="">Select Semester</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
              <input className="input-base" placeholder="Module" value={form.module} onChange={(event) => setForm((current) => ({ ...current, module: event.target.value }))} />
            </div>
            {(errors.year || errors.semester || errors.module) && (
              <p className="text-xs text-red-600">{errors.year || errors.semester || errors.module}</p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <label className="text-sm font-medium text-slate-700">Description ({descriptionCount}/1000)</label>
            <textarea className="input-base" rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}

            <input className="input-base" placeholder="Category (lecture, tutorial, notes...)" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} />
            <input className="input-base" placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            <input className="input-base" placeholder="Resource Link (https://...)" value={form.link} onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))} />
            {errors.link && <p className="text-xs text-red-600">{errors.link}</p>}
          </>
        )}

        {step === 2 && (
          <div className="rounded border border-slate-200 bg-slate-50 p-4 text-sm">
            <p><strong>Title:</strong> {form.title}</p>
            <p><strong>Year / Semester:</strong> {form.year} / {form.semester}</p>
            <p><strong>Module:</strong> {form.module}</p>
            <p><strong>Category:</strong> {form.category}</p>
            <p><strong>Tags:</strong> {form.tags || 'N/A'}</p>
            <p><strong>Resource Link:</strong> {form.link}</p>
          </div>
        )}

        {status && <div className="alert alert-success">{status}</div>}
        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

        <div className="flex justify-between gap-2">
          <button type="button" className="btn-secondary" onClick={goBack}>{step === 0 ? 'Cancel' : 'Back'}</button>
          {step < 2 ? (
            <button type="button" className="btn-primary" onClick={goNext}>Continue</button>
          ) : (
            <button type="button" className="btn-primary" onClick={submitRequest} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitStudyMaterialPage;
