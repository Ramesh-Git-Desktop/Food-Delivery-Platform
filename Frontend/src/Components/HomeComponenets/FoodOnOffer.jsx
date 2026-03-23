// Components/HomeComponents/FoodOnOffer.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaEye } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import FoodData from '../../data/FoodData';
import './FoodOnOffer.css';

// Flatten all dishes with category info, then filter by offers
const allFoodItems = FoodData.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryTitle: cat.title }))
);

// Function to shuffle array
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const FoodOnOffer = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [startIdx, setStartIdx] = useState(0);

    // Filter items with offers and randomize
    const offerItems = shuffleArray(
        allFoodItems.filter(item => item.originalPrice && item.originalPrice > item.price)
    );

    if (offerItems.length === 0) {
        return <div className="foo-empty">No offers available</div>;
    }

    const VISIBLE = 5;
    const canPrev = startIdx > 0;
    const canNext = startIdx + VISIBLE < offerItems.length;

    const handlePrev = () => setStartIdx((i) => Math.max(0, i - 1));
    const handleNext = () =>
        setStartIdx((i) => Math.min(offerItems.length - VISIBLE, i + 1));

    const visible = offerItems.slice(startIdx, startIdx + VISIBLE);

    return (
        <section className="foo-section">
            <div className="container-fluid px-4">
                {/* Header */}
                <div className="foo-header">
                    <div className="foo-header-left">
                        <span className="foo-eyebrow">Limited time only</span>
                        <h2 className="foo-title">Today's Offers</h2>
                    </div>
                    <div className="foo-header-right">
                        <Link to="/category/all-offers" style={{ textDecoration: "none" }}>
                            <button className="foo-view-all">
                                View All
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </Link>

                        <div className="foo-nav-btns">
                            <button
                                className={`foo-nav-btn ${!canPrev ? 'disabled' : ''}`}
                                onClick={handlePrev}
                                disabled={!canPrev}
                                aria-label="Previous"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                            <button
                                className={`foo-nav-btn ${!canNext ? 'disabled' : ''}`}
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
                <div className="foo-cards-wrapper">
                    <div className="foo-cards-track">
                        {visible.map((item, i) => {
                            const discount = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
                            return (
                                <div
                                    key={item.id}
                                    className="foo-card"
                                    style={{ '--delay': `${i * 0.06}s` }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/item/${item.id}`)}
                                >
                                    <div className="foo-img-wrap">
                                        <img src={item.img} alt={item.title} className="foo-img" />
                                        {item.tag && <span className="foo-tag">{item.tag}</span>}
                                        <span className="foo-discount-badge">-{discount}%</span>
                                        <div className="foo-hover-actions">
                                            <button
                                                className="foo-cart-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item);
                                                }}
                                                title="Add to Cart"
                                            >
                                                <FaShoppingCart />
                                            </button>
                                            <button
                                                className="foo-view-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/item/${item.id}`);
                                                }}
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="foo-card-body">
                                        <p className="foo-category">{item.categoryTitle}</p>
                                        <p className="foo-restaurant">{item.restaurant}</p>
                                        <h4 className="foo-dish-name">{item.title}</h4>
                                        <div className="foo-card-footer">
                                            <span className="foo-original-price">₹{item.originalPrice}</span>
                                            <span className="foo-price">₹{item.price}</span>
                                            <span className="foo-rating">
                                                <svg viewBox="0 0 20 20" fill="#f4a225" width="13" height="13">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                                {item.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FoodOnOffer;