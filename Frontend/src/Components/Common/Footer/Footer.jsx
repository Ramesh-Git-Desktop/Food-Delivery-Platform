import React from "react";
import { Link } from 'react-router-dom';
import "./Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container pb-3">
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <h5>Get In Touch</h5>
                        <div className="mb-3">
                            <h4 className="footer-brand">HUNGRY HUB</h4>
                            <p>123 Street, New York, USA</p>
                            <p>+012 345 67890</p>
                            <p>info@example.com</p>
                        </div>
                    </div>

                    <div className="col-md-3 mb-4">
                        <h5>Quick Links</h5>
                        <ul className="footer-links">
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#contact">Contact Us</a></li>
                            <li><a href="#menu">Our Services</a></li>
                            <li><a href="#blog">Latest Blog</a></li>
                        </ul>
                    </div>

                    <div className="col-md-3 mb-4">
                        <h5>Support</h5>
                        <ul className="footer-links">
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms-and-condition">Terms &amp; Condition</Link></li>
                            <li><Link to="/contact">Support</Link></li>
                            <li><Link to="/faq">FAQs</Link></li>
                        </ul>
                    </div>

                    <div className="col-md-3 mb-4">
                        <h5>Follow Us</h5>
                        <div className="social-icons">
                            <a href="#" className="social-icon"><FaFacebookF /></a>
                            <a href="#" className="social-icon"><FaTwitter /></a>
                            <a href="#" className="social-icon"><FaInstagram /></a>
                            <a href="#" className="social-icon"><FaLinkedinIn /></a>
                        </div>
                    </div>
                </div>

                <div className="copyright">
                    <p className="mb-0">
                        © {new Date().getFullYear()} HUNGRY HUB. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;