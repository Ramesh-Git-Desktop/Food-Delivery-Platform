// src/components/Testimonial.jsx
import React, { useState, useEffect } from "react";
import "./Testimonial.css";

const Testimonial = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Food Blogger",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
            text: "The food quality is exceptional! Every dish is prepared with fresh ingredients and authentic flavors. The delivery is always on time and the packaging is excellent. Highly recommended for anyone who loves great food!",
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Business Owner",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
            text: "I order from here regularly for office lunches. The variety is amazing and the prices are reasonable. The customer service is top-notch and they always accommodate special requests. Best food delivery service in town!",
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "Fitness Coach",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
            text: "As someone who cares about nutrition, I appreciate the healthy options available. The ingredients are fresh, portions are perfect, and everything tastes delicious. They've made healthy eating so convenient!",
        },
        {
            id: 4,
            name: "David Thompson",
            role: "Software Engineer",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
            text: "Quick delivery, hot food, and great taste! The app is user-friendly and the tracking feature is awesome. I've tried multiple cuisines and haven't been disappointed yet. My go-to choice for food delivery!",
        },
        {
            id: 5,
            name: "Priya Sharma",
            role: "Marketing Manager",
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
            text: "Absolutely love the variety of Indian and Chinese dishes! The flavors are authentic and remind me of home-cooked meals. The presentation is beautiful and the service is excellent. Five stars all the way!",
        },
        {
            id: 6,
            name: "James Wilson",
            role: "Chef",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
            text: "As a professional chef, I'm impressed by the quality and presentation. The attention to detail is remarkable and the taste is consistently good. They clearly take pride in what they serve. Outstanding!",
        },
    ];

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000); // Change testimonial every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonials.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds of manual interaction
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrevious = () => {
        const newIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToNext = () => {
        const newIndex = currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="testimonial-section">
            <div className="container">
                <div className="section-title">
                    <p className="testimonial-subtitle">TESTIMONIAL</p>
                    <h2 className="testimonial-title">What Our Clients Say!</h2>
                </div>
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="testimonial-carousel">
                            {/* Navigation Arrows */}
                            <button
                                className="testimonial-nav testimonial-nav-prev"
                                onClick={goToPrevious}
                                aria-label="Previous testimonial"
                            >
                                ‹
                            </button>

                            <div className="testimonial-card fade-in-card">
                                <div className="quote-icon">"</div>
                                <img
                                    src={testimonials[currentIndex].image}
                                    alt={testimonials[currentIndex].name}
                                    className="testimonial-image"
                                    loading="lazy"
                                />
                                <p className="testimonial-text">
                                    {testimonials[currentIndex].text}
                                </p>
                                <h5 className="testimonial-author">
                                    {testimonials[currentIndex].name}
                                </h5>
                                <p className="testimonial-role">
                                    {testimonials[currentIndex].role}
                                </p>
                                <div className="testimonial-dots mt-3">
                                    {testimonials.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`dot ${index === currentIndex ? "dot-active" : ""}`}
                                            onClick={() => goToSlide(index)}
                                            aria-label={`Go to testimonial ${index + 1}`}
                                        >
                                            ●
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="testimonial-nav testimonial-nav-next"
                                onClick={goToNext}
                                aria-label="Next testimonial"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonial;