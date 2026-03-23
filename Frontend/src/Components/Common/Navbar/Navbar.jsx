import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isMenuDropdownOpen, setIsMenuDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const menuTimeoutRef = useRef(null);

  const toggleNav = () => setIsNavOpen(prev => !prev);
  const closeNav = () => setIsNavOpen(false);

  /* ── Menu dropdown (hover on desktop, click on mobile) ── */
  const clearMenuTimeout = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
  };

  const handleMenuMouseEnter = () => {
    clearMenuTimeout();
    setIsMenuDropdownOpen(true);
  };

  const handleMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setIsMenuDropdownOpen(false), 150);
  };

  const toggleMenuDropdown = (e) => {
    e.preventDefault();
    clearMenuTimeout();
    setIsMenuDropdownOpen(prev => !prev);
  };

  /* ── Profile dropdown ── */
  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setIsProfileDropdownOpen(prev => !prev);
  };

  /* ── Logout ── */
  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    closeNav();
    navigate('/');
  };

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.hh-menu-dropdown')) {
        clearMenuTimeout();
        setIsMenuDropdownOpen(false);
      }
      if (!e.target.closest('.hh-profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      clearMenuTimeout();
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top hh-navbar py-3">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to="/" onClick={closeNav}>
          HUNGRY HUB
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleNav}
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Collapsible content */}
        <div className={`collapse navbar-collapse${isNavOpen ? ' show' : ''}`}>
          {/* Nav links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeNav}>HOME</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about" onClick={closeNav}>ABOUT US</Link>
            </li>

            {/* Menu dropdown — toggle button instead of anchor */}
            <li
              className={`nav-item hh-menu-dropdown dropdown-container${isMenuDropdownOpen ? ' show' : ''}`}
              onMouseEnter={handleMenuMouseEnter}
              onMouseLeave={handleMenuMouseLeave}
            >
              <button
                className="nav-link dropdown-toggle bg-transparent border-0"
                style={{ color: 'white', cursor: 'pointer' }}
                aria-expanded={isMenuDropdownOpen}
                onClick={toggleMenuDropdown}
              >
                MENU
              </button>
              <ul className={`dropdown-menu${isMenuDropdownOpen ? ' show' : ''}`}>
                <li>
                  <Link className="dropdown-item" to="/category/drinks" onClick={() => { setIsMenuDropdownOpen(false); closeNav(); }}>
                    Drinks
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/category/pizza-burger" onClick={() => { setIsMenuDropdownOpen(false); closeNav(); }}>
                    Pizza / Burger
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/category/indian-chinese" onClick={() => { setIsMenuDropdownOpen(false); closeNav(); }}>
                    Indian / Chinese
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/blog" onClick={closeNav}>BLOG</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact" onClick={closeNav}>CONTACTS</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/partner" onClick={closeNav}>PARTNER WITH US</Link>
            </li>
          </ul>

          {/* Right side — Auth / Profile + Cart */}
          <div className="d-flex align-items-center gap-2">

            {user ? (
              /* ── Logged in: Profile icon with dropdown ── */
              <div className="hh-profile-dropdown position-relative">
                <button
                  className="btn btn-link text-white p-1 border-0 d-flex align-items-center gap-2"
                  type="button"
                  onClick={toggleProfileDropdown}
                  aria-expanded={isProfileDropdownOpen}
                  title={`Hello, ${user.name}`}
                >
                  <FaUserCircle size={30} />
                  {/* Show name on desktop */}
                  <span className="d-none d-lg-inline" style={{ fontSize: '0.9rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {/* Profile dropdown menu */}
                <ul className={`dropdown-menu dropdown-menu-end${isProfileDropdownOpen ? ' show' : ''}`} style={{ minWidth: '180px' }}>
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      👋 Hello, {user.name}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <Link className="dropdown-item" to="/profile" onClick={() => { setIsProfileDropdownOpen(false); closeNav(); }}>
                      👤 Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/orders" onClick={() => { setIsProfileDropdownOpen(false); closeNav(); }}>
                      📦 My Orders
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      🚪 Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              /* ── Not logged in: Sign In + Sign Up buttons ── */
              <>
                <Link to="/auth" onClick={closeNav}>
                  <button className="btn-auth">Sign In</button>
                </Link>
                <Link to="/signup" onClick={closeNav}>
                  <button className="btn-auth">Sign Up</button>
                </Link>
              </>
            )}

            {/* Cart button — always visible */}
            <Link to="/cart" className="text-white text-decoration-none" onClick={closeNav}>
              <button className="btn-auth d-flex align-items-center gap-1">
                <FaShoppingCart />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;