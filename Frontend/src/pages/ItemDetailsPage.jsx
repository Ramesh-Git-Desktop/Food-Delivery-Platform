// src/Pages/ItemDetailsPage.jsx

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import FoodData from '../data/FoodData';
import { useCart } from '../context/CartContext';
import '../CSS/ItemDetailsPage.css';

/* ── Helpers ──────────────────────────────────────── */
const getCurrentDateTime = () => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const date = now.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit', year: 'numeric' });
    return { time, date };
};

const StarRating = ({ value = 4.5, count }) => (
    <span className="rating">
        {'★'.repeat(Math.floor(value))}{'☆'.repeat(5 - Math.floor(value))}
        &nbsp;{value}
        {count && <span className="review-count">&nbsp;({count} reviews)</span>}
    </span>
);

/* Veg / Non-veg indicator */
const VegIndicator = ({ isVeg }) => (
    <span
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            borderRadius: 3,
            border: `2px solid ${isVeg ? '#2e7d32' : '#c62828'}`,
            marginRight: 8,
            flexShrink: 0,
        }}
        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
        <span style={{
            width: 9, height: 9, borderRadius: '50%',
            background: isVeg ? '#2e7d32' : '#c62828',
            display: 'block',
        }} />
    </span>
);

/* ── Component ────────────────────────────────────── */
const ItemDetailsPage = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const { addToCart, updateQuantity, cartItems } = useCart();
    const [activeTab, setActiveTab] = useState('Order Online');

    /* locate item */
    let item = null, category = null;
    for (const cat of FoodData) {
        const found = cat.items.find(i => i.id === itemId);
        if (found) { item = found; category = cat; break; }
    }

    if (!item) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', color: '#1a1a18' }}>Item not found</h2>
                <Link to="/" style={{ color: '#b89a50', fontWeight: 600, textDecoration: 'none' }}>← Back to menu</Link>
            </div>
        </div>
    );

    const cartEntry = cartItems.find(i => i.id === item.id);
    const qty = cartEntry ? cartEntry.quantity : 0;
    const inCart = qty > 0;

    /* Use restaurantName from FoodData; fallback gracefully */
    const restaurantName = item.restaurantName ?? 'Hungry Hub Kitchen';
    const restaurantInfo = { name: restaurantName, image: item.img, location: 'Bhubaneswar' };

    const handleAddToCart = () => {
        addToCart({ id: item.id, name: item.title, price: item.price, img: item.img }, restaurantInfo);
    };

    const decrease = () => { if (qty > 0) updateQuantity(item.id, -1); };
    const increase = () => { inCart ? updateQuantity(item.id, 1) : handleAddToCart(); };

    const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const similarItems = category.items.filter(i => i.id !== itemId).slice(0, 3);
    const { time, date } = getCurrentDateTime();
    const tabs = ['Order Online', 'Reviews', 'Photos', 'Menu', 'Info'];

    const categories = [
        { label: 'Recommended', count: 3 },
        { label: 'Starters', count: 6 },
        { label: 'Main Course', count: 8 },
        { label: 'Breads & Rice', count: 4 },
        { label: 'Desserts', count: 5 },
    ];

    const offers = [
        { tag: '20% OFF', desc: 'Up to ₹200 savings', code: 'HUNGRYHUB20' },
        { tag: 'FREE DELIVERY', desc: 'On orders above ₹499', code: null },
        { tag: 'BUY 1 GET 1', desc: 'On select starters', code: 'BOGO2025' },
    ];

    const subtotal = item.price * (qty || 1);
    const discount = 20;
    const total = Math.max(0, subtotal - discount);

    return (
        <div className="item-details-page">

            {/* ── Top Bar ── */}
            <div className="top-bar">
                <div className="container d-flex justify-content-between align-items-center">
                    <div className="weather">
                        <span>26°C</span>
                        <span className="weather-icon">☀️</span>
                        Sunny · Bhubaneswar
                    </div>
                    <div className="language-time">
                        <span>ENG</span><span className="separator">|</span>
                        <span>IN</span><span className="separator">|</span>
                        <span>{time}</span><span className="separator">|</span>
                        <span>{date}</span>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="container py-4">
                <div className="row g-4">

                    {/* ── Left Column ── */}
                    <div className="col-lg-8">

                        {/* Restaurant Header */}
                        <div className="restaurant-header mb-4">
                            <h1 className="restaurant-name">{restaurantName}</h1>
                            <p className="cuisine-type">{category.title} · Bhubaneswar</p>

                            <div className="ratings">
                                <StarRating value={item.rating ?? 4.5} count={item.reviewCount ? `${item.reviewCount.toLocaleString()}+` : '1.2K+'} />
                            </div>

                            <p className="open-status">Open Now &nbsp;·&nbsp; 10:00 AM – 11:00 PM</p>

                            <nav className="restaurant-tabs">
                                {tabs.map(t => (
                                    <button
                                        key={t}
                                        className={`tab${activeTab === t ? ' active' : ''}`}
                                        onClick={() => setActiveTab(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Offers */}
                        <section className="offers-section mb-4">
                            <h3 className="section-title">Offers for you</h3>
                            <div className="offers-grid">
                                {offers.map((o, i) => (
                                    <div className="offer-card" key={i}>
                                        <span className="offer-tag">{o.tag}</span>
                                        <div className="offer-details">
                                            <strong>{o.desc}</strong>
                                            {o.code && <div className="offer-code">Code: {o.code}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Categories */}
                        <div className="categories-sidebar mb-4">
                            <h3 className="section-title">Categories</h3>
                            <ul className="category-list">
                                {categories.map((c, i) => (
                                    <li key={i} className={`category-item${i === 0 ? ' active' : ''}`}>
                                        {c.label}
                                        <span className="item-count">{c.count}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Item Detail Card */}
                        <div className="item-detail-card">
                            <span className="badge-bestseller">⭐ BESTSELLER</span>

                            <div className="row g-4 mt-1">
                                {/* Image */}
                                <div className="col-md-5">
                                    <img src={item.img} alt={item.title} className="item-image" />
                                </div>

                                {/* Info */}
                                <div className="col-md-7">
                                    {/* Veg/Non-veg + Title */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: '0.4rem' }}>
                                        <VegIndicator isVeg={item.isVeg !== false} />
                                        <h2 className="item-title" style={{ margin: 0 }}>{item.title}</h2>
                                    </div>

                                    <p className="item-price">₹{item.price?.toFixed(2)}</p>
                                    <p className="item-description">
                                        {item.description || 'A masterfully crafted dish with the finest ingredients, seasoned to perfection.'}
                                    </p>

                                    <div className="item-meta">
                                        <span className="item-quantity">{qty > 0 ? `${qty} IN CART` : 'NOT IN CART'}</span>
                                        {inCart && <span className="extra-offer">Extra ₹{discount} off applied</span>}
                                    </div>

                                    {/* Quantity + CTA */}
                                    <div className="item-actions">
                                        {inCart && (
                                            <div className="quantity-selector">
                                                <button className="quantity-btn" onClick={decrease} aria-label="Decrease">−</button>
                                                <input type="text" value={qty} readOnly aria-label="Quantity" />
                                                <button className="quantity-btn" onClick={increase} aria-label="Increase">+</button>
                                            </div>
                                        )}
                                        <button
                                            className="btn-add-to-cart"
                                            onClick={inCart ? increase : handleAddToCart}
                                            style={inCart ? { background: '#4a7c59' } : {}}
                                        >
                                            {inCart ? '✓ Add More' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* View Cart */}
                        {inCart && (
                            <div className="view-cart-wrapper">
                                <button className="btn-view-cart" onClick={() => navigate('/cart')}>
                                    View Cart ({totalCartItems})
                                </button>
                            </div>
                        )}

                        {/* Similar Items */}
                        {similarItems.length > 0 && (
                            <section className="similar-items">
                                <h3 className="section-title">You might also like</h3>
                                <div className="row g-3">
                                    {similarItems.map(s => (
                                        <div className="col-md-4" key={s.id}>
                                            <Link to={`/item/${s.id}`} className="similar-item-link">
                                                <div className="similar-item-card">
                                                    <img src={s.img} alt={s.title} className="similar-item-img" />
                                                    <h5>{s.title}</h5>
                                                    <p className="similar-item-price">₹{s.price?.toFixed(2)}</p>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <div className="col-lg-4">
                        <div className="sidebar-card">

                            {/* Mini preview */}
                            <div className="sidebar-item-preview">
                                <img src={item.img} alt={item.title} />
                                <div>
                                    <p className="sidebar-item-name">{item.title}</p>
                                    <p className="sidebar-item-price">₹{item.price?.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="sidebar-divider" />

                            {/* Cart summary */}
                            <div className="sidebar-row">
                                <span className="sidebar-label">Subtotal</span>
                                <span className="sidebar-value">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-label">Delivery fee</span>
                                <span className="sidebar-value free">FREE</span>
                            </div>
                            <div className="sidebar-row">
                                <span className="sidebar-label">Discount</span>
                                <span className="sidebar-value disc">−₹{discount}.00</span>
                            </div>

                            <div className="sidebar-divider" />

                            <div className="sidebar-row">
                                <span className="sidebar-label total">Total</span>
                                <span className="sidebar-value total">₹{total.toFixed(2)}</span>
                            </div>

                            <button className="btn-checkout" onClick={() => navigate('/checkout')}>
                                Proceed to Checkout
                            </button>

                            {/* Trust badges */}
                            <div className="trust-badges">
                                {['🔒 Secure', '⚡ Fast', '😊 Rated 4.5'].map((b, i) => (
                                    <span key={i} className="trust-badge">{b}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;