import React, { useState } from "react";
import FoodData from "../data/FoodData";
import "../css/Dominos.css";

const Dominos = () => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState(FoodData[0]);

    const allItems = selectedCategory.items;

    const filteredItems =
        activeFilter === "all"
            ? allItems
            : allItems.filter((item) => {
                const vegKeywords = ["veg", "paneer", "mushroom", "garlic", "cheese", "margherita"];
                const itemNameLower = item.title.toLowerCase();
                const isVeg = vegKeywords.some(keyword => itemNameLower.includes(keyword));

                if (activeFilter === "veg") return isVeg;
                if (activeFilter === "nonveg") return !isVeg;
                return true;
            });

    return (
        <div className="dominos-wrapper">
            <div className="dominos-hero-banner" style={{ backgroundImage: `url(${selectedCategory.bgImage})` }}>
                <div className="dominos-banner-overlay"></div>
                <div className="dominos-banner-content">
                    <h1 className="dominos-banner-title">{selectedCategory.title}</h1>
                    <p className="dominos-banner-subtitle">Fresh. Hot. Delicious.</p>
                    <div className="dominos-banner-features">
                        <div className="dominos-feature-item">
                            <span className="dominos-feature-icon">🍕</span>
                            <span className="dominos-feature-text">100+ Varieties</span>
                        </div>
                        <div className="dominos-feature-item">
                            <span className="dominos-feature-icon">🚚</span>
                            <span className="dominos-feature-text">30 Min Delivery</span>
                        </div>
                        <div className="dominos-feature-item">
                            <span className="dominos-feature-icon">⭐</span>
                            <span className="dominos-feature-text">4.5★ Rated</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dominos-menu-container">

                <div className="dominos-category-tabs">
                    {FoodData.map((category) => (
                        <button
                            key={category.id}
                            className={`dominos-category-tab ${selectedCategory.id === category.id ? "dominos-active" : ""}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category.title}
                        </button>
                    ))}
                </div>

                <div className="dominos-menu-header">
                    <h1 className="dominos-menu-title">Our Menu</h1>

                    <div className="dominos-filter-tabs">
                        <button
                            className={`dominos-filter-btn dominos-all-btn ${activeFilter === "all" ? "dominos-active" : ""}`}
                            onClick={() => setActiveFilter("all")}
                        >
                            ALL
                        </button>
                        <button
                            className={`dominos-filter-btn dominos-veg-btn ${activeFilter === "veg" ? "dominos-active" : ""}`}
                            onClick={() => setActiveFilter("veg")}
                        >
                            <span className="dominos-veg-icon"></span>
                        </button>
                        <button
                            className={`dominos-filter-btn dominos-nonveg-btn ${activeFilter === "nonveg" ? "dominos-active" : ""}`}
                            onClick={() => setActiveFilter("nonveg")}
                        >
                            <span className="dominos-nonveg-icon"></span>
                        </button>
                    </div>
                </div>

                <div className="dominos-menu-subtitle">
                    <h2>Recommended ({filteredItems.length})</h2>
                </div>

                <div className="dominos-menu-grid">
                    {filteredItems.map((item, index) => {
                        const vegKeywords = ["veg", "paneer", "mushroom", "garlic", "cheese", "margherita"];
                        const isVeg = vegKeywords.some(keyword =>
                            item.title.toLowerCase().includes(keyword)
                        );

                        return (
                            <div
                                key={item.id}
                                className="dominos-menu-item"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="dominos-item-image-wrapper">
                                    <img src={item.img} alt={item.title} className="dominos-item-image" />
                                    <span className={`dominos-food-type-badge ${isVeg ? 'dominos-veg' : 'dominos-nonveg'}`}>
                                        <span className="dominos-type-icon"></span>
                                    </span>
                                </div>

                                <div className="dominos-item-content">
                                    <div className="dominos-item-header">
                                        <h3 className="dominos-item-name">{item.title}</h3>
                                        <p className="dominos-item-price">₹{item.price.toFixed(2)}</p>
                                    </div>

                                    <p className="dominos-item-description">{item.description}</p>

                                    <div className="dominos-item-footer">
                                        <button className="dominos-add-btn">
                                            <span className="dominos-btn-icon">+</span>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
};

export default Dominos;
