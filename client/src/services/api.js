import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const formatAlert = (notification) => ({
  ...notification,
  company: notification.company || "UniBridge",
  time: notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "",
});

export const getAlerts = async () => {
  const res = await API.get("/notifications");
  const list = res.data?.data || [];
  return { data: list.map(formatAlert) };
};

export const getJobs = async () => {
  const res = await API.get("/jobs/portal");
  const list = res.data?.data || res.data || [];
  return { data: list };
};

export const markAlertAsRead = (id) => API.patch(`/notifications/${id}/read`);

export const markAllAlertsAsRead = () => API.patch("/notifications/read-all");

export const deleteAlertApi = (id) => API.delete(`/notifications/${id}`);

export const deleteSelectedAlertsApi = (ids) =>
  API.delete("/notifications/bulk-delete", { data: { ids } });
