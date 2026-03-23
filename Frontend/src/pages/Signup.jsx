import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import '../CSS/Auth.css';
import foodImage from '../assets/image.png';

const Signup = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOtpVerification, setIsOtpVerification] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') setShowPassword(p => !p);
        else if (field === 'confirm') setShowConfirmPassword(p => !p);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.length !== 10) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        // Check if email already exists before sending OTP
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (existingUsers.some(u => u.email === formData.email)) {
            setErrors({ email: 'An account with this email already exists. Please login.' });
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            alert(`Your OTP is: ${newOtp}`); // Demo — in production this is emailed/SMS'd
            setIsOtpVerification(true);
            setIsLoading(false);
            setOtpError('');
        }, 1500);
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value) || value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) { setOtpError('Please enter the complete 6-digit OTP'); return; }
        if (otpValue !== generatedOtp) { setOtpError('Invalid OTP. Please try again.'); return; }

        setIsLoading(true);
        setTimeout(() => {
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                createdAt: new Date().toISOString()
            };
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            existingUsers.push(userData);
            localStorage.setItem('users', JSON.stringify(existingUsers));

            setIsLoading(false);
            alert('✅ Account created successfully! Please login.');
            navigate('/auth'); // ✅ Redirect to login page after registration
        }, 1500);
    };

    const handleResendOtp = () => {
        setIsLoading(true);
        setTimeout(() => {
            const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(newOtp);
            setOtp(['', '', '', '', '', '']);
            setOtpError('');
            alert(`New OTP: ${newOtp}`);
            setIsLoading(false);
            const firstInput = document.getElementById('otp-0');
            if (firstInput) firstInput.focus();
        }, 1000);
    };

    const handleBackToLogin = () => navigate('/auth');
    const handleBackFromOtp = () => {
        setIsOtpVerification(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        setGeneratedOtp('');
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
                <div className={`auth-form-section signup-mode${isOtpVerification ? ' otp-mode' : ''}`}>
                    <div className="form-wrapper">

                        {/* ── OTP Verification ── */}
                        {isOtpVerification ? (
                            <>
                                <div className="back-to-login" onClick={handleBackFromOtp} style={{ cursor: 'pointer' }}>
                                    <FaArrowLeft /> Back
                                </div>
                                <h1 className="auth-title">Verify OTP</h1>
                                <p className="otp-instruction">
                                    Enter the 6-digit code sent to<br />
                                    <strong>{formData.email}</strong>
                                </p>
                                {otpError && (
                                    <div className="otp-error-message">⚠️ {otpError}</div>
                                )}
                                <form onSubmit={handleOtpSubmit}>
                                    <div className="otp-container">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                className={`otp-input${otpError ? ' error' : ''}`}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                autoFocus={index === 0}
                                                disabled={isLoading}
                                            />
                                        ))}
                                    </div>
                                    <button type="submit" className={`continue-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
                                        {isLoading ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Verifying...
                                            </span>
                                        ) : 'Verify OTP'}
                                    </button>
                                </form>
                                <div className="resend-otp-row">
                                    <span className="resend-text">Didn't receive code?</span>
                                    <button type="button" className="resend-otp-link" onClick={handleResendOtp} disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Resend OTP'}
                                    </button>
                                </div>
                            </>

                            /* ── Signup Form ── */
                        ) : (
                            <>
                                <div className="back-to-login" onClick={handleBackToLogin} style={{ cursor: 'pointer' }}>
                                    <FaArrowLeft /> Back to Login
                                </div>
                                <h1 className="auth-title">Create Account</h1>

                                <form onSubmit={handleSubmit} noValidate>
                                    {/* Name Row */}
                                    <div className="name-row">
                                        <div className={`input-group half-width${errors.firstName ? ' error' : ''}`}>
                                            <input
                                                type="text" name="firstName" placeholder="First name"
                                                className="auth-input" value={formData.firstName}
                                                onChange={handleInputChange} disabled={isLoading} autoComplete="given-name"
                                            />
                                            {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                        </div>
                                        <div className={`input-group half-width${errors.lastName ? ' error' : ''}`}>
                                            <input
                                                type="text" name="lastName" placeholder="Last name"
                                                className="auth-input" value={formData.lastName}
                                                onChange={handleInputChange} disabled={isLoading} autoComplete="family-name"
                                            />
                                            {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className={`input-group${errors.email ? ' error' : ''}`}>
                                        <input
                                            type="email" name="email" placeholder="Email"
                                            className="auth-input" value={formData.email}
                                            onChange={handleInputChange} disabled={isLoading} autoComplete="email"
                                        />
                                        {errors.email && <span className="error-text">{errors.email}</span>}
                                    </div>

                                    {/* Phone */}
                                    <div className={`input-group${errors.phone ? ' error' : ''}`}>
                                        <input
                                            type="tel" name="phone" placeholder="Phone number (10 digits)"
                                            className="auth-input" value={formData.phone}
                                            onChange={handleInputChange} maxLength="10"
                                            disabled={isLoading} autoComplete="tel"
                                        />
                                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                                    </div>

                                    {/* Password */}
                                    <div className={`input-group password-field${errors.password ? ' error' : ''}`}>
                                        <input
                                            type={showPassword ? 'text' : 'password'} name="password"
                                            placeholder="Password (min. 8 characters)" className="auth-input"
                                            value={formData.password} onChange={handleInputChange}
                                            minLength="8" disabled={isLoading} autoComplete="new-password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('password')} disabled={isLoading}>
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && <span className="error-text">{errors.password}</span>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div className={`input-group password-field${errors.confirmPassword ? ' error' : ''}`}>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                                            placeholder="Confirm password" className="auth-input"
                                            value={formData.confirmPassword} onChange={handleInputChange}
                                            minLength="8" disabled={isLoading} autoComplete="new-password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => togglePasswordVisibility('confirm')} disabled={isLoading}>
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                                    </div>

                                    <button type="submit" className={`continue-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
                                        {isLoading ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Creating account...
                                            </span>
                                        ) : 'Sign Up'}
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
                                    Already have an account?{' '}
                                    <Link to="/auth" className="toggle-link" style={{ textDecoration: 'underline' }}>
                                        Login
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

export default Signup;