import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Jobs ──
export const getPortalJobs = () => API.get('/jobs/portal');

// ── Applications ──
export const createPortalApplication = (data) => API.post('/applications/portal', data);
export const getMyPortalApplications = () => API.get('/applications/portal/mine');
export const deletePortalApplication = (id) => API.delete(`/applications/portal/${id}`);

// ── Saved Jobs ──
export const getSavedJobs = () => API.get('/saved-jobs');
export const saveJob = (data) => API.post('/saved-jobs', data);
export const deleteSavedJob = (id) => API.delete(`/saved-jobs/${id}`);




