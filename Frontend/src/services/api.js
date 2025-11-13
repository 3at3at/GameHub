import axios from 'axios';

const API_BASE_URL = 'http://localhost:5041/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const shopsService = {
  getAll: (params) => api.get('/shops', { params }),
  getById: (id) => api.get(`/shops/${id}`),
};

export const gamingStationsService = {
  getByShop: (shopId) => api.get(`/gamingstations/shop/${shopId}`),
  getAvailable: (params) => api.get('/gamingstations/available', { params }),
};

export const reservationsService = {
  getMyReservations: () => api.get('/reservations'),
  create: (data) => api.post('/reservations', data),
  cancel: (id) => api.delete(`/reservations/${id}`),
  complete: (id) => api.post(`/reservations/${id}/complete`),
};

export const tournamentsService = {
  getAll: (params) => api.get('/tournaments', { params }),
  getById: (id) => api.get(`/tournaments/${id}`),
  register: (id) => api.post(`/tournaments/${id}/register`),
  getMyRegistrations: () => api.get('/tournaments/my-registrations'),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getTournaments: () => api.get('/admin/tournaments'),
  createTournament: (formData) => api.post('/admin/tournaments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteTournament: (id) => api.delete(`/admin/tournaments/${id}`),
  getShops: () => api.get('/admin/shops'),
  createShop: (data) => api.post('/admin/shops', data),
};

export default api;

