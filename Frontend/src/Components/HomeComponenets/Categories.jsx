// Categories.jsx — Horizontal scrollable category cards with teal circle images
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodData from '../../data/FoodData';
import './Categories.css';

function Categories() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [activeId, setActiveId] = useState(null);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
        }
    };

    const handleClick = (cat) => {
        setActiveId(cat.id);
        // If category has items, pick a random item's restaurantId and open its RestaurantDetails
        const items = cat.items || [];
        if (items.length > 0) {
            const rand = Math.floor(Math.random() * items.length);
            const restaurantId = items[rand].restaurantId;
            // navigate to restaurant details route used in App.jsx
            navigate(`/recommended-restaurants/${encodeURIComponent(restaurantId)}`);
            return;
        }

        // Fallback: open category page if no items
        navigate(`/category/${cat.id}`);
    };

    // Flatten all items to get category-level images from first item
    const categories = FoodData.map((cat) => ({
        id: cat.id,
        title: cat.title,
        image: cat.items[0]?.img || cat.image,
        count: cat.items.length,
    }));

    return (
        <section className="categories-section">
            <div className="container-fluid px-4">
                <div className="categories-header">
                    <h2 className="categories-title">Browse Categories</h2>
                    <div className="categories-nav-btns">
                        <button className="cat-nav-btn" onClick={() => scroll('left')} aria-label="Scroll left">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className="cat-nav-btn" onClick={() => scroll('right')} aria-label="Scroll right">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="categories-wrapper" ref={scrollRef}>
                    {categories.map((cat) => (
                        <div
                            key={cat.id}
                            className={`category-card ${activeId === cat.id ? 'active' : ''}`}
                            onClick={() => handleClick(cat)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && handleClick(cat)}
                        >
                            <div className="category-img-circle">
                                <img src={cat.image} alt={cat.title} />
                            </div>
                            <p className="category-card-title">{cat.title}</p>
                            <span className="category-card-count">{cat.count} items</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Categories;