import React from "react";
import "../CSS/Contact.css";

import rocket from "../assets/Icon/rocket.png";
import crown from "../assets/Icon/crown.png";
import arrow from "../assets/Icon/arrow-1.png";
import arrow2 from "../assets/Icon/arrow-2.png";
import bgmap from "../assets/Img/bgmap.jpg";
import team from "../assets/Img/team.jpg";
import scooter from "../assets/Img/scooter.jpg";
import {
    FaYoutube,
    FaFacebookF,
    FaInstagram,
    FaPhoneAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Contact = () => {
    return (
        <div className="contact-page">
            {/* ════════════════════════════════════════
          SECTION 1 — HERO BANNER
      ════════════════════════════════════════ */}
            <section
                className="banner"
                style={{ backgroundImage: `url('${bgmap}')` }}
            >
                <div className="banner__left">
                    <h1 className="banner__heading">
                        Order Healthy and Fresh
                        <br />
                        Food Any Time
                    </h1>
                    <p className="banner__sub">
                        Fast, reliable, and secure delivery straight to your doorstep. We
                        ensure your packages arrive on time with complete care and
                        efficiency.
                    </p>
                    <button className="banner__btn">Read more</button>
                </div>

                <div className="banner__right">
                    <img
                        src={scooter}
                        alt="Delivery on Scooter"
                        className="banner__img"
                    />
                </div>
            </section>

            {/* ════════════════════════════════════════
          SECTION 2 — CONTACT US
      ════════════════════════════════════════ */}
            <section className="contact-section">
                <img
                    src={arrow}
                    alt=""
                    className="cs-deco cs-deco--arc-tl"
                    aria-hidden="true"
                />
                <img
                    src={crown}
                    alt=""
                    className="cs-deco cs-deco--crown"
                    aria-hidden="true"
                />
                <img
                    src={rocket}
                    alt=""
                    className="cs-deco cs-deco--rocket"
                    aria-hidden="true"
                />
                <img
                    src={arrow2}
                    alt=""
                    className="cs-deco cs-deco--arrow"
                    aria-hidden="true"
                />

                <h2 className="contact-section__heading">Contact Us</h2>

                <div className="contact-section__body">
                    <div className="cmap">
                        <p className="cmap__label">Here We Are !</p>
                        <iframe
                            title="Our Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937595!2d2.2922926156743453!3d48.85837007928784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sus!4v1602068671760!5m2!1sen!2sus"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    <form className="cform" onSubmit={(e) => e.preventDefault()}>
                        <div className="cform__field">
                            <label>First Name</label>
                            <input type="text" />
                        </div>
                        <div className="cform__field">
                            <label>Last Name</label>
                            <input type="text" />
                        </div>
                        <div className="cform__field">
                            <label>Email</label>
                            <input type="email" />
                        </div>
                        <div className="cform__field">
                            <label>Subject</label>
                            <input type="text" />
                        </div>
                        <div className="cform__field">
                            <label>Phone No</label>
                            <input type="tel" />
                        </div>
                        <button type="submit" className="cform__btn">
                            Send
                        </button>
                    </form>
                </div>
            </section>

            {/* ════════════════════════════════════════
          SECTION 3 — HUNGRY HUB
      ════════════════════════════════════════ */}
            <section
                className="hub-section"
                style={{ backgroundImage: `url('${bgmap}')` }}
            >
                <h2 className="hub__brand">HUNGRY HUB</h2>

                {/* ── Strip: photo (left) + orange panel (right) ── */}
                <div className="hub__strip">
                    {/* Left half — team photo */}
                    <div className="hub__photo">
                        <img src={team} alt="Support Team" />
                    </div>

                    {/* Right half — orange panel */}
                    <div className="hub__orange-panel">
                        {/* Phone circle + CTA text */}
                        <div className="hub__phone-row">
                            <div className="hub__phone-circle">
                                <FaPhoneAlt size={38} color="#F5A623" />
                            </div>
                            <div className="hub__cta">
                                <p className="hub__cta-label">Call us to make order now</p>
                                <p className="hub__cta-number">670 - 54 7987798 - 644</p>
                            </div>
                        </div>

                        {/* Social icons — inside orange panel */}
                        <div className="hub__socials">
                            <a href="#" aria-label="YouTube" className="hub__icon">
                                <FaYoutube size={16} />
                            </a>
                            <a href="#" aria-label="Facebook" className="hub__icon">
                                <FaFacebookF size={16} />
                            </a>
                            <a href="#" aria-label="Instagram" className="hub__icon">
                                <FaInstagram size={16} />
                            </a>
                            <a href="#" aria-label="X (Twitter)" className="hub__icon">
                                <FaXTwitter size={16} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright bottom-left */}
                <p className="hub__copy">
                    © <span className="hub__copy-brand">HUNGRY HUB</span> , All Right
                    Reserved.
                </p>
            </section>
        </div>
    );
};

export default Contact;
