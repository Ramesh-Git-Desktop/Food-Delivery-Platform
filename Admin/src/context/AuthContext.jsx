import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { fetchCsrfToken, clearCsrfToken } from '../services/csrf';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Bootstrap: restore user from storage & pre-fetch CSRF token ──────────
    useEffect(() => {
        const storedUser = localStorage.getItem('adminUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('adminUser');
            }
        }
        setLoading(false);

        // Pre-warm the CSRF token silently — failure here is non-fatal;
        // login() will try again and surface a clear error if still failing.
        fetchCsrfToken().catch(() => {
            console.warn('CSRF pre-fetch failed. Will retry on login.');
        });
    }, []);

    // ── Listen for forced logouts triggered by the 401 interceptor ───────────
    useEffect(() => {
        const handleForcedLogout = () => setUser(null);
        window.addEventListener('auth:logout', handleForcedLogout);
        return () => window.removeEventListener('auth:logout', handleForcedLogout);
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        // Always attempt a fresh fetch — returns cached token if one exists
        const token = await fetchCsrfToken();

        if (!token) {
            // Give the developer an actionable message instead of a vague network error
            throw new Error(
                'Could not reach the server to get a security token. ' +
                'Please check that your backend is running and that ' +
                'GET /api/csrf-token is registered as a public route.'
            );
        }

        try {
            const response = await api.post('/admin/login', { email, password });

            // Trust the HTTP 200 — Axios throws on 4xx/5xx automatically
            const userData = response.data?.data;
            if (!userData) return false;

            setUser(userData);
            localStorage.setItem('adminUser', JSON.stringify(userData));
            return true;
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || 'Unknown error';

                if (status === 403) {
                    // CSRF token was stale — clear cache so next attempt re-fetches
                    clearCsrfToken();
                    throw new Error('Security token expired. Please refresh the page and try again.');
                } else if (status === 401) {
                    throw new Error('Invalid email or password.');
                } else {
                    throw new Error(message);
                }
            } else if (error.request) {
                throw new Error('No response from server. Please check your network.');
            } else {
                throw new Error(error.message);
            }
        }
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await api.post('/admin/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
        localStorage.removeItem('adminUser');
        clearCsrfToken(); // Ensure next login fetches a fresh token
    };

    const value = { user, login, logout, loading };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};