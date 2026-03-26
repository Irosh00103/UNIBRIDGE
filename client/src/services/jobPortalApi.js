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

// ── Profile (Job Portal style) ──
export const getPortalProfile = () => API.get('/profile/me');
export const savePortalProfile = (data) => API.put('/profile/me', data);

// ── Alerts ──
export const getAlerts = () => API.get('/alerts');
export const createAlert = (data) => API.post('/alerts', data);
export const markAlertAsRead = (id) => API.patch(`/alerts/${id}/read`);
export const markAllAlertsAsRead = () => API.patch('/alerts/read-all');
export const deleteAlertApi = (id) => API.delete(`/alerts/${id}`);
export const deleteSelectedAlertsApi = (ids) => API.delete('/alerts', { data: { ids } });
