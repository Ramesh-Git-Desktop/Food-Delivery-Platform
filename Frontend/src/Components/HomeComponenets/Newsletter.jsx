// src/components/Newsletter.jsx
import React from "react";
import "./Newsletter.css";

const Newsletter = () => {
    return (
        <section className="newsletter-section">
            <div className="container">
                <p className="newsletter-subtitle">Get our new offers</p>
                <h2 className="newsletter-title">Get Touch To Our Newseletter</h2>
                <form className="newsletter-form">
                    <input
                        type="email"
                        className="newsletter-input"
                        placeholder="Enter Your Email-------"
                    />
                    <button type="submit" className="newsletter-btn">
                        Subscribe
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Newsletter;
