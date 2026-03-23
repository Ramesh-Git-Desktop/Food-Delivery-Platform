// src/components/Features.jsx
import React from "react";
import "./Features.css";

const Features = () => {
    return (
        <section className="features-section">
            <div className="container">
                <div className="row text-center align-items-center">
                    <div className="col-lg-6 mb-5">
                        <img
                            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600"
                            alt="Couple ordering food"
                            className="img-fluid rounded features-image"
                        />
                    </div>
                    <div className="col-lg-6 text-start">
                        <h2 className="features-heading mb-4">
                            Relax at home
                            <br />
                            <span className="features-highlight">Food on the way</span>
                        </h2>
                        <p className="features-label mb-2">Simple &amp; Friendly</p>
                        <p className="features-text mb-2">
                            "Relax at home while we handle everything for you — fast, easy,
                            and reliable."
                        </p>
                        <p className="features-text mb-2">
                            "Fresh food, quick delivery, and hassle-free service — every
                            single time."
                        </p>
                        <p className="features-label mt-3 mb-2">Short &amp; Premium</p>
                        <p className="features-text mb-4">
                            "Quality service. Fast delivery. Total peace of mind."
                        </p>

                        <div className="row mt-4">
                            <div className="col-6 mb-4">
                                <div className="feature-card fade-in-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-users" />
                                    </div>
                                    <h5>
                                        More Than
                                        <br />
                                        150 Couriers
                                    </h5>
                                </div>
                            </div>
                            <div className="col-6 mb-4">
                                <div className="feature-card fade-in-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-shipping-fast" />
                                    </div>
                                    <h5>
                                        Fast Delivery
                                        <br />
                                        in 1 Hour
                                    </h5>
                                </div>
                            </div>
                            <div className="col-6 mb-4">
                                <div className="feature-card fade-in-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-mobile-alt" />
                                    </div>
                                    <h5>
                                        Amazing
                                        <br />
                                        Mobile App
                                    </h5>
                                </div>
                            </div>
                            <div className="col-6 mb-4">
                                <div className="feature-card fade-in-card">
                                    <div className="feature-icon">
                                        <i className="fas fa-globe" />
                                    </div>
                                    <h5>
                                        Wild
                                        <br />
                                        Coverage
                                    </h5>
                                </div>
                            </div>
                        </div>

                        <button className="btn-primary-custom mt-3">Read more</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;
