import axios from 'axios';

let csrfToken = null;
let tokenPromise = null;

const getApiBaseUrl = () => {
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    } else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    return 'http://localhost:5000/api';
};

export const fetchCsrfToken = async () => {
    // Return cached token if already fetched
    if (csrfToken) return csrfToken;

    // Deduplicate concurrent calls — share the in-flight promise
    if (tokenPromise) return tokenPromise;

    const apiBaseUrl = getApiBaseUrl();

    tokenPromise = axios
        .get(`${apiBaseUrl}/csrf-token`, { withCredentials: true })
        .then((response) => {
            csrfToken = response.data?.data?.csrfToken || response.data?.csrfToken || null;
            tokenPromise = null; // FIX: reset so future calls can re-fetch if needed
            return csrfToken;
        })
        .catch((error) => {
            console.error('Failed to fetch CSRF token:', error);
            tokenPromise = null; // FIX: reset on failure so the next call retries
            return null;
        });

    return tokenPromise;
};

// Synchronous getter used by the axios request interceptor
export const getCsrfToken = () => csrfToken;

// Call this after logout so the next login fetches a fresh token
export const clearCsrfToken = () => {
    csrfToken = null;
    tokenPromise = null;
};
