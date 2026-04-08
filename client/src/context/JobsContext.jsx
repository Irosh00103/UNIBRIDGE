import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getPortalJobs,
  createPortalApplication,
  getMyPortalApplications,
  deletePortalApplication,
  saveJob as saveJobApi,
  getSavedJobs,
  deleteSavedJob,
} from '../services/jobPortalApi';

const JobsContext = createContext();

/* ── MAPPERS ── */

function mapBackendJob(job) {
  return {
    id: job._id,
    _id: job._id,
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    type: job.type || '',
    jobType: job.jobType || job.type || '',
    salary: job.salary || '',
    salaryRange: job.salaryRange || '',
    description: job.description || '',
    requirements: job.requirements || [],
    responsibilities: job.responsibilities || [],
    logo: job.logo || '',
    postedDate: job.postedDate || '',
    deadline: job.deadline || '',
    category: job.category || '',
    portalCategory: job.portalCategory || 'other',
    workMode: job.workMode || '',
    experience: job.experience || '',
    qualification: job.qualification || '',
    sideSummary: job.sideSummary || '',
    overview: job.overview || job.description || '',
    skills: job.skills || [],
    screeningQuestions: job.screeningQuestions || [],
    questions: job.questions || [],
    applyLink: job.applyLink || '',
    status: job.status || 'OPEN',
    venue: job.venue || '',
    employerName: job.employerName || '',
  };
}

function mapBackendApplication(app) {
  return {
    id: app._id,
    refNo: `APP-${app._id.slice(-6).toUpperCase()}`,
    appliedJob: app.jobId?.title || 'Unknown Job',
    company: app.jobId?.company || app.jobId?.employerName || 'Unknown',
    dateOfApply: app.createdAt || app.appliedAt,
    status: app.status || 'PENDING',
    jobId: app.jobId?._id || '',
    answers: app.screeningAnswers || {},
  };
}

function mapBackendSavedJob(saved) {
  return {
    id: saved.jobId?._id || '',
    savedId: saved._id,
    title: saved.jobId?.title || '',
    company: saved.jobId?.company || '',
    location: saved.jobId?.location || '',
    postedDate: saved.jobId?.postedDate || '',
    description: saved.jobId?.sideSummary || saved.jobId?.overview || '',
  };
}

/* ── PROVIDER ── */

export function JobsProvider({ children }) {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  const [savedJobs, setSavedJobs] = useState([]);
  const [savedJobsLoading, setSavedJobsLoading] = useState(true);

  /* ── FETCH JOBS ── */
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        const res = await getPortalJobs();
        const data = res.data.data || res.data;
        setJobs(Array.isArray(data) ? data.map(mapBackendJob) : []);
        setJobsError('');
      } catch (err) {
        setJobsError('Failed to load jobs');
        console.error(err);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  /* ── FETCH APPLICATIONS & SAVED ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setApplicationsLoading(true);
        setSavedJobsLoading(true);

        const [appsRes, savedRes] = await Promise.all([
          getMyPortalApplications(),
          getSavedJobs(),
        ]);

        const appsData = appsRes.data.data || appsRes.data;
        const savedData = savedRes.data.data || savedRes.data;

        setApplications(Array.isArray(appsData) ? appsData.map(mapBackendApplication) : []);
        setSavedJobs(Array.isArray(savedData) ? savedData.map(mapBackendSavedJob) : []);
      } catch (err) {
        console.error('Failed to load applications or saved jobs', err);
      } finally {
        setApplicationsLoading(false);
        setSavedJobsLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── APPLICATIONS ── */
  const addApplication = async (job, answers) => {
    const jobId = job._id || job.id;

    if (applications.some((a) => a.jobId === jobId)) {
      return { success: false, message: 'You have already applied for this job.' };
    }

    try {
      const res = await createPortalApplication({
        jobId,
        screeningAnswers: answers,
      });

      const saved = {
        id: res.data.data._id || res.data._id,
        refNo: `APP-${(res.data.data._id || res.data._id).slice(-6).toUpperCase()}`,
        appliedJob: job.title,
        company: job.company,
        dateOfApply: res.data.data?.createdAt || new Date().toISOString(),
        status: res.data.data?.status || 'PENDING',
        jobId,
        answers,
      };

      setApplications((prev) => [saved, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to submit application.' };
    }
  };

  const removeApplication = async (id) => {
    try {
      await deletePortalApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── SAVED JOBS ── */
  const saveJobAction = async (job) => {
    const jobId = job._id || job.id;
    if (savedJobs.some((s) => s.id === jobId)) {
      return { success: true, message: 'Already saved' };
    }

    try {
      const res = await saveJobApi({ jobId });
      const savedItem = {
        id: jobId,
        savedId: res.data.data?._id || res.data._id,
        title: job.title,
        company: job.company,
        location: job.location,
        postedDate: job.postedDate,
        description: job.sideSummary || job.overview,
      };
      setSavedJobs((prev) => [savedItem, ...prev]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to save job.',
      };
    }
  };

  const unsaveJob = async (jobId) => {
    const saved = savedJobs.find((s) => s.id === jobId);
    if (!saved?.savedId) {
      setSavedJobs((prev) => prev.filter((s) => s.id !== jobId));
      return { success: true };
    }
    try {
      await deleteSavedJob(saved.savedId);
      setSavedJobs((prev) => prev.filter((s) => s.id !== jobId));
      return { success: true };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove saved job.',
      };
    }
  };

  /* ── HELPERS ── */
  const isJobSaved = (jobId) => savedJobs.some((s) => s.id === jobId);
  const hasAppliedToJob = (jobId) => applications.some((a) => a.jobId === jobId);

  /* ── VALUE ── */
  const value = useMemo(
    () => ({
      jobs, jobsLoading, jobsError,
      applications, applicationsLoading,
      savedJobs, savedJobsLoading,
      addApplication, removeApplication,
      saveJob: saveJobAction, unsaveJob,
      isJobSaved, hasAppliedToJob,
    }),
    [jobs, jobsLoading, jobsError, applications, applicationsLoading, savedJobs, savedJobsLoading]
  );

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

/* ── HOOK ── */
export function useJobs() {
  return useContext(JobsContext);
}
