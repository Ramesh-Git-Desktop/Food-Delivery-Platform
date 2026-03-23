import React from "react";
import "./RelaxFeatures.css"; // custom styles for this component
import { FaUsers, FaShippingFast, FaMobileAlt, FaGlobe } from "react-icons/fa";

const RelaxFeatures = () => {
    const stats = [
        { icon: <FaUsers />, title: "More Than", subtitle: "150 Couriers" },
        { icon: <FaShippingFast />, title: "Fast Delivery", subtitle: "in 1 Hour" },
        { icon: <FaMobileAlt />, title: "Amazing", subtitle: "Mobile App" },
        { icon: <FaGlobe />, title: "Wild", subtitle: "Coverage" },
    ];

    return (
        <section className="relax-features-section">
            <div className="container">
                <div className="row align-items-center g-5 justify-content-between">
                    <div className="col-lg-6 text-center text-lg-start">
                        {/* Headings */}
                        <h2 className="relax-heading">
                            Relax at home <br />
                            <span className="highlight">Food on the way</span>
                        </h2>

                        {/* Simple & Friendly block */}
                        <div className="relax-block">
                            <h3 className="relax-subheading">Simple & Friendly</h3>
                            <p className="relax-quote">
                                "Relax at home while we handle everything for you — fast, easy, and reliable."
                            </p>
                            <p className="relax-quote">
                                "Fresh food, quick delivery, and hassle-free service — every single time."
                            </p>
                        </div>

                        {/* Short & Premium block */}
                        <div className="relax-block">
                            <h3 className="relax-subheading">Short & Premium</h3>
                            <p className="relax-quote">
                                "Quality service. Fast delivery. Total peace of mind."
                            </p>
                        </div>

                        {/* Stats / Feature Cards */}
                        <div className="row mt-5">
                            {stats.map((stat, idx) => (
                                <div className="col-6 col-md-3 mb-4" key={idx}>
                                    <div className="relax-feature-card">
                                        <div className="relax-feature-icon">{stat.icon}</div>
                                        <h5>
                                            {stat.title}
                                            <br />
                                            {stat.subtitle}
                                        </h5>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Read more button */}
                        <div className="mt-4">
                            <button className="btn-primary-custom">Read more</button>
                        </div>
                    </div>
                    <div className="col-lg-5 ">
                        <div className="border">

                        <img 
                            src="https://img.freepik.com/free-photo/couple-using-laptop-home_23-2148861254.jpg"
                            alt="Couple enjoying food delivery" 
                            className="img-fluid relax-image "
                            loading="lazy"
                            
                            />
                            </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RelaxFeatures;