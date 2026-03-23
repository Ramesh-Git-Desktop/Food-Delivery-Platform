// src/Components/HomeComponenets/ItemsSection.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaCheck, FaUtensils } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import './ItemsSection.css';

/* ─── Star Rating ──────────────────────────────────────────── */
const StarRating = ({ rating = 0 }) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (rating >= i) stars.push(<FaStar key={i} className="star filled" />);
        else if (rating >= i - 0.5) stars.push(<FaStarHalfAlt key={i} className="star half" />);
        else stars.push(<FaRegStar key={i} className="star" />);
    }
    return <div className="item-stars">{stars}</div>;
};

/* ─── Veg / Non-Veg Dot ────────────────────────────────────── */
const VegBadge = ({ isVeg }) => (
    <span className={`veg-badge ${isVeg ? 'veg' : 'non-veg'}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
        <span className="veg-dot" />
    </span>
);

/* ─── Single Card ─────────────────────────────────────────── */
const ItemCard = ({ item, onAddToCart, isAdded, cartQty }) => {
    const rating = item.rating ?? 4.2;
    const reviews = item.reviewCount ?? 0;

    return (
        <div className="item-cards">
            {/* ── Image ── */}
            <div className="item-image-wrapper">
                <img src={item.img} alt={item.title} className="item-image" loading="lazy" />
                {cartQty > 0 && (
                    <div className="item-cart-badge">{cartQty}</div>
                )}
            </div>

            {/* ── Body ── */}
            <div className="item-content">

                {/* Restaurant name */}
                <p className="item-restaurant">
                    <FaUtensils className="restaurant-icon" />
                    {item.restaurantName ?? 'Hungry Hub Kitchen'}
                </p>

                {/* Title + Veg indicator */}
                <div className="item-title-row">
                    <VegBadge isVeg={item.isVeg !== false} />
                    <h4 className="item-title">{item.title}</h4>
                </div>

                {/* Description */}
                {item.description && (
                    <p className="item-desc">{item.description}</p>
                )}

                {/* Stars + count */}
                <div className="item-review">
                    <StarRating rating={rating} />
                    <div className="item-rating-row">
                        <span className="item-rating-value">{Number(rating).toFixed(1)}</span>
                        {reviews > 0 && (
                            <span className="item-review-count">({reviews.toLocaleString()} reviews)</span>
                        )}
                    </div>
                </div>

                {/* Price + Add button */}
                <div className="item-footer">
                    <p className="item-price">₹{item.price?.toFixed(0)}</p>
                    <button
                        className={`item-add-btn ${isAdded ? 'added' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onAddToCart(item);
                        }}
                        aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
                    >
                        {isAdded
                            ? <><FaCheck size={11} /> Added</>
                            : <><FaShoppingCart size={11} /> Add</>}
                    </button>
                </div>

            </div>
        </div>
    );
};

/* ─── Section ─────────────────────────────────────────────── */
const ItemsSection = ({ id, title, items, bg = "light" }) => {
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);
    const [addedItems, setAddedItems] = useState({});

    const { addToCart, cartItems } = useCart();

    /* scroll visibility */
    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeft(scrollLeft > 10);
            setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        const t = setTimeout(checkScroll, 100);
        return () => { window.removeEventListener('resize', checkScroll); clearTimeout(t); };
    }, [items]);

    const scroll = (dir) => {
        if (scrollRef.current) {
            const card = scrollRef.current.querySelector('.item-cards-link');
            if (card) {
                const amount = (card.offsetWidth + 20) * 2;
                scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
                setTimeout(checkScroll, 400);
            }
        }
    };

    /* add to cart */
    const handleAddToCart = (item) => {
        addToCart(
            { id: item.id, name: item.title, price: item.price, img: item.img },
            { name: item.restaurantName ?? 'Hungry Hub Kitchen', image: item.img, location: 'Bhubaneswar' }
        );
        setAddedItems(prev => ({ ...prev, [item.id]: true }));
        setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
    };

    const getCartQty = (itemId) => {
        const found = cartItems.find(i => i.id === itemId);
        return found ? found.quantity : 0;
    };

    const bgClass = bg === "white" ? "items-section-white" : "items-section";

    return (
        <section className={bgClass}>
            <div className="items-section-container position-relative">

                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="item-section-title">{title}</h2>
                    <Link to={`/category/${id}`} className="btn-primary-custom">
                        View all <i className="fas fa-arrow-right" />
                    </Link>
                </div>

                {/* Carousel */}
                <div className="items-carousel-wrapper">
                    {showLeft && (
                        <button className="carousel-control prev" onClick={() => scroll('left')} aria-label="Previous">
                            <FaArrowLeft />
                        </button>
                    )}

                    <div className="items-carousel" ref={scrollRef} onScroll={checkScroll}>
                        {items.map((item) => (
                            <Link to={`/item/${item.id}`} key={item.id} className="item-cards-link">
                                <ItemCard
                                    item={item}
                                    onAddToCart={handleAddToCart}
                                    isAdded={!!addedItems[item.id]}
                                    cartQty={getCartQty(item.id)}
                                />
                            </Link>
                        ))}
                    </div>

                    {showRight && (
                        <button className="carousel-control next" onClick={() => scroll('right')} aria-label="Next">
                            <FaArrowRight />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ItemsSection;