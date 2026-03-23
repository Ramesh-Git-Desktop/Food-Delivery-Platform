// DelightfulDishes.jsx — Sliding carousel one-by-one with View All
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import FoodData from '../../data/FoodData';
import './DelightfulDishes.css';

// Flatten all dishes from all categories
const allDishes = FoodData.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryTitle: cat.title }))
);

const VISIBLE = 5; // How many cards visible at once

function DelightfulDishes() {
    const [startIdx, setStartIdx] = useState(0);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const canPrev = startIdx > 0;
    const canNext = startIdx + VISIBLE < allDishes.length;

    const handlePrev = () => setStartIdx((i) => Math.max(0, i - 1));
    const handleNext = () =>
        setStartIdx((i) => Math.min(allDishes.length - VISIBLE, i + 1));

    const visible = allDishes.slice(startIdx, startIdx + VISIBLE);

    return (
        <section className="dd-section">
            <div className="container-fluid px-4">
                {/* Header */}
                <div className="dd-header">
                    <div className="dd-header-left">
                        <span className="dd-eyebrow">Hand-picked for you</span>
                        <h2 className="dd-title">Delightful Dishes</h2>
                    </div>
                    <div className="dd-header-right">

                        {/* ✅ FIXED HERE */}
                        <Link to="/all-dishes" style={{ textDecoration: "none" }}>
                            <button className="dd-view-all">
                                View All
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </Link>

                        <div className="dd-nav-btns">
                            <button
                                className={`dd-nav-btn ${!canPrev ? 'disabled' : ''}`}
                                onClick={handlePrev}
                                disabled={!canPrev}
                                aria-label="Previous"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                className={`dd-nav-btn ${!canNext ? 'disabled' : ''}`}
                                onClick={handleNext}
                                disabled={!canNext}
                                aria-label="Next"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sliding Cards */}
                <div className="dd-cards-wrapper">
                    <div className="dd-cards-track">
                        {visible.map((dish, i) => (
                            <div
                                key={dish.id}
                                className="dd-card"
                                style={{ '--delay': `${i * 0.06}s` }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && navigate(`/item/${dish.id}`)}
                            >
                                <div className="dd-img-wrap">
                                    <img src={dish.img} alt={dish.title} className="dd-img" />
                                    {dish.tag && <span className="dd-tag">{dish.tag}</span>}
                                    <div className="dd-hover-actions">
                                        <button
                                            className="dd-cart-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart({ id: dish.id, title: dish.title, price: dish.price, img: dish.img, restaurant: dish.restaurant });
                                            }}
                                            title="Add to Cart"
                                        >
                                            <FaShoppingCart />
                                        </button>
                                        <button
                                            className="dd-view-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/item/${dish.id}`);
                                            }}
                                            title="View Details"
                                        >
                                            <FaEye />
                                        </button>
                                    </div>
                                </div>
                                <div className="dd-card-body">

                                    <p className="dd-category">{dish.categoryTitle}</p>
                                    <p className="dd-restaurant-name">{dish.restaurant} </p>
                                    <h4 className="dd-dish-name">{dish.title}</h4>
                                    <div className="dd-card-footer">
                                        <span className="dd-price">₹{dish.price}</span>
                                        <span className="dd-rating">
                                            <svg viewBox="0 0 20 20" fill="#f4a225" width="13" height="13">
                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                            </svg>
                                            {dish.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dot progress */}

            </div>
        </section>
    );
}

export default DelightfulDishes;
