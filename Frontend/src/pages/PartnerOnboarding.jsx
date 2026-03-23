import React from "react";
import { Link } from 'react-router-dom';
import "../CSS/Partner.css";

const PartnerOnboarding = () => {
    return (
        <div className="partner-wrapper">
            <section className="partner-hero second">
                <div className="overlay"></div>

                <div className="hero-left">
                    <p className="tag">START YOUR ONBOARDING PROCESS</p>
                    <h1>
                        Make your restaurants delivery <br />
                        ready in 24hrs !
                    </h1>
                    <h4>Fast track your growth with Hungry Hub Accelerator</h4>
                    <h2 className="benefit">+ benefits upto 50,000</h2>
                </div>

                <div className="onboard-card">
                    <h3>For an easy form filling process,</h3>
                    <p className="sub-text">You can keep the following handy</p>
                    <div className="divider"></div>
                    <ul className="onboard-list">
                        <li><span className="green-dot"></span>PAN Number</li>
                        <li><span className="green-dot"></span>GSTIN Number</li>
                        <li>
                            <span className="green-dot"></span>
                            Bank Details (IFSC and Account Number)
                        </li>
                        <li>
                            <span className="green-dot"></span>
                            FSSAI Registration Number
                        </li>
                        <li>
                            <span className="green-dot"></span>
                            Your Restaurant Menu
                        </li>
                    </ul>
                    <Link to="/partner-restaurant-name">
                        <button className="begin-btn">Let's Begin!</button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default PartnerOnboarding;