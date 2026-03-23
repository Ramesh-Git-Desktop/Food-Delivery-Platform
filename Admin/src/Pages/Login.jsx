// src/Pages/Login.jsx
import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../CSS/Login.css';

export default function Login() {
    const navigate = useNavigate();
    const { login, user } = useAuth();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Modal states (forgot password, support)
    const [showForgot, setShowForgot] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [supportForm, setSupportForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
    });
    const [supportSent, setSupportSent] = useState(false);

    // If already logged in, redirect to dashboard
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    // Restore saved email if "Remember me" was previously checked
    useEffect(() => {
        const savedEmail = localStorage.getItem('adminEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    // FIX: handleSubmit is now the form's onSubmit handler, not just a button
    // onClick. This means pressing Enter in any field correctly submits the form.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                if (rememberMe) {
                    localStorage.setItem('adminEmail', email);
                } else {
                    localStorage.removeItem('adminEmail');
                }
                toast.success('Login successful!');
                navigate('/');
            } else {
                toast.error('Login failed. Please try again.');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

    // Forgot password modal handlers
    const handleForgotClick = (e) => {
        e.preventDefault();
        setShowForgot(true);
        setResetSent(false);
        setResetEmail('');
    };

    const handleCloseModal = () => {
        setShowForgot(false);
        setShowSupport(false);
    };

    const handleSendReset = (e) => {
        e.preventDefault();
        if (resetEmail.trim() !== '') {
            setResetSent(true);
        }
    };

    // Support modal handlers
    const handleSupportClick = (e) => {
        e.preventDefault();
        setShowSupport(true);
        setSupportSent(false);
        setSupportForm({
            name: '',
            email: '',
            subject: '',
            message: '',
            type: 'general',
        });
    };

    const handleSupportChange = (e) => {
        const { name, value } = e.target;
        setSupportForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSendSupport = (e) => {
        e.preventDefault();
        if (!supportForm.name || !supportForm.email || !supportForm.message) {
            alert('Please fill in all required fields');
            return;
        }
        setSupportSent(true);
        console.log('Support request sent:', supportForm);
    };

    return (
        <div className="login-wrapper">
            {/* Left side – branding and stats */}
            <div className="login-left">
                <div className="brand">
                    <div className="brand-icon">🍴</div>
                    Hungry Hub
                </div>
                <div className="left-inner">
                    <h1>
                        Manage your <span>culinary empire</span>
                        <br />
                        with precision.
                    </h1>
                    <div className="stats">
                        <div className="stat">
                            <p className="stat-label">PARTNERS</p>
                            <h2 className="counter" data-target="2400">
                                0
                            </h2>
                            <span>Active Restaurants</span>
                        </div>
                        <div className="stat">
                            <p className="stat-label">LOGISTICS</p>
                            <h2 className="counter" data-target="18000">
                                0
                            </h2>
                            <span>Daily Orders</span>
                        </div>
                    </div>
                </div>
                <p className="copyright">© 2024 FoodAdmin Platform. All rights reserved.</p>
            </div>

            {/* Right side – login form */}
            <div className="login-right">
                <div className="form-card">
                    <h2>Welcome back</h2>
                    <p>Enter your credentials to access the industrial dashboard.</p>

                    {/* FIX: Wrap inputs in a <form> with onSubmit so pressing Enter submits */}
                    <form onSubmit={handleSubmit} noValidate>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                        </div>

                        <div className="options">
                            <label className="remember">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <span className="forgot" onClick={handleForgotClick}>
                                Forgot password
                            </span>
                        </div>

                        {/* FIX: type="submit" so Enter key and form onSubmit both work */}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in →'}
                        </button>
                    </form>

                    <p className="support">
                        Don't have an account?{' '}
                        <span
                            onClick={handleSupportClick}
                            style={{ cursor: 'pointer', color: '#000', fontWeight: '600' }}
                        >
                            Contact Support
                        </span>
                    </p>
                </div>
            </div>

            {/* Forgot password modal */}
            {showForgot && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>
                            ×
                        </button>
                        <h3>Reset your password</h3>
                        {!resetSent ? (
                            <>
                                <p>
                                    Enter your email address and we'll send you a link to reset
                                    your password.
                                </p>
                                <form onSubmit={handleSendReset}>
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <button type="submit" className="modal-btn">
                                        Send reset link
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="reset-success">
                                <p>✅ Reset link sent! Check your inbox.</p>
                                <button onClick={handleCloseModal} className="modal-btn">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contact support modal */}
            {showSupport && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div
                        className="modal-content support-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="modal-close" onClick={handleCloseModal}>
                            ×
                        </button>
                        {!supportSent ? (
                            <>
                                <h3>Contact Support</h3>
                                <p>
                                    Fill out the form below and we'll get back to you within 24
                                    hours.
                                </p>
                                <form onSubmit={handleSendSupport}>
                                    <div className="form-group">
                                        <label>Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={supportForm.name}
                                            onChange={handleSupportChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={supportForm.email}
                                            onChange={handleSupportChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Support Type</label>
                                        <select
                                            name="type"
                                            value={supportForm.type}
                                            onChange={handleSupportChange}
                                        >
                                            <option value="general">General Inquiry</option>
                                            <option value="technical">Technical Support</option>
                                            <option value="billing">Billing Issue</option>
                                            <option value="account">Account Help</option>
                                            <option value="partnership">Partnership</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={supportForm.subject}
                                            onChange={handleSupportChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Message *</label>
                                        <textarea
                                            name="message"
                                            value={supportForm.message}
                                            onChange={handleSupportChange}
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={handleCloseModal}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="submit-btn">
                                            Send Message
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="support-success">
                                <div className="success-icon">✓</div>
                                <h3>Message Sent!</h3>
                                <p>
                                    Thank you for contacting support. We'll get back to you
                                    within 24 hours.
                                </p>
                                <p className="support-reference">
                                    Reference #: SUP-{Math.floor(Math.random() * 10000)}
                                </p>
                                <button onClick={handleCloseModal} className="modal-btn">
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}