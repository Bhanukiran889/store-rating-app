// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'https://store-rating-app-mysqlhost.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add token from localStorage or context (if needed)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or pull from your AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
