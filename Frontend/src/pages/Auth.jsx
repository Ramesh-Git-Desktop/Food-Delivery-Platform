import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../CSS/Auth.css';
import foodImage from '../assets/image.png';

const Auth = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        resetEmail: '',
        newPassword: '',
        newConfirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [resetLinkSent, setResetLinkSent] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') setShowPassword(p => !p);
        else if (field === 'newPassword') setShowNewPassword(p => !p);
        else if (field === 'newConfirm') setShowNewConfirmPassword(p => !p);
    };

    const validateLoginForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        return newErrors;
    };

    const handleForgotPassword = () => {
        setIsForgotPassword(true);
        setResetLinkSent(false);
    };

    const handleBackToLogin = () => {
        setIsForgotPassword(false);
        setIsResetPassword(false);
        setResetLinkSent(false);
        setErrors({});
        setFormData(prev => ({ ...prev, resetEmail: '', newPassword: '', newConfirmPassword: '' }));
    };

    const handleSendResetLink = (e) => {
        e.preventDefault();
        if (!formData.resetEmail) {
            setErrors({ resetEmail: 'Please enter your email address' });
            return;
        }
        if (!formData.resetEmail.includes('@') || !formData.resetEmail.includes('.')) {
            setErrors({ resetEmail: 'Please enter a valid email address' });
            return;
        }
        setIsLoading(true);
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.some(u => u.email === formData.resetEmail);
        setTimeout(() => {
            if (!userExists) {
                setErrors({ resetEmail: 'No account found with this email' });
                setIsLoading(false);
                return;
            }
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const resetLink = `${window.location.origin}/reset-password?token=${token}&email=${encodeURIComponent(formData.resetEmail)}`;
            alert(`🔗 Reset Link (Demo):\n\n${resetLink}\n\nClick OK to proceed.`);
            sessionStorage.setItem('resetToken', token);
            sessionStorage.setItem('resetEmail', formData.resetEmail);
            sessionStorage.setItem('resetExpiry', Date.now() + 3600000);
            setResetLinkSent(true);
            setIsLoading(false);
            setTimeout(() => {
                setIsForgotPassword(false);
                setIsResetPassword(true);
            }, 2000);
        }, 1500);
    };

    const handleNewPasswordSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.newPassword) newErrors.newPassword = 'New password is required';
        else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
        if (!formData.newConfirmPassword) newErrors.newConfirmPassword = 'Please confirm your password';
        else if (formData.newPassword !== formData.newConfirmPassword) newErrors.newConfirmPassword = 'Passwords do not match';
        const storedToken = sessionStorage.getItem('resetToken');
        const storedEmail = sessionStorage.getItem('resetEmail');
        const expiry = sessionStorage.getItem('resetExpiry');
        if (!storedToken || !storedEmail || Date.now() > parseInt(expiry)) {
            newErrors.general = 'Reset link has expired. Please request a new one.';
        }
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setIsLoading(true);
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.email === storedEmail);
            if (userIndex !== -1) {
                users[userIndex].password = formData.newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
            sessionStorage.removeItem('resetToken');
            sessionStorage.removeItem('resetEmail');
            sessionStorage.removeItem('resetExpiry');
            alert('✅ Password reset successfully! Please login with your new password.');
            setIsResetPassword(false);
            setIsLoading(false);
            setFormData(prev => ({ ...prev, newPassword: '', newConfirmPassword: '' }));
        }, 1500);
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateLoginForm();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
        setIsLoading(true);
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === formData.email && u.password === formData.password);
            if (user) {
                // ✅ Login via AuthContext — navbar auto-updates
                login({
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    phone: user.phone
                });
                navigate('/'); // ✅ Redirect to home after login
            } else {
                setErrors({ general: 'Invalid email or password. Please try again.' });
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="auth-container">
            <div className="auth-content">
                {/* Left Side – Image */}
                <div className="auth-image-section" style={{ backgroundImage: `url(${foodImage})` }}>
                    <div className="image-overlay">
                        <h2 className="image-title">Delicious food,<br />delivered to you.</h2>
                        <p className="image-subtitle">Join our community of food lovers today.</p>
                    </div>
                </div>

                {/* Right Side – Form */}
                <div className={`auth-form-section${isForgotPassword ? ' forgot-password-mode' : ''}${isResetPassword ? ' reset-password-mode' : ''}`}>
                    <div className="form-wrapper">

                        {/* ── Reset Password ── */}
                        {isResetPassword ? (
                            <>
                                <div className="back-to-login" onClick={handleBackToLogin} style={{ cursor: 'pointer' }}>
                                    <FaArrowLeft /> Back to Login
                                </div>
                                <h1 className="auth-title">Reset Password</h1>
                                <p className="reset-instruction">Enter your new password below.</p>
                                {errors.general && <div className="error-message general-error">{errors.general}</div>}
                                <form onSubmit={handleNewPasswordSubmit}>
                                    <div className="input-group">
                                        <input
                                            type="email" placeholder="Email" className="auth-input"
                                            value={sessionStorage.getItem('resetEmail') || ''} readOnly disabled
                                        />
                                    </div>
                                    <div className={`input-group password-field${errors.newPassword ? ' error' : ''}`}>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'} name="newPassword"
                                            placeholder="New Password (min. 8 characters)" className="auth-input"
                                            value={formData.newPassword} onChange={handleInputChange} disabled={isLoading}
                                        />
                                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('newPassword')} disabled={isLoading}>
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                                    </div>
                                    <div className={`input-group password-field${errors.newConfirmPassword ? ' error' : ''}`}>
                                        <input
                                            type={showNewConfirmPassword ? 'text' : 'password'} name="newConfirmPassword"
                                            placeholder="Confirm New Password" className="auth-input"
                                            value={formData.newConfirmPassword} onChange={handleInputChange} disabled={isLoading}
                                        />
                                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('newConfirm')} disabled={isLoading}>
                                            {showNewConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.newConfirmPassword && <span className="error-text">{errors.newConfirmPassword}</span>}
                                    </div>
                                    <button type="submit" className={`continue-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
                                        {isLoading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </>

                            /* ── Forgot Password ── */
                        ) : isForgotPassword ? (
                            <>
                                <div className="back-to-login" onClick={handleBackToLogin} style={{ cursor: 'pointer' }}>
                                    <FaArrowLeft /> Back to Login
                                </div>
                                <h1 className="auth-title">Forgot Password</h1>
                                <p className="reset-instruction">Enter your email and we'll send a reset link.</p>
                                {resetLinkSent && <div className="success-message">✅ Reset link sent! Check your email.</div>}
                                {errors.general && <div className="error-message general-error">{errors.general}</div>}
                                <form onSubmit={handleSendResetLink}>
                                    <div className={`input-group${errors.resetEmail ? ' error' : ''}`}>
                                        <input
                                            type="email" name="resetEmail" placeholder="Email" className="auth-input"
                                            value={formData.resetEmail} onChange={handleInputChange}
                                            disabled={isLoading || resetLinkSent}
                                        />
                                        {errors.resetEmail && <span className="error-text">{errors.resetEmail}</span>}
                                    </div>
                                    <button type="submit" className={`continue-btn${isLoading ? ' loading' : ''}`} disabled={isLoading || resetLinkSent}>
                                        {isLoading ? 'Sending...' : resetLinkSent ? 'Link Sent!' : 'Send Reset Link'}
                                    </button>
                                </form>
                                {!resetLinkSent && (
                                    <>
                                        <div className="divider"><span>OR</span></div>
                                        <div className="social-buttons">
                                            <button className="social-btn google-btn" type="button" disabled={isLoading}>
                                                <img src="https://www.google.com/favicon.ico" alt="Google" className="social-icon" />
                                                Continue with Google
                                            </button>
                                            <button className="social-btn apple-btn" type="button" disabled={isLoading}>
                                                <img src="https://www.apple.com/favicon.ico" alt="Apple" className="social-icon" />
                                                Continue with Apple
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>

                            /* ── Login ── */
                        ) : (
                            <>
                                <h1 className="auth-title">Login</h1>
                                {errors.general && (
                                    <div className="alert alert-danger py-2 px-3 rounded-3 mb-3" role="alert">
                                        <small>{errors.general}</small>
                                    </div>
                                )}
                                <form onSubmit={handleLoginSubmit} noValidate>
                                    <div className={`input-group${errors.email ? ' error' : ''}`}>
                                        <input
                                            type="email" name="email" placeholder="Email" className="auth-input"
                                            value={formData.email} onChange={handleInputChange}
                                            disabled={isLoading} autoComplete="email"
                                        />
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>
                                    <div className={`input-group password-field${errors.password ? ' error' : ''}`}>
                                        <input
                                            type={showPassword ? 'text' : 'password'} name="password"
                                            placeholder="Password" className="auth-input"
                                            value={formData.password} onChange={handleInputChange}
                                            disabled={isLoading} autoComplete="current-password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('password')} disabled={isLoading}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && <span className="error-text">{errors.password}</span>}
                                    </div>
                                    <div className="forgot-password-row">
                                        <button type="button" className="forgot-password-link" onClick={handleForgotPassword} disabled={isLoading}>
                                            Forgot Password?
                                        </button>
                                    </div>
                                    <button type="submit" className={`continue-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
                                        {isLoading ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Logging in...
                                            </span>
                                        ) : 'Login'}
                                    </button>
                                </form>
                                <div className="divider"><span>OR</span></div>
                                <div className="social-buttons">
                                    <button className="social-btn google-btn" type="button" disabled={isLoading}>
                                        <img src="https://www.google.com/favicon.ico" alt="Google" className="social-icon" />
                                        Continue with Google
                                    </button>
                                    <button className="social-btn apple-btn" type="button" disabled={isLoading}>
                                        <img src="https://www.apple.com/favicon.ico" alt="Apple" className="social-icon" />
                                        Continue with Apple
                                    </button>
                                </div>
                                <p className="terms-text">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
                                <p className="toggle-auth">
                                    New to our platform?{' '}
                                    <Link to="/signup" className="toggle-link" style={{ textDecoration: 'underline' }}>
                                        Create account
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;