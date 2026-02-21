import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to handle logic on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/token-auth/', credentials),
    signup: (userData) => api.post('/users/', userData),
    getMe: () => api.get('/users/me/'),
};

export const doctorAPI = {
    getAll: () => api.get('/doctors/'),
    getById: (id) => api.get(`/doctors/${id}/`),
};

export const patientAPI = {
    getAll: () => api.get('/patients/'),
    getProfile: () => api.get('/users/me/'),
    updateProfile: (data) => api.patch('/users/me/', data),
};

export const appointmentAPI = {
    getAll: () => api.get('/appointments/'),
    create: (data) => api.post('/appointments/', data),
    updateStatus: (id, status) => api.patch(`/appointments/${id}/`, { status }),
};

export const medicineAPI = {
    getAll: () => api.get('/medicines/'),
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats/'),
};

export const chatAPI = {
    getMessages: (appointmentId) => api.get(`/chat/${appointmentId}/`),
    sendMessage: (appointmentId, data) => api.post(`/chat/${appointmentId}/`, data),
};

export const recordingAPI = {
    getAll: () => api.get('/recordings/'),
    upload: (data) => api.post('/recordings/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const prescriptionAPI = {
    create: (data) => api.post('/prescriptions/', data),
};

export default api;
