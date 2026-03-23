// src/Pages/RecommendedRestaurants.jsx

import { useRef, useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight, FaStar, FaShoppingBag, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import FoodData, { restaurants as FoodDataRestaurants } from "../data/FoodData.jsx";
import "../CSS/RecommendedRestaurants.css";

/* ─── Get Categories from FoodData ───────────────────────────── */
const categories = FoodData.map((cat, idx) => ({
    name: cat.title,
    image: cat.image,
    selected: idx === 3, // "Biryani & Rice" will be selected by default
}));

/* ─── Transform Restaurants Data ─────────────────────────────── */
const transformedRestaurants = FoodDataRestaurants.slice(0, 16).map((rest, idx) => ({
    id: rest.id,
    name: rest.name,
    image: rest.image || "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80",
    offer: ["ITEMS AT ₹90", "50% OFF", "ITEMS AT ₹190", "ITEMS AT ₹99", "ITEMS AT ₹120", "FLAT ₹50 OFF"][idx % 6],
    rating: rest.rating || 4.5,
    time: ["15–20 min", "20–25 min", "15–25 min", "20–30 min"][idx % 4],
    category: categories[idx % categories.length]?.name || "Multi-cuisine",
    location: "Bhubaneswar",
}));

/* ─── Rating Stars ──────────────────────────────────────────── */
const RatingStars = ({ value }) => {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
        <div className="rr-stars">
            {Array.from({ length: 5 }, (_, i) => (
                <FaStar
                    key={i}
                    className={`rr-star ${i < full ? "filled" : i === full && half ? "half" : ""}`}
                />
            ))}
        </div>
    );
};

/* ─── Restaurant Card ───────────────────────────────────────── */
const RestaurantCard = ({ restaurant, index }) => {
    const navigate = useNavigate();

    return (
        <article
            className="rr-card"
            style={{ animationDelay: `${index * 0.07}s` }}
            onClick={() => navigate(`/recommended-restaurants/${restaurant.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && navigate(`/recommended-restaurants/${restaurant.id}`)}
            aria-label={`View ${restaurant.name}`}
        >
            {/* Image */}
            <div className="rr-card-img-wrap">
                <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/600x360/e8e0d4/7a7469?text=${encodeURIComponent(restaurant.name)}`; }}
                />

                {/* Offer ribbon */}
                <div className="rr-offer-ribbon">
                    <span>{restaurant.offer}</span>
                </div>

                {/* Delivery time chip */}
                <div className="rr-time-chip">
                    <FaClock size={10} />
                    <span>{restaurant.time}</span>
                </div>

                {/* Gradient scrim */}
                <div className="rr-img-scrim" />
            </div>

            {/* Body */}
            <div className="rr-card-body">
                <div className="rr-card-top">
                    <h3 className="rr-name">{restaurant.name}</h3>
                    {/* Rating badge */}
                    <div className="rr-rating-badge">
                        <FaStar size={10} />
                        <span>{restaurant.rating.toFixed(1)}</span>
                    </div>
                </div>

                <RatingStars value={restaurant.rating} />

                <div className="rr-card-sep" />

                <div className="rr-card-meta">
                    <p className="rr-category">{restaurant.category}</p>
                    <p className="rr-location">
                        <FaMapMarkerAlt size={10} />
                        {restaurant.location}
                    </p>
                </div>
            </div>
        </article>
    );
};

