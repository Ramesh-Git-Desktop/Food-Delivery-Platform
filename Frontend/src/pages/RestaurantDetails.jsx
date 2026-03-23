import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaShoppingBag, FaSearch, FaMapMarkerAlt, FaClock, FaMotorcycle, FaTimes } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";
import FoodData, { restaurants as FoodDataRestaurants } from "../data/FoodData.jsx";
import "../CSS/RestaurantDetails.css";

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, itemsCount, cartTotal, getItemQuantity, updateQuantity } = useCart();
    const [showCartBar, setShowCartBar] = useState(true);
    const [isVegOnly, setIsVegOnly] = useState(false);
    const [isNonVegOnly, setIsNonVegOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(null);
    const categoryRefs = useRef({});

    const restaurant = FoodDataRestaurants.find((r) => r.id === id);

    if (!restaurant) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f8f8" }}>
                <div style={{ background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                    <h2 style={{ color: "#282C3F", fontWeight: 800, marginBottom: "12px" }}>Restaurant Not Found</h2>
                    <p style={{ color: "#93959f", marginBottom: "24px" }}>We couldn't find the restaurant you're looking for.</p>
                    <button
                        onClick={() => navigate("/")}
                        style={{ background: "#EE9C00", color: "white", border: "none", borderRadius: "8px", padding: "12px 32px", fontWeight: 800, cursor: "pointer", fontSize: "14px" }}
                    >
                        BACK TO HOME
                    </button>
                </div>
            </div>
        );
    }

    // Build categorized menu from FoodData
    const getMenuByCategory = () => {
        const categoryMap = {};
        FoodData.forEach(category => {
            const matchingItems = (category.items || []).filter(item => item.restaurantId === id);
            if (matchingItems.length > 0) {
                categoryMap[category.id] = {
                    title: category.title || category.id,
                    items: matchingItems.map(item => ({
                        id: item.id,
                        name: item.title,
                        price: item.price,
                        rating: item.rating,
                        description: item.desc || "Delicious food item",
                        image: item.img,
                        isBestseller: item.tag === "Bestseller" || item.tag === "Popular",
                        isVeg: item.isVeg !== false && !item.tag?.toLowerCase().includes("chicken") && !item.tag?.toLowerCase().includes("meat"),
                        tag: item.tag,
                    }))
                };
            }
        });
        return categoryMap;
    };

    const menuByCategory = getMenuByCategory();
    const categories = Object.keys(menuByCategory);

    // Set first category as active on load
    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [categories]);

    const getAllItems = () => Object.values(menuByCategory).flatMap(c => c.items || []);

    const getFilteredItems = (items) => {
        return items.filter(item => {
            const matchesVeg = isVegOnly ? item.isVeg : isNonVegOnly ? !item.isVeg : true;
            const matchesSearch = searchQuery === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesVeg && matchesSearch;
        });
    };

    const scrollToCategory = (cat) => {
        setActiveCategory(cat);
        const ref = categoryRefs.current[cat];
        if (ref) {
            const yOffset = -80;
            const y = ref.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    // Get the currently active category data
    const activeCatData = activeCategory ? menuByCategory[activeCategory] : null;
    const filteredItems = activeCatData ? getFilteredItems(activeCatData.items) : [];
    const visibleItems = filteredItems.slice(0, 8); // Show only first 8 items
    const hasMore = filteredItems.length > 8;

    return (
        <div className="rd-root">
            {/* ── Restaurant Header ── */}
            <div className="rd-hero">
                <div className="rd-hero-inner">
                    <div className="rd-breadcrumb">
                        <span onClick={() => navigate("/")}>Home</span>
                        <span className="rd-breadcrumb-sep">›</span>
                        <span onClick={() => navigate("/")}>{restaurant.location || "Bhubaneswar"}</span>
                        <span className="rd-breadcrumb-sep">›</span>
                        <span className="rd-breadcrumb-active">{restaurant.name}</span>
                    </div>

                    <div className="rd-header-card">
                        <div className="rd-header-left">
                            <h1 className="rd-restaurant-name">{restaurant.name}</h1>
                            <p className="rd-cuisine">{restaurant.cuisine || "Multi-Cuisine"}</p>
                            <div className="rd-meta-row">
                                <span className="rd-meta-item">
                                    <FaMapMarkerAlt size={12} />
                                    {restaurant.location || "Bhubaneswar"} • {restaurant.distance || "2.5 km away"}
                                </span>
                            </div>
                            <div className="rd-badges-row">
                                <div className="rd-badge">
                                    <FaClock size={12} />
                                    <span>{restaurant.deliveryTime || "30"} mins</span>
                                </div>
                                <div className="rd-badge-dot" />
                                <div className="rd-badge">
                                    <FaMotorcycle size={13} />
                                    <span>₹{restaurant.deliveryFee || "40"} Delivery Fee</span>
                                </div>
                            </div>
                        </div>
                        <div className="rd-rating-card">
                            <FaStar size={18} color="#1A8C34" />
                            <span className="rd-rating-val">{restaurant.rating || "4.5"}</span>
                            <div className="rd-rating-divider" />
                            <span className="rd-rating-count">{restaurant.ratingCount || "1000"}+ Ratings</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body: Sidebar + Menu ── */}
            <div className="rd-body">
                {/* Sidebar */}
                <aside className="rd-sidebar">
                    <div className="rd-sidebar-title">Categories</div>
                    <div className="rd-sidebar-list">
                        {categories.map(catId => (
                            <div
                                key={catId}
                                className={`rd-sidebar-item ${activeCategory === catId ? "rd-sidebar-item--active" : ""}`}
                                onClick={() => scrollToCategory(catId)} // 👈 Now shows category inline, does NOT open new tab
                            >
                                {menuByCategory[catId].title}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Menu Area */}
                <main className="rd-main">
                    {/* Search + Filters */}
                    <div className="rd-controls">
                        <div className="rd-search-wrap">
                            <FaSearch size={14} color="#93959f" />
                            <input
                                type="text"
                                placeholder="Search for dishes..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="rd-search-input"
                            />
                        </div>
                        <div className="rd-filter-group">
                            <div className="rd-filter-item" onClick={() => { setIsVegOnly(!isVegOnly); setIsNonVegOnly(false); }}>
                                <div className="rd-type-square rd-type-square--veg">
                                    <FaCircle size={6} color="#1A8C34" />
                                </div>
                                <div className={`rd-switch ${isVegOnly ? "rd-switch--on" : ""}`}>
                                    <div className="rd-switch-ball" />
                                </div>
                                <span className="rd-filter-label">Veg</span>
                            </div>
                            <div className="rd-filter-item" onClick={() => { setIsNonVegOnly(!isNonVegOnly); setIsVegOnly(false); }}>
                                <div className="rd-type-square rd-type-square--nonveg">
                                    <FaCircle size={6} color="#D32F2F" />
                                </div>
                                <div className={`rd-switch ${isNonVegOnly ? "rd-switch--on rd-switch--nonveg" : ""}`}>
                                    <div className="rd-switch-ball" />
                                </div>
                                <span className="rd-filter-label">Non-Veg</span>
                            </div>
                        </div>
                    </div>

                    {/* Active Category Section (only one at a time) */}
                    {activeCatData && (
                        <section
                            key={activeCategory}
                            ref={el => (categoryRefs.current[activeCategory] = el)}
                            className="rd-category-section"
                        >
                            <h2 className="rd-category-title">
                                {activeCatData.title}{" "}
                                <span className="rd-category-count">({filteredItems.length})</span>
                            </h2>
                            <div className="rd-items-list">
                                {visibleItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="rd-item-card"
                                        onClick={() => navigate(`/item/${item.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="rd-item-info">
                                            <div className={`rd-type-square ${item.isVeg ? "rd-type-square--veg" : "rd-type-square--nonveg"}`}>
                                                <FaCircle size={6} color={item.isVeg ? "#1A8C34" : "#D32F2F"} />
                                            </div>
                                            {item.isBestseller && (
                                                <div className="rd-bestseller">
                                                    <FaStar size={9} /> BESTSELLER
                                                </div>
                                            )}
                                            <h3 className="rd-item-name">{item.name}</h3>
                                            <div className="rd-item-price">₹{item.price}</div>
                                            <p className="rd-item-desc">{item.description}</p>
                                        </div>
                                        <div className="rd-item-visual">
                                            <div className="rd-img-wrap">
                                                <img src={item.image} alt={item.name} className="rd-img" />
                                            </div>
                                            <div className="rd-add-wrap">
                                                {getItemQuantity(item.id) > 0 ? (
                                                    <div className="rd-qty">
                                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}>−</button>
                                                        <span>{getItemQuantity(item.id)}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}>+</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="rd-add-btn"
                                                        onClick={(e) => { e.stopPropagation(); addToCart(item, { id: restaurant.id, name: restaurant.name, image: restaurant.image }); }}
                                                    >
                                                        ADD <span style={{ fontSize: "16px" }}>+</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* View All button */}
                                {hasMore && (
                                    <div className="rd-view-all-wrap">
                                        <button
                                            className="view-more-btn my-3"
                                            onClick={() => navigate(`/category/${activeCategory}`)} // 👈 Navigates to full category page
                                        >
                                            View All
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Empty state if no items after filtering */}
                    {activeCatData && filteredItems.length === 0 && (
                        <div className="rd-empty">No items match your filters.</div>
                    )}

                    {/* Fallback if no categories exist for this restaurant */}
                    {!activeCatData && getAllItems().length === 0 && (
                        <div className="rd-empty">No items found for this restaurant.</div>
                    )}
                </main>
            </div>

            {/* Floating Cart Bar */}
            {itemsCount > 0 && showCartBar && (
                <div className="rd-cart-bar" onClick={() => navigate('/cart')}>
                    <span className="rd-cart-info">{itemsCount} {itemsCount === 1 ? "ITEM" : "ITEMS"} | ₹{cartTotal}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="rd-cart-right">
                            <span>VIEW CART</span>
                            <FaShoppingBag size={15} />
                        </div>
                        <button
                            className="rd-cart-close"
                            onClick={(e) => { e.stopPropagation(); setShowCartBar(false); }}
                            aria-label="Close cart bar"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDetails;