// src/Pages/CategoryPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FaSearch, FaArrowLeft, FaShoppingCart, FaCheck,
    FaStar, FaStarHalfAlt, FaRegStar, FaUtensils,
    FaTimes, FaEye
} from 'react-icons/fa';
import FoodData from '../data/FoodData';
import { useCart } from '../context/CartContext';
import '../CSS/CategoryPage.css';

/* ─── Star Rating ──────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push(<FaStar key={i} className="cp-star filled" />);
        else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="cp-star half" />);
        else stars.push(<FaRegStar key={i} className="cp-star" />);
    }
    return <div className="cp-stars">{stars}</div>;
};

/* ─── Veg / Non-Veg Badge ──────────────────────────────────── */
// Since FoodData doesn't have isVeg, we default to veg (green) or derive from title if needed
const VegBadge = ({ isVeg = true }) => (
    <span className={`cp-veg-badge ${isVeg ? 'veg' : 'non-veg'}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
        <span className="cp-veg-dot" />
    </span>
);

/* ─── Item Card (adapted to FoodData fields) ──────────────── */
const ItemCard = ({ item, categoryTitle, onAdd, isAdded, cartQty, onViewDetails }) => {
    const rating = item.rating ?? 4.2;
    // Use 'desc' field, fallback to empty string
    const description = item.desc ?? '';
    // Default veg to true (all items considered veg unless specified)
    const isVeg = item.isVeg !== false;

    return (
        <div className="cp-card">
            <div className="cp-card-img-wrap">
                <img src={item.img} alt={item.title} loading="lazy" />
                {cartQty > 0 && (
                    <span className="cp-cart-badge">{cartQty}</span>
                )}
                <div className="cp-hover-actions">
                    <button
                        className="cp-cart-icon-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onAdd(item);
                        }}
                        title="Add to Cart"
                    >
                        <FaShoppingCart />
                    </button>
                    <button
                        className="cp-view-icon-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onViewDetails(item);
                        }}
                        title="View Details"
                    >
                        <FaEye />
                    </button>
                </div>
            </div>

            <div className="cp-card-body">
                {/* Restaurant name – not present in FoodData, so use category title as fallback */}
                <p className="cp-restaurant">
                    <FaUtensils className="cp-rest-icon" />
                    {categoryTitle} Kitchen
                </p>

                <div className="cp-title-row">
                    <VegBadge isVeg={isVeg} />
                    <h5 className="cp-title">{item.title}</h5>
                </div>

                {description && (
                    <p className="cp-desc">{description}</p>
                )}

                <div className="cp-rating-block">
                    <StarRating rating={rating} />
                    <div className="cp-rating-meta">
                        <span className="cp-rating-val">{Number(rating).toFixed(1)}</span>
                        {/* No reviewCount in FoodData, so omit */}
                    </div>
                </div>

                <div className="cp-footer">
                    <p className="cp-price">₹{item.price?.toFixed(0)}</p>
                    <button
                        className={`cp-add-btn ${isAdded ? 'added' : ''}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(item); }}
                        aria-label={isAdded ? 'Added' : 'Add to cart'}
                    >
                        {isAdded
                            ? <><FaCheck size={10} /> Added</>
                            : <><FaShoppingCart size={10} /> Add</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Page ─────────────────────────────────────────────────── */
const CategoryPage = () => {
    const { categoryId } = useParams();
    const { addToCart, cartItems } = useCart();

    // Handle all-offers special case
    let category;
    if (categoryId === 'all-offers') {
        // Create a virtual category with all offers
        const allOffers = FoodData.flatMap(cat =>
            cat.items.filter(item => item.originalPrice && item.originalPrice > item.price)
        );
        category = {
            id: 'all-offers',
            title: "Today's Special Offers",
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80',
            items: allOffers
        };
    } else {
        category = FoodData.find(cat => cat.id === categoryId);
    }

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('');
    const [vegFilter, setVegFilter] = useState('all');
    const [addedItems, setAddedItems] = useState({});

    if (!category) {
        return (
            <div className="category-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
                    <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#8a8070' }}>Category not found</p>
                    <Link to="/" className="cp-btn-back" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                        <FaArrowLeft /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Filtered + sorted items
    const filteredItems = useMemo(() => {
        let items = [...category.items];

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            items = items.filter(item =>
                item.title.toLowerCase().includes(q) ||
                (item.desc ?? '').toLowerCase().includes(q)
            );
        }

        // Veg filter – since isVeg may not exist, treat undefined as veg
        if (vegFilter === 'veg') {
            items = items.filter(i => i.isVeg !== false);
        } else if (vegFilter === 'non-veg') {
            items = items.filter(i => i.isVeg === false);
        }

        if (sortOption === 'price-low') items.sort((a, b) => a.price - b.price);
        if (sortOption === 'price-high') items.sort((a, b) => b.price - a.price);
        if (sortOption === 'rating-high') items.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        if (sortOption === 'name-asc') items.sort((a, b) => a.title.localeCompare(b.title));

        return items;
    }, [searchTerm, sortOption, vegFilter, category]);

    // Add to cart
    const handleAdd = (item) => {
        // Create a minimal restaurant object for cart context
        const restaurant = { name: category.title, image: category.image, location: 'Bhubaneswar' };
        addToCart(
            { id: item.id, name: item.title, price: item.price, img: item.img },
            restaurant
        );
        setAddedItems(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
    };

    const getQty = (id) => {
        const found = cartItems.find(i => i.id === id);
        return found ? found.quantity : 0;
    };

    // Count veg/non-veg (treat missing isVeg as veg)
    const vegCount = category.items.filter(i => i.isVeg !== false).length;
    const nonVegCount = category.items.filter(i => i.isVeg === false).length;

    const hasActiveFilter = vegFilter !== 'all' || sortOption !== '' || searchTerm !== '';
    const clearAll = () => { setVegFilter('all'); setSortOption(''); setSearchTerm(''); };

    return (
        <div className="category-page">
            {/* Hero Banner – use category.image (not bgImage) */}
            <div className="cp-banner" style={{ backgroundImage: `url(${category.image})` }}>
                <div className="cp-banner-overlay">
                    <p className="cp-banner-eyebrow">{category.items.length} items available</p>
                    <h1 className="cp-hero-title">{category.title}</h1>
                    <p className="cp-hero-sub">Explore our {category.title.toLowerCase()} collection</p>
                </div>
            </div>

            <div className="cp-content-wrap">
                {/* Toolbar */}
                <div className="cp-toolbar">
                    <div className="cp-search-box">
                        <FaSearch className="cp-search-icon" />
                        <input
                            type="text"
                            className="cp-search-input"
                            placeholder={`Search in ${category.title}…`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button className="cp-clear-search" onClick={() => setSearchTerm('')} aria-label="Clear search">
                                <FaTimes size={12} />
                            </button>
                        )}
                    </div>

                    <div className="cp-veg-pills">
                        <button
                            className={`cp-pill ${vegFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setVegFilter('all')}
                        >All ({category.items.length})</button>
                        <button
                            className={`cp-pill veg-pill ${vegFilter === 'veg' ? 'active' : ''}`}
                            onClick={() => setVegFilter('veg')}
                        >
                            <span className="pill-dot veg-dot-sm" />
                            Veg ({vegCount})
                        </button>
                        <button
                            className={`cp-pill nonveg-pill ${vegFilter === 'non-veg' ? 'active' : ''}`}
                            onClick={() => setVegFilter('non-veg')}
                        >
                            <span className="pill-dot nonveg-dot-sm" />
                            Non-Veg ({nonVegCount})
                        </button>
                    </div>

                    <div className="cp-sort-wrap">
                        <label className="cp-sort-label">Sort by</label>
                        <select
                            className="cp-sort-select"
                            value={sortOption}
                            onChange={e => setSortOption(e.target.value)}
                        >
                            <option value="">Default</option>
                            <option value="rating-high">Top Rated</option>
                            <option value="price-low">Price: Low → High</option>
                            <option value="price-high">Price: High → Low</option>
                            <option value="name-asc">Name: A → Z</option>
                        </select>
                    </div>
                </div>

                {/* Results meta */}
                <div className="cp-results-meta">
                    <p className="cp-results-count">
                        Showing <strong>{filteredItems.length}</strong> of <strong>{category.items.length}</strong> items
                        {searchTerm && <> matching "<strong>{searchTerm}</strong>"</>}
                    </p>
                    {hasActiveFilter && (
                        <button className="cp-clear-all" onClick={clearAll}>
                            <FaTimes size={11} /> Clear filters
                        </button>
                    )}
                </div>

                {/* Grid */}
                {filteredItems.length > 0 ? (
                    <div className="cp-grid">
                        {filteredItems.map((item, idx) => (
                            <Link
                                to={`/item/${item.id}`}
                                key={item.id}
                                className="cp-card-link"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <ItemCard
                                    item={item}
                                    categoryTitle={category.title}
                                    onAdd={handleAdd}
                                    isAdded={!!addedItems[item.id]}
                                    cartQty={getQty(item.id)}
                                    onViewDetails={(dish) => navigate(`/item/${dish.id}`)}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="cp-empty">
                        <div className="cp-empty-icon">🍽️</div>
                        <h4>No items found</h4>
                        <p>Try a different search term or reset the filters.</p>
                        <button className="cp-btn-back" onClick={clearAll}>Clear all filters</button>
                    </div>
                )}

                {/* Back button */}
                <div style={{ textAlign: 'center', paddingBottom: '3rem' }}>
                    <Link to="/" className="cp-btn-back">
                        <FaArrowLeft /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;