/* ─── Category Pill ─────────────────────────────────────────── */
const CategoryPill = ({ cat, onClick }) => (
    <button
        className={`rr-cat-pill ${cat.selected ? "active" : ""}`}
        onClick={() => onClick(cat.name)}
        aria-label={cat.name}
    >
        <div className="rr-cat-img-wrap">
            <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/100x100/e8e0d4/7a7469?text=${encodeURIComponent(cat.name[0])}`; }}
            />
            {cat.selected && <span className="rr-cat-selected-dot" />}
        </div>
        <span className="rr-cat-name">{cat.name}</span>
    </button>
);

/* ─── Page Component ────────────────────────────────────────── */
const RecommendedRestaurants = () => {
    const navigate = useNavigate();
    const { itemsCount, cartTotal } = useCart();

    const scrollRef = useRef(null);
    const [canBack, setCanBack] = useState(false);
    const [canForward, setCanForward] = useState(true);
    const [activeFilter, setActiveFilter] = useState("All");

    /* scroll state */
    const updateScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanBack(el.scrollLeft > 4);
        setCanForward(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        updateScroll();
        el.addEventListener("scroll", updateScroll);
        window.addEventListener("resize", updateScroll);
        return () => { el.removeEventListener("scroll", updateScroll); window.removeEventListener("resize", updateScroll); };
    }, []);

    const scrollCats = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        const step = 320;
        el.scrollBy({ left: dir === "back" ? -step : step, behavior: "smooth" });
    };

    const handleCategoryClick = (name) => {
        navigate(`/category-details/${encodeURIComponent(name.toLowerCase())}`);
    };

    /* filter restaurants */
    const displayed = activeFilter === "All"
        ? transformedRestaurants
        : transformedRestaurants.filter(r => r.category.toLowerCase().includes(activeFilter.toLowerCase()));

    const filterTabs = ["All", "Pizza", "Burger", "Biryani", "Noodles", "Coffee"];

    return (
        <div className="rr-page">

            {/* ══════════ HERO STRIP ══════════ */}
            <div className="rr-hero">
                <div className="rr-hero-inner">
                    <span className="rr-hero-eyebrow">Curated for you · Bhubaneswar</span>
                    <h1 className="rr-hero-title">Our Recommended<br /><em>Best Restaurants</em></h1>
                    <p className="rr-hero-sub">Discover fine dining, speedy delivery and unbeatable deals — all in one place.</p>
                </div>
                {/* decorative diagonal stripe */}
                <div className="rr-hero-stripe" />
            </div>

            {/* ══════════ CATEGORY STRIP ══════════ */}
            <section className="rr-section rr-cats-section">
                <div className="rr-container">
                    <div className="rr-section-header">
                        <div>
                            <span className="rr-eyebrow-label">Browse by Cuisine</span>
                            <h2 className="rr-section-title">What are you craving?</h2>
                        </div>
                        {/* scroll controls */}
                        <div className="rr-scroll-controls">
                            <button
                                className="rr-scroll-btn"
                                onClick={() => scrollCats("back")}
                                disabled={!canBack}
                                aria-label="Scroll left"
                            >
                                <FaArrowLeft />
                            </button>
                            <button
                                className="rr-scroll-btn"
                                onClick={() => scrollCats("forward")}
                                disabled={!canForward}
                                aria-label="Scroll right"
                            >
                                <FaArrowRight />
                            </button>
                        </div>
                    </div>

                    {/* scrollable strip */}
                    <div className="rr-cats-track" ref={scrollRef}>
                        {categories.map((cat, i) => (
                            <CategoryPill key={i} cat={cat} onClick={handleCategoryClick} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ DIVIDER ══════════ */}
            <div className="rr-ornamental-divider">
                <span className="rr-divider-line" />
                <span className="rr-divider-diamond">◆</span>
                <span className="rr-divider-line" />
            </div>

            {/* ══════════ RESTAURANT GRID ══════════ */}
            <section className="rr-section rr-restaurants-section">
                <div className="rr-container">
                    <div className="rr-section-header">
                        <div>
                            <span className="rr-eyebrow-label">Near You · Fast Delivery</span>
                            <h2 className="rr-section-title">Restaurants Near You</h2>
                        </div>
                        <p className="rr-restaurant-count">{displayed.length} restaurants</p>
                    </div>

                    {/* Filter tabs */}
                    <div className="rr-filter-tabs">
                        {filterTabs.map(tab => (
                            <button
                                key={tab}
                                className={`rr-filter-tab ${activeFilter === tab ? "active" : ""}`}
                                onClick={() => setActiveFilter(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="rr-grid">
                        {displayed.map((r, i) => (
                            <RestaurantCard key={r.id} restaurant={r} index={i} />
                        ))}
                    </div>

                    {displayed.length === 0 && (
                        <div className="rr-empty">
                            <span className="rr-empty-icon">🍽️</span>
                            <p>No restaurants found for this filter.</p>
                            <button className="rr-filter-tab active" onClick={() => setActiveFilter("All")}>Show all</button>
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════ FLOATING CART BAR ══════════ */}
            {itemsCount > 0 && (
                <div className="rr-float-cart" onClick={() => navigate("/cart")} role="button" tabIndex={0}>
                    <span className="rr-float-left">
                        <FaShoppingBag size={16} />
                        <span>{itemsCount} {itemsCount === 1 ? "item" : "items"}</span>
                        <span className="rr-float-sep">·</span>
                        <span>₹{cartTotal.toFixed(0)}</span>
                    </span>
                    <span className="rr-float-right">
                        View Cart
                        <FaArrowRight size={12} />
                    </span>
                </div>
            )}
        </div>
    );
};

export default RecommendedRestaurants;