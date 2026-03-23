import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ItemsSection from '../Components/HomeComponenets/ItemsSection';
import Restaurants from '../Components/HomeComponenets/Restaurants';
import Testimonial from '../Components/HomeComponenets/Testimonial';
import Newsletter from '../Components/HomeComponenets/Newsletter';
import ContactSection from '../Components/HomeComponenets/ContactSection';
import FoodData from '../data/FoodData';
import "../CSS/Home.css";
import { FaMugHot, FaPizzaSlice, FaUtensils } from 'react-icons/fa';
import RelaxFeatures from '../Components/HomeComponenets/RelaxFeatures';
import BlogSection from '../Components/HomeComponenets/BlogSection';
import Banner from "../assets/Img/scooter-1.png";
import Categories from '../Components/HomeComponenets/Categories';
import DelightfulDishes from '../Components/HomeComponenets/DelightfulDishes';
import FoodOnOffer from '../Components/HomeComponenets/FoodOnOffer';

function Home() {
    const navigate = useNavigate();

    const categoryData = [
        { id: "drinks", icon: <FaMugHot />, title: "Drinks" },
        { id: "pizza-burger", icon: <FaPizzaSlice />, title: "Pizza / Burger" },
        { id: "indian-chinese", icon: <FaUtensils />, title: "Indian / Chinese" },
    ];

    // ✅ FIXED — memoized so it doesn't recreate on every render
    const allItems = useMemo(() =>
        FoodData.flatMap(category =>
            category.items.map(item => ({
                ...item,
                category: category.title
            }))
        ), []
    );

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    const categoryChips = FoodData.map(cat => cat.title);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredItems([]);
        } else {
            const filtered = allItems.filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchTerm, allItems]); // safe now because allItems is memoized

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
        const categoryObj = FoodData.find(cat => cat.title === category);
        if (categoryObj) {
            navigate(`/category/${categoryObj.id}`);
        }
    };

    return (
        <>
            <div className="hero-section position-relative overflow-hidden">
                <div className="hero-bg position-absolute top-0 start-0 w-100 h-100">
                    <img src={Banner} alt="" aria-hidden="true" className="hero-img-bg" />
                    <div className="hero-overlay" />
                    <div className="hero-bottom-fade" />
                </div>

                <div className="hero-inner">
                    <div className="hero-left">
                        <span className="hero-eyebrow">Mediterranean & More</span>
                        <h1 className="hero-title">
                            Discover Food That <br />
                            Makes You <span className="hero-highlight">Happy</span>
                        </h1>
                        <p className="hero-lead">
                            Experience the warmth of Mediterranean flavors delivered right to your doorstep.
                        </p>

                        <div className="card hero-search shadow-lg p-3">
                            <div className="row align-items-center g-3">
                                {/* Location Field */}
                                <div className="col-md-3">
                                    <label className="small text-muted fw-bold search-field-label">
                                        <span>📍</span> Location
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            className="form-control"
                                            defaultValue="Bhubaneswar, India"
                                        />
                                    </div>
                                </div>

                                {/* Search Field */}
                                <div className="col-md-6">
                                    <label className="small text-muted fw-bold search-field-label">
                                        🔍 Search
                                    </label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Restaurant, cuisine or dish..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Button */}
                                <div className="col-md-3">
                                    <button className="btn hero-btn w-100">
                                        Find Food
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-img-frame">
                            <img src={Banner} alt="Delicious Mediterranean food" className="hero-right-img" />
                            <div className="hero-img-badge">
                                <span className="hero-img-badge-icon">⭐</span>
                                <div className="hero-img-badge-text">
                                    <span className="hero-img-badge-value">4.8 / 5</span>
                                    <span className="hero-img-badge-label">1.2K+ Reviews</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {searchTerm.trim() !== '' && (
                <section className="sr-section">
                    <div className="container-fluid px-4">
                        {filteredItems.length > 0 ? (
                            <>
                                <div className="sr-header">
                                    <div className="sr-header-left">
                                        <span className="sr-eyebrow">Search Results</span>
                                        <h2 className="sr-title">Found {filteredItems.length} Item{filteredItems.length !== 1 ? 's' : ''}</h2>
                                    </div>
                                </div>

                                <div className="sr-cards-wrapper">
                                    <div className="sr-cards-track">
                                        {filteredItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="sr-card"
                                                onClick={() => navigate(`/item/${item.id}`)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && navigate(`/item/${item.id}`)}
                                            >
                                                <div className="sr-img-wrap">
                                                    <img src={item.img} alt={item.title} className="sr-img" />
                                                    {item.tag && <span className="sr-tag">{item.tag}</span>}
                                                    {item.originalPrice && (
                                                        <span className="sr-discount">
                                                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="sr-card-body">
                                                    <p className="sr-category">{item.restaurant}</p>
                                                    <h4 className="sr-dish-name">{item.title}</h4>
                                                    <p className="sr-description">{item.desc}</p>
                                                    <div className="sr-card-footer">
                                                        <span className="sr-price">₹{item.price}</span>
                                                        <span className="sr-rating">
                                                            <svg viewBox="0 0 20 20" fill="#f4a225" width="14" height="14">
                                                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                            </svg>
                                                            {item.rating}
                                                        </span>
                                                    </div>
                                                    {item.originalPrice && (
                                                        <span className="sr-original-price">₹{item.originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="sr-no-results text-center py-5">
                                <p className="sr-no-results-text">No items found matching "<strong>{searchTerm}</strong>"</p>
                                <p className="sr-no-results-hint mt-2">Try searching for different keywords or browse our categories</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <div className="container">
                <Categories />
            </div>

            <div className="container">
                <DelightfulDishes />
            </div>
            <div className="container">
                <FoodOnOffer />
            </div>

            <section className='relax-feature'>
                <RelaxFeatures />
            </section>

            <section id="recommended-restaurants">
                <Restaurants />
            </section>

            <Testimonial />
            <Newsletter />

            <section id="blog">
                <BlogSection />
            </section>

            <section id="contact">
                <ContactSection />
            </section>
        </>
    );
}

export default Home;
