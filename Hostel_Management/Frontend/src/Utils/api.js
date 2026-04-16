import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (token expired) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verify: () => api.get('/auth/verify'),
};

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getMonthlyRevenue: () => api.get('/dashboard/revenue'),
  getRoomOccupancy: () => api.get('/dashboard/occupancy'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getComplaintStats: () => api.get('/dashboard/complaint-stats'),
};

// ─────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getComplaints: (id) => api.get(`/students/${id}/complaints`),
};

// ─────────────────────────────────────────
// ROOMS
// ─────────────────────────────────────────
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  getStudents: (id) => api.get(`/rooms/${id}/students`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  allocate: (data) => api.post('/rooms/allocate', data),
  vacate: (allocationId) => api.put(`/rooms/vacate/${allocationId}`),
};

// ─────────────────────────────────────────
// FEES
// ─────────────────────────────────────────
export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  markAsPaid: (id, data) => api.put(`/fees/${id}/pay`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  checkOverdue: () => api.get('/fees/check-overdue'),
};

// ─────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────
export const staffAPI = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  delete: (id) => api.delete(`/staff/${id}`),
};

// ─────────────────────────────────────────
// NOTICES
// ─────────────────────────────────────────
export const noticeAPI = {
  getAll: () => api.get('/notices'),
  create: (data) => api.post('/notices', data),
  delete: (id) => api.delete(`/notices/${id}`),
};

// ─────────────────────────────────────────
// COMPLAINTS
// ─────────────────────────────────────────
export const complaintAPI = {
  getAll: (params) => api.get('/complaints', { params }),
  create: (data) => api.post('/complaints', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  delete: (id) => api.delete(`/complaints/${id}`),
};

export default api;