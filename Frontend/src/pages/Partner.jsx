import React from "react";
import { Link } from 'react-router-dom';
import "../CSS/Partner.css";

const Partner = () => {
    return (
        <div className="partner-wrapper">
            {/* HERO SECTION */}
            <section className="partner-hero">
                <div className="overlay"></div>

                <div className="hero-left">
                    <p className="tag">Partner with us !</p>

                    <h1>
                        Unlock new markets <br />
                        Beyond your city
                    </h1>

                    <div className="dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div className="login-card">
                    <h3>GET STARTED</h3>
                    <p>Enter a mobile number or restaurant ID to continue</p>

                    <input
                        type="text"
                        placeholder="Enter Your Restaurant ID / Mobile number"
                    />
                    <Link to="/partner-onboarding">
                        <button>Continue</button>
                    </Link>

                    <small>
                        By logging in, I agree to Hungry Hub <u>terms & conditions</u>
                    </small>
                </div>
            </section>

            {/* READY SECTION */}
            <section className="ready-section">
                <div className="ready-left">
                    <p className="small-text">In just 3 easy steps</p>
                    <h2 className="ready-title">
                        Get your restaurant delivery - ready in 24hrs !
                    </h2>

                    <div className="steps-card">
                        <div className="vertical-line"></div>
                        <div className="step">
                            <span className="dot"></span>
                            <div>
                                <p className="step-label">STEP 1</p>
                                <h4>Install the hungry hub Owner App</h4>
                            </div>
                        </div>
                        <div className="step">
                            <span className="dot"></span>
                            <div>
                                <p className="step-label">STEP 2</p>
                                <h4>Login/Register using your phone number</h4>
                            </div>
                        </div>
                        <div className="step">
                            <span className="dot"></span>
                            <div>
                                <p className="step-label">STEP 3</p>
                                <h4>Enter restaurant details</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="docs-wrapper">
                    <h3>For an easy form filling process,</h3>
                    <p className="docs-sub">You can keep these documents handy .</p>
                    <div className="dashed"></div>
                    <ul className="docs-list">
                        <li>
                            <span className="tick"></span>
                            FSSAI License copy
                            <a href="#">Apply Here</a>
                        </li>
                        <li>
                            <span className="tick"></span>
                            Your Restaurant menu
                        </li>
                        <li>
                            <span className="tick"></span>
                            Bank details
                        </li>
                        <li>
                            <span className="tick"></span>
                            GSTIN
                            <a href="#">Apply Here</a>
                        </li>
                        <li>
                            <span className="tick"></span>
                            PAN card copy
                        </li>
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Partner;