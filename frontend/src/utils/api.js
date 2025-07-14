// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = 'https://store-rating-app-mysqlhost.up.railway.app'; // Your backend base URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // only needed if backend uses cookies or session auth
});

export default api;
