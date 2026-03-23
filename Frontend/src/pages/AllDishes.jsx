// AllDishes.jsx — Classic full-page grid of all dishes
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodData from '../data/FoodData';
import '../CSS/AllDishes.css';

const allDishes = FoodData.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryTitle: cat.title }))
);

const categories = ['All', ...FoodData.map((c) => c.title)];

function AllDishes() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');

    const filtered = useMemo(() => {
        let list = allDishes;
        if (activeCategory !== 'All') {
            list = list.filter((d) => d.categoryTitle === activeCategory);
        }
        if (search.trim()) {
            list = list.filter((d) =>
                d.title.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
        if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
        return list;
    }, [activeCategory, search, sort]);

    return (
        <div className="ad-page">
            {/* Hero Banner */}
            <div className="ad-hero">
                <div className="ad-hero-overlay" />
                <div className="ad-hero-content">
                    <button className="ad-back-btn" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                    </button>
                    <span className="ad-hero-eyebrow">Our Menu</span>
                    <h1 className="ad-hero-title">All Delightful Dishes</h1>
                    <p className="ad-hero-sub">{allDishes.length}+ dishes crafted with love</p>
                </div>
            </div>

            {/* Controls */}
            <div className="ad-controls-bar container py-5 ">
                {/* Search */}
                <div className="ad-search-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ad-search-icon">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        className="ad-search-input"
                        placeholder="Search dishes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Sort */}
                <select
                    className="ad-sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="default">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                </select>
            </div>

            {/* Category Filter Chips */}
            <div className="ad-chips-wrap container mb-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`ad-chip ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results count */}
            <div className="container pt-5 pb-3 ad-results-info">
                <span>{filtered.length} dishes found</span>
            </div>

            {/* Grid */}
            <div className="ad-grid container">
                {filtered.length === 0 ? (
                    <div className="ad-empty">
                        <span className="ad-empty-emoji">🍽️</span>
                        <p>No dishes found. Try a different search!</p>
                    </div>
                ) : (
                    filtered.map((dish, i) => (
                        <div
                            key={dish.id}
                            className="ad-card"
                            style={{ '--delay': `${(i % 20) * 0.04}s` }}
                            onClick={() => navigate(`/item/${dish.id}`)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/item/${dish.id}`)}
                        >
                            <div className="ad-img-wrap">
                                <img src={dish.img} alt={dish.title} className="ad-img" loading="lazy" />
                                {dish.tag && <span className="ad-tag">{dish.tag}</span>}
                                <div className="ad-img-overlay">
                                    <button className="ad-quick-view" onClick={(e) => { e.stopPropagation(); navigate(`/item/${dish.id}`); }}>
                                        Quick View
                                    </button>
                                </div>
                            </div>
                            <div className="ad-card-body">
                                <span className="ad-cat-label">{dish.categoryTitle}</span>
                                <h3 className="ad-dish-name">{dish.title}</h3>
                                <p className="ad-desc">{dish.desc}</p>
                                <div className="ad-card-footer">
                                    <span className="ad-price">₹{dish.price}</span>
                                    <span className="ad-rating">
                                        <svg viewBox="0 0 20 20" fill="#f4a225" width="12" height="12">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                        {dish.rating}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AllDishes;