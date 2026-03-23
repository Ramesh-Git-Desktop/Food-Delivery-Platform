import React from 'react';
import { Link } from 'react-router-dom';
import './Restaurants.css';

const Restaurants = () => {
    const restaurants = [
        {
            id: 1,
            name: "Begas Cafe",
            image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW2kIchoEqM1E6wfKrDJKVM1dMzOZ_rNPIXA&s",
            timing: "MONDAY - SATURDAY",
            featured: true
        },
        {
            id: 2,
            name: "Restaurant Manaco",
            image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
            timing: "MONDAY - SUNDAY"
        },
        {
            id: 3,
            name: "Ribs and Beer",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
            timing: "MONDAY - SUNDAY"
        },
        {
            id: 4,
            name: "Grilled House",
            image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=300&fit=crop",
            timing: "MONDAY - SUNDAY"
        },
        {
            id: 5,
            name: "Court",
            image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop",
            timing: "MONDAY - SUNDAY"
        }
    ];

    return (
        <section className="cafes-restaurants-section">
            <div className="container">
                <div className="header-text">
                    <p className="subtitle-orange">Our Recommended best</p>
                    <h2 className="main-title">Cafes & Restaurants</h2>
                </div>

                <div className="restaurants-grid">
                    {/* Featured Large Card */}
                    <div className="featured-card">
                        <div className="restaurant-image-wrapper">
                            <img
                                src={restaurants[0].image}
                                alt={restaurants[0].name}
                                className="restaurant-img"
                            />
                        </div>
                        <div className="restaurant-info">
                            <h3 className="restaurant-name">{restaurants[0].name}</h3>
                            <p className="restaurant-timing">{restaurants[0].timing}</p>
                        </div>
                    </div>

                    {/* Small Cards Column 1 */}
                    <div className="small-cards-column">
                        <div className="small-card">
                            <div className="restaurant-image-wrapper">
                                <img
                                    src={restaurants[1].image}
                                    alt={restaurants[1].name}
                                    className="restaurant-img"
                                />
                            </div>
                            <div className="restaurant-info">
                                <h3 className="restaurant-name">{restaurants[1].name}</h3>
                                <p className="restaurant-timing">{restaurants[1].timing}</p>
                            </div>
                        </div>

                        <div className="small-card">
                            <div className="restaurant-image-wrapper">
                                <img
                                    src={restaurants[3].image}
                                    alt={restaurants[3].name}
                                    className="restaurant-img"
                                />
                            </div>
                            <div className="restaurant-info">
                                <h3 className="restaurant-name">{restaurants[3].name}</h3>
                                <p className="restaurant-timing">{restaurants[3].timing}</p>
                            </div>
                        </div>
                    </div>

                    {/* Small Cards Column 2 */}
                    <div className="small-cards-column">
                        <div className="small-card">
                            <div className="restaurant-image-wrapper">
                                <img
                                    src={restaurants[2].image}
                                    alt={restaurants[2].name}
                                    className="restaurant-img"
                                />
                            </div>
                            <div className="restaurant-info">
                                <h3 className="restaurant-name">{restaurants[2].name}</h3>
                                <p className="restaurant-timing">{restaurants[2].timing}</p>
                            </div>
                        </div>

                        <div className="small-card">
                            <div className="restaurant-image-wrapper">
                                <img
                                    src={restaurants[4].image}
                                    alt={restaurants[4].name}
                                    className="restaurant-img"
                                />
                            </div>
                            <div className="restaurant-info">
                                <h3 className="restaurant-name">{restaurants[4].name}</h3>
                                <p className="restaurant-timing">{restaurants[4].timing}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View More Button */}
                <div className="view-more-container">
                    <Link to="/recommended-restaurants" className="view-more-btn text-decoration-none text-dark d-inline-flex align-items-center">
                        <span>View more</span>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="arrow-icon"
                        >
                            <path
                                d="M7.5 15L12.5 10L7.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Restaurants;