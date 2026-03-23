import React, { useState } from "react";
import "../CSS/MenuEditor.css";
import { FiSearch, FiUpload, FiChevronDown } from "react-icons/fi";

import logo1 from "../assets/image/burgerlogo.jpg";
import logo2 from "../assets/image/pizzalogo.jpg";
import logo3 from "../assets/image/subwaylogo.jpg";
import logo4 from "../assets/image/tacologo.jpg";

import Doubleburger from "../assets/image/Doubleburger.jpg";
import Goldenfries from "../assets/image/Goldenfries.jpg";
import Spicywings from "../assets/image/Spicywings.jpg";
import Chocoshake from "../assets/image/Chocoshake.jpg";
import Chickencaesar from "../assets/image/Chickencaesar.jpg";
import Onionrings from "../assets/image/Onionrings.jpg";
import Vegpizza from "../assets/image/Vegpizza.avif";
import Coldcoffee from "../assets/image/Coldcoffee.avif";
import Cheesenuggets from "../assets/image/Cheesenuggets.webp";

export default function MenuEditor() {
    const [activeRestaurant, setActiveRestaurant] = useState(0);
    const [activeTab, setActiveTab] = useState("items");
    const [page, setPage] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const restaurants = [
        {
            name: "Burger King - Downtown",
            id: "BK-0042",
            items: 128,
            status: "open",
            logo: logo1,
        },
        {
            name: "Pizza Hut - Central",
            id: "PH-9921",
            items: 85,
            status: "busy",
            logo: logo2,
        },
        {
            name: "Subway - Westside",
            id: "SW-1102",
            items: 42,
            status: "open",
            logo: logo3,
        },
        {
            name: "Taco Bell - Plaza",
            id: "TB-3310",
            items: "Closed",
            status: "closed",
            logo: logo4,
        },
    ];

    const categories = ["All Categories", "Burgers", "Fries", "Drinks"];

    const [items, setItems] = useState([
        {
            id: 1,
            name: "Double Burger",
            category: "Burgers",
            desc: "Two flame-grilled beef,patties,tomatoes",
            price: 12.99,
            badge: "bestseller",
            img: Doubleburger,
            veg: false,
            active: true,
        },
        {
            id: 2,
            name: "Golden Fries",
            category: "Fries",
            desc: "Classic salted french fries, crispy and…",
            price: 4.99,
            img: Goldenfries,
            veg: true,
            active: true,
        },
        {
            id: 3,
            name: "Spicy Wings",
            category: "Burgers",
            desc: "Breaded and fried chicken wings tossed…",
            price: 8.49,
            img: Spicywings,
            veg: false,
            active: true,
        },
        {
            id: 4,
            name: "Choco Shake",
            category: "Drinks",
            desc: "Thick chocolate milkshake topped wit…",
            price: 5.5,
            badge: "outofstock",
            img: Chocoshake,
            veg: true,
            active: false,
        },
        {
            id: 5,
            name: "Chicken Caesar",
            category: "Burgers",
            desc: "Fresh romaine lettuce, grilled chicken breast,…",
            price: 10.99,
            badge: "new",
            img: Chickencaesar,
            veg: false,
            active: true,
        },
        {
            id: 6,
            name: "Onion Rings",
            category: "Fries",
            desc: "Golden battered onion rings served with ran…",
            price: 3.99,
            oldPrice: 4.99,
            badge: "discount",
            img: Onionrings,
            veg: true,
            active: true,
        },
        {
            id: 7,
            name: "Veg Supreme Pizza",
            category: "Burgers",
            desc: "Loaded with fresh vegetables and mozzarella cheese...",
            price: 14.99,
            badge: "bestseller",
            img: Vegpizza,
            veg: true,
            active: true,
        },
        {
            id: 8,
            name: "Cold Coffee",
            category: "Drinks",
            desc: "Chilled creamy coffee topped with whipped cream...",
            price: 6.49,
            badge: "new",
            img: Coldcoffee,
            veg: true,
            active: true,
        },
        {
            id: 9,
            name: "Cheese Nuggets",
            category: "Fries",
            desc: "Crispy golden nuggets filled with melted cheese...",
            price: 7.99,
            badge: "new",
            img: Cheesenuggets,
            veg: true,
            active: false,
        },
    ]);

    const toggleStatus = (id) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, active: !item.active } : item,
            ),
        );
    };

    const filteredItems =
        categoryFilter === "All Categories"
            ? items
            : items.filter((item) => item.category === categoryFilter);

    const itemsPerPage = 6;
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage,
    );

    return (
        <div className="layout">
            {/* SIDEBAR */}
            <div className="sidebar">
                <h3>Select Restaurant</h3>

                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input placeholder="Search by name or ID..." />
                </div>

                {restaurants.map((r, i) => (
                    <div
                        key={i}
                        className={`restaurant ${activeRestaurant === i ? "active" : ""}`}
                        onClick={() => setActiveRestaurant(i)}
                    >
                        <img src={r.logo} alt="logo" className="logo" />
                        <div className="res-info">
                            <h5>{r.name}</h5>
                            <p>
                                ID: #{r.id} •{" "}
                                {typeof r.items === "number" ? `${r.items} Items` : r.items}
                            </p>
                        </div>
                        <span className={`dot ${r.status}`}></span>
                    </div>
                ))}
            </div>

            {/* CONTENT */}
            <div className="content">
                {/* HEADER */}
                <div className="header-section">
                    <div>
                        <div className="breadcrumb">
                            <span className="bread-link">Restaurants</span>
                            <span className="bread-sep fw-bolder">›</span>
                            <span className="bread-current">
                                {restaurants[activeRestaurant].name}
                            </span>
                        </div>

                        <div className="title-row">
                            <h1>Menu Editor</h1>
                            <span className="live">LIVE</span>
                        </div>
                    </div>

                    <div className="header-buttons">
                        <button className="bulk-btn">
                            <FiUpload size={14} /> Bulk Export
                        </button>
                        <button className="add-btn">+ Add Item</button>
                    </div>
                </div>

                {/* TABS + FILTER */}
                <div className="tab-row">
                    <div className="tab-container">
                        {["categories", "items", "modifiers"].map((tab) => (
                            <button
                                key={tab}
                                className={`tab ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="filter-box">
                        <button
                            className="filter-btn"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            {categoryFilter} <FiChevronDown />
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown">
                                {categories.map((cat) => (
                                    <div
                                        key={cat}
                                        onClick={() => {
                                            setCategoryFilter(cat);
                                            setDropdownOpen(false);
                                            setPage(1);
                                        }}
                                    >
                                        {cat}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ITEMS */}
                {activeTab === "items" && (
                    <>
                        <div className="card-grid">
                            {currentItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`card ${!item.active ? "inactive" : ""}`}
                                >
                                    {/* Veg / NonVeg Symbol */}
                                    <div className={`food-type ${item.veg ? "veg" : "nonveg"}`}>
                                        <span className="inner-shape"></span>
                                    </div>

                                    {/* Badge or Out of Stock */}
                                    {!item.active ? (
                                        <span className="badge outofstock">OUT OF STOCK</span>
                                    ) : (
                                        item.badge && (
                                            <span className={`badge ${item.badge}`}>
                                                {item.badge === "discount"
                                                    ? "-20%"
                                                    : item.badge.toUpperCase()}
                                            </span>
                                        )
                                    )}

                                    {/* Image Wrapper with Fixed Height */}
                                    <div className="image-wrapper">
                                        <img src={item.img} alt={item.name} />
                                    </div>

                                    <h4>{item.name}</h4>
                                    <p>{item.desc}</p>

                                    <div className="divider"></div>

                                    <div className="bottom">
                                        <div>
                                            <span className="price">${item.price}</span>
                                            {item.oldPrice && (
                                                <span className="old">${item.oldPrice}</span>
                                            )}
                                        </div>

                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={item.active}
                                                onChange={() => toggleStatus(item.id)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        <div className="pagination right">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                {page} / {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}

                {/* CATEGORIES */}
                {activeTab === "categories" && (
                    <div className="info-grid">
                        {categories.slice(1).map((cat) => (
                            <div key={cat} className="info-card">
                                <h4>{cat}</h4>
                                <p>Manage all items under {cat}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* MODIFIERS */}
                {activeTab === "modifiers" && (
                    <div className="info-grid">
                        {["Extra Cheese", "Add Sauce", "Spicy Level"].map((mod) => (
                            <div key={mod} className="info-card">
                                <h4>{mod}</h4>
                                <p>Optional customization for menu items</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
