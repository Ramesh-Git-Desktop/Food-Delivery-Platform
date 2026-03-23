import axios from 'axios';
import { getCsrfToken } from './csrf';

const getApiBaseUrl = () => {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    } else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Sends the httpOnly auth cookie on every request
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attach CSRF token to every mutating request (POST, PUT, PATCH, DELETE)
api.interceptors.request.use((config) => {
    if (config.method !== 'get') {
        const token = getCsrfToken();
        if (token) {
            config.headers['X-CSRF-Token'] = token;
            console.log('Added CSRF token to request:', config.url);
        } else {
            console.warn('CSRF token missing for request:', config.url);
        }
    }
    return config;
});

// ─── Response Interceptor ───────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            // FIX: Remove persisted user data from storage
            localStorage.removeItem('adminUser');

            // FIX: Dispatch a custom event so AuthContext can sync React state.
            // Directly mutating localStorage doesn't trigger a re-render;
            // this event bridges the gap without a circular import.
            window.dispatchEvent(new Event('auth:logout'));

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (status === 403) {
            console.error('CSRF validation failed or forbidden:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default api;