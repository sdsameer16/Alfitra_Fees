import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.get('/auth/logout'),
};

// Students API
export const studentsAPI = {
  getStudents: (params = {}) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  getStudentsByClass: (classId) => api.get(`/students/class/${classId}`),
  getFeeDefaulters: () => api.get('/students/defaulters'),
  getClasses: () => Promise.resolve({ data: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'] }),
  getClassFees: () => api.get('/students/class-fees'),
  updateClassFees: (feeData) => api.put('/students/class-fees', feeData),
  promoteAllStudents: () => api.post('/students/promote-all'),
};

// Fees API
export const feesAPI = {
  getFees: (params = {}) => api.get('/fees', { params }),
  getFee: (id) => api.get(`/fees/${id}`),
  createFee: (feeData) => api.post('/fees', feeData),
  updateFee: (id, feeData) => api.put(`/fees/${id}`, feeData),
  deleteFee: (id) => api.delete(`/fees/${id}`),
  getFeesByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  getFeesByDateRange: (startDate, endDate) => 
    api.get('/fees/date-range', { params: { startDate, endDate } }),
  getFeeSummary: () => api.get('/fees/summary'),
};

export default api;
