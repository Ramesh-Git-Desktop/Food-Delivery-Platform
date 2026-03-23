import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "../CSS/AboutPage.css";

function AboutPage() {
    // 🔢 Counter States
    const [items, setItems] = useState(0);
    const [clients, setClients] = useState(0);
    const [years, setYears] = useState(0);
    const [partners, setPartners] = useState(0);

    // 🔢 Counter Animation
    useEffect(() => {
        const interval = setInterval(() => {
            setItems((prev) => (prev < 90 ? prev + 1 : 90));
            setClients((prev) => (prev < 2456 ? prev + 25 : 2456));
            setYears((prev) => (prev < 34 ? prev + 1 : 34));
            setPartners((prev) => (prev < 786 ? prev + 10 : 786));
        }, 20);

        return () => clearInterval(interval);
    }, []);

    // ✨ Scroll Fade Animation
    useEffect(() => {
        const elements = document.querySelectorAll(".fade-up");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                    }
                });
            },
            { threshold: 0.1 },
        );

        elements.forEach((el) => observer.observe(el));
    }, []);
    return (
        <div>
            <section className="banner d-flex align-items-center justify-content-center text-white">
                <div className="text-center banner-content">
                    <h1 className="fw-bold">ABOUT US</h1>

                    <div className="mt-3">
                        <Link to="/" className="breadcrumb-link">
                            HOME
                        </Link>
                        <span className="mx-2">|</span>
                        <span className="breadcrumb-active">ABOUT US</span>
                    </div>
                </div>
            </section>

            {/* ✅ 2. About Section */}
            <div className="container py-5">
                <div className="row align-items-center gx-5 gy-5">
                    {/* Left Image */}
                    <div className="col-md-6 text-center mb-4 mb-md-0">
                        <img
                            src="./image/food2ndimg.png"
                            className="img-fluid custom-img"
                            alt="chef"
                        />
                        <div className="orange-text mt-4">
                            <p>
                                “Relax at home while we handle everything for you <br /> — fast,
                                easy, and reliable.”
                            </p>

                            <p>
                                “Fresh food, quick delivery, and hassle-free service <br /> —
                                every single time.”
                            </p>
                        </div>
                    </div>

                    {/* Right Content */}
                    <div className="col-md-6">
                        <p className="small-heading">TEST THE BEST</p>

                        <h2 className="main-heading">
                            Explore unique flavors <br />
                            from every corner of <br />
                            the world
                        </h2>

                        <img
                            src="./image/food3rdimg.png"
                            className="img-fluid custom-img mt-4"
                            alt="donut"
                        />
                    </div>
                </div>
            </div>

            {/* ✅ 3. Stats Section */}
            <section className="stats py-5 fade-up">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-6 col-md-3 mb-4">
                            <p className="stat-title">Items</p>
                            <h2 className="stat-number">{items}+</h2>
                        </div>

                        <div className="col-6 col-md-3 mb-4">
                            <p className="stat-title">Clients</p>
                            <h2 className="stat-number">{clients}</h2>
                        </div>

                        <div className="col-6 col-md-3 mb-4">
                            <p className="stat-title">Years</p>
                            <h2 className="stat-number">{years}+</h2>
                        </div>

                        <div className="col-6 col-md-3 mb-4">
                            <p className="stat-title">Partners</p>
                            <h2 className="stat-number">{partners}</h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* ✅ 4. Middle Content */}
            <div className="container py-5">
                <div className="row align-items-start gx-5">
                    {/* LEFT CONTENT */}
                    <div className="col-md-6">
                        <p className="section-subtitle">BAKED GOODIES</p>

                        <h2 className="section-title">
                            Everything from daily <br />
                            essentials to custom orders
                        </h2>

                        <p className="section-desc">
                            Fast, reliable, and secure delivery straight to your doorstep.{" "}
                            <br /> We ensure your packages arrive on time with complete <br />{" "}
                            care and efficiency.
                        </p>

                        {/* Features */}
                        <div className="feature-item">
                            <img src="./image/leaf.png" alt="" />
                            <div>
                                <h6>Freshly baked bread</h6>
                                <p>
                                    Fast, reliable, and secure delivery straight to your doorstep.
                                    We ensure your packages arrive on time with complete care and
                                    efficiency.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <img src="./image/cupcake.png" alt="" />
                            <div>
                                <h6>Everyday pastry specials</h6>
                                <p>
                                    Fast, reliable, and secure delivery straight to your doorstep.
                                    We ensure your packages arrive on time with complete care and
                                    efficiency.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <img src="./image/cooking.png" alt="" />
                            <div>
                                <h6>Customer cake orders</h6>
                                <p>
                                    Fast, reliable, and secure delivery straight to your doorstep.
                                    We ensure your packages arrive on time with complete care and
                                    efficiency.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <img src="./image/bread.png" alt="" />
                            <div>
                                <h6>French bread and cakes</h6>
                                <p>
                                    Fast, reliable, and secure delivery straight to your doorstep.
                                    We ensure your packages arrive on time with complete care and
                                    efficiency..
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT IMAGES */}
                    <div className="col-md-6 position-relative">
                        <img src="./image/food4thimg.jpg" className="img-small" alt="" />

                        <img src="./image/food5thimg.jpg" className="img-large" alt="" />
                    </div>
                </div>
            </div>

            {/* ✅ 5. Testimonials */}
            <section className="testimonial text-center py-5">
                <div className="container">
                    {/* Quote Image */}
                    <img src="./image/quote.png" className="quote-img mb-4" alt="quote" />

                    <p className="testimonial-text mx-auto">
                        “From the moment I walked into this café, I felt at home. The aroma
                        of freshly brewed coffee, the cozy seating, and the friendly staff
                        made my day instantly better.”
                    </p>

                    <h5 className="client-name mt-4">Zenelia Shebag</h5>
                    <p className="client-location">Lowell , MS</p>

                    <div className="d-flex justify-content-center mt-4 gap-3">
                        <img src="./image/person1.png" className="profile-img" alt="" />
                        <img src="./image/person2.png" className="profile-img" alt="" />
                        <img src="./image/person3.jpg" className="profile-img" alt="" />
                    </div>
                </div>
            </section>

            {/* ✅ 6. Bottom Images */}
            <section className="custom-carousel py-5">
                <div className="container text-center">
                    <div
                        id="foodCarousel"
                        className="carousel slide"
                        data-bs-ride="carousel"
                    >
                        <div className="carousel-inner">
                            {/* Slide 1 */}
                            <div className="carousel-item active">
                                <div className="carousel-content">
                                    <img
                                        src="./image/corosalimg1.png"
                                        className="main-img"
                                        alt=""
                                    />
                                    <h6 className="mt-3">Strawberry cream delight</h6>
                                    <span className="slide-number">01</span>
                                </div>
                            </div>

                            {/* Slide 2 */}
                            <div className="carousel-item">
                                <div className="carousel-content">
                                    <img
                                        src="./image/corosalimg2.jpg"
                                        className="main-img"
                                        alt=""
                                    />
                                    <h6 className="mt-3">Chocolate donut treat</h6>
                                    <span className="slide-number">02</span>
                                </div>
                            </div>

                            {/* Slide 3 */}
                            <div className="carousel-item">
                                <div className="carousel-content">
                                    <img
                                        src="./image/corosalimg1.png"
                                        className="main-img"
                                        alt=""
                                    />
                                    <h6 className="mt-3">Vanilla sweet bite</h6>
                                    <span className="slide-number">03</span>
                                </div>
                            </div>

                            {/* Slide 4 */}
                            <div className="carousel-item">
                                <div className="carousel-content">
                                    <img
                                        src="./image/corosalimg2.jpg"
                                        className="main-img"
                                        alt=""
                                    />
                                    <h6 className="mt-3">Berry glaze special</h6>
                                    <span className="slide-number">04</span>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target="#foodCarousel"
                            data-bs-slide="prev"
                        >
                            <span className="arrow">&#8592;</span>
                        </button>

                        <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target="#foodCarousel"
                            data-bs-slide="next"
                        >
                            <span className="arrow">&#8594;</span>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;
