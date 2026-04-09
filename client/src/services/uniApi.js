import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/uni',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ub_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const uniAuthAPI = {
  registerEmployer: (payload) => API.post('/auth/register/employer', payload),
  registerStudent: (payload) => API.post('/auth/register/student', payload),
  login: (payload) => API.post('/auth/login', payload),
  me: () => API.get('/auth/me'),
};

export const uniEmployersAPI = {
  all: () => API.get('/employers/all'),
  profile: () => API.get('/employers/profile'),
  updateProfile: (payload) => API.put('/employers/profile', payload),
};

export const uniStudentsAPI = {
  profile: () => API.get('/students/profile'),
  updateProfile: (payload) => API.put('/students/profile', payload),
};

export const uniJobsAPI = {
  all: () => API.get('/jobs/all'),
  list: () => API.get('/jobs'),
  detail: (id) => API.get(`/jobs/${id}`),
  create: (payload) => API.post('/jobs', payload),
  close: (id) => API.put(`/jobs/${id}/close`),
};

export const uniApplicationsAPI = {
  submit: (formData) => API.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: () => API.get('/applications'),
  updateStatus: (id, status) => API.put(`/applications/${id}/status`, { status }),
  downloadCv: (id) => API.get(`/applications/${id}/cv`, { responseType: 'blob' }),
};

export const uniNotificationsAPI = {
  list: () => API.get('/notifications'),
  unreadCount: () => API.get('/notifications/unread-count'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};
