// src/components/ContactSection.jsx
import React from "react";
import "./ContactSection.css";
import {
    FaPhone,
    FaYoutube,
    FaFacebookF,
    FaInstagram,
    FaTwitter,
} from "react-icons/fa";

const ContactSection = () => {
    return (
        <section className="contact-section">
            <div className="container">
                <div className="row g-4">
                    <div className="col-md-5">
                        <div className="contact-map fade-in-card">
                            {/* Google Map instead of image */}
                            <iframe
                                title="Hungry Hub Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.020681382998!2d-122.41941548468163!3d37.77492927975988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c5c2c3b1b%3A0xabcdef1234567890!2sRestaurant!5e0!3m2!1sen!2sus!4v1700000000000"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="contact-map-frame"
                                allowFullScreen
                            />
                            <div className="text-center mt-3">
                                <h5>Here We Are !</h5>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="contact-form fade-in-card">
                            <h2>Contact Us</h2>
                            <form>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="First Name"
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Last Name"
                                />
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Subject"
                                />
                                <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="Phone No"
                                />
                                <button type="submit" className="btn-primary-custom w-100">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-5">
                <div className="contact-info">
                    <h3 className="contact-brand">HUNGRY HUB</h3>
                    <div className="contact-item">
                        <FaPhone className="contact-icon" />
                        <div>
                            <p className="mb-0">Call us to make order now</p>
                            <h5 className="mb-0">670 - 54 7987798 - 644</h5>
                        </div>
                    </div>
                    <div className="social-icons mt-3">
                        <a href="#" className="social-icon">
                            <FaYoutube />
                        </a>
                        <a href="#" className="social-icon">
                            <FaFacebookF />
                        </a>
                        <a href="#" className="social-icon">
                            <FaInstagram />
                        </a>
                        <a href="#" className="social-icon">
                            <FaTwitter />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
