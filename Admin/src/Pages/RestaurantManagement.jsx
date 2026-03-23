import React, { useState, useMemo, useRef, useEffect } from "react";
import "../CSS/RestaurantManagement.css";

/* ─── Static seed data with Unsplash images ─── */
const INITIAL_RESTAURANTS = [
    {
        id: "BK-1024",
        name: "Burger King",
        location: "123 Main St, NY",
        cuisine: ["Fast Food", "Burgers"],
        rating: 4.5,
        reviews: 120,
        revenue: 15200,
        active: true,
        emoji: "🍔",
        color: "#c0392b",
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop",
        offer: "Buy 1 Get 1 Free",
        deliveryTime: "20–30 min",
    },
    {
        id: "GL-8832",
        name: "Green Leaf",
        location: "456 Elm St, CA",
        cuisine: ["Vegan", "Healthy"],
        rating: 4.9,
        reviews: 850,
        revenue: 8400,
        active: true,
        emoji: "🥗",
        color: "#27ae60",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop",
        offer: "10% off on weekdays",
        deliveryTime: "15–25 min",
    },
    {
        id: "PH-5590",
        name: "Pasta House",
        location: "789 Oak Ave, TX",
        cuisine: ["Italian"],
        rating: 3.8,
        reviews: 45,
        revenue: 5100,
        active: false,
        emoji: "🍝",
        color: "#5d4e75",
        image:
            "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=120&h=120&fit=crop",
        offer: "",
        deliveryTime: "30–40 min",
    },
    {
        id: "SM-2001",
        name: "Sushi Master",
        location: "210 Pine St, WA",
        cuisine: ["Japanese", "Seafood"],
        rating: 4.7,
        reviews: 320,
        revenue: 19450,
        active: true,
        emoji: "🍣",
        color: "#2c3e50",
        image:
            "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=120&h=120&fit=crop",
        offer: "Free miso soup",
        deliveryTime: "25–35 min",
    },
    {
        id: "PE-4112",
        name: "Pizza Express",
        location: "555 Maple Rd, IL",
        cuisine: ["Italian", "Fast Food"],
        rating: 4.2,
        reviews: 210,
        revenue: 11800,
        active: true,
        emoji: "🍕",
        color: "#7f8c8d",
        image:
            "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=120&h=120&fit=crop",
        offer: "20% off above $30",
        deliveryTime: "20–35 min",
    },
    {
        id: "TB-3301",
        name: "Taco Bell",
        location: "900 Birch Ln, TX",
        cuisine: ["Mexican", "Fast Food"],
        rating: 4.0,
        reviews: 178,
        revenue: 9300,
        active: true,
        emoji: "🌮",
        color: "#8e44ad",
        image:
            "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&h=120&fit=crop",
        offer: "Happy Hour 3–5 PM",
        deliveryTime: "15–25 min",
    },
    {
        id: "CN-7705",
        name: "China Garden",
        location: "11 Dragon Blvd, CA",
        cuisine: ["Chinese"],
        rating: 4.6,
        reviews: 540,
        revenue: 14600,
        active: true,
        emoji: "🥡",
        color: "#e74c3c",
        image:
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=120&h=120&fit=crop",
        offer: "Free spring rolls on $25+",
        deliveryTime: "30–45 min",
    },
];

const ITEMS_PER_PAGE = 5;

const ALL_CUISINES = [
    ...new Set(INITIAL_RESTAURANTS.flatMap((r) => r.cuisine)),
].sort();

function formatRevenue(n) {
    return "$" + n.toLocaleString();
}

/* ─── Restaurant Avatar: shows image if available, else colored emoji ─── */
function RestaurantAvatar({ restaurant: r, size = 42 }) {
    const [imgError, setImgError] = useState(false);
    const style = {
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        overflow: "hidden",
    };

    if (r.image && !imgError) {
        return (
            <div style={style}>
                <img
                    src={r.image}
                    alt={r.name}
                    onError={() => setImgError(true)}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </div>
        );
    }
    return (
        <div
            className="rest-avatar"
            style={{
                background: r.color,
                width: size,
                height: size,
                fontSize: size * 0.45,
            }}
        >
            {r.emoji}
        </div>
    );
}

/* ─── Toggle component ─── */
function Toggle({ checked, onChange }) {
    return (
        <label className="toggle">
            <input type="checkbox" checked={checked} onChange={onChange} />
            <span className="toggle-slider" />
            <span className="toggle-check">✓</span>
        </label>
    );
}

/* ─── Action Menu ─── */
function ActionMenu({ onView, onEdit, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="action-wrap" ref={ref}>
            <button
                className="action-btn"
                onClick={() => setOpen((p) => !p)}
                title="More actions"
            >
                ⋮
            </button>
            {open && (
                <div className="action-menu">
                    <button
                        className="view-item"
                        onClick={() => {
                            onView();
                            setOpen(false);
                        }}
                    >
                        <span className="menu-icon">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#4a6cf7"
                                strokeWidth="2.2"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>
                        View
                    </button>
                    <button
                        className="edit-item"
                        onClick={() => {
                            onEdit();
                            setOpen(false);
                        }}
                    >
                        <span className="menu-icon">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f5a623"
                                strokeWidth="2.2"
                            >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </span>
                        Edit
                    </button>
                    <div className="action-menu-divider" />
                    <button
                        className="danger"
                        onClick={() => {
                            onDelete();
                            setOpen(false);
                        }}
                    >
                        <span className="menu-icon">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#d63b2f"
                                strokeWidth="2.2"
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </span>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── View Modal ─── */
function ViewModal({ restaurant: r, onClose }) {
    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal view-modal">
                {/* Close button */}
                <button className="view-modal-close" onClick={onClose}>
                    ✕
                </button>

                {/* Header */}
                <div className="view-modal-header">
                    <RestaurantAvatar restaurant={r} size={56} />
                    <div>
                        <h2 className="view-modal-name">{r.name}</h2>
                        <span className="rest-id" style={{ fontSize: "0.85rem" }}>
                            ID: #{r.id}
                        </span>
                    </div>
                    <span
                        className={`view-status-badge ${r.active ? "active" : "inactive"}`}
                    >
                        {r.active ? "● Active" : "● Inactive"}
                    </span>
                </div>

                <div className="view-divider" />

                {/* Details grid */}
                <div className="view-details-grid">
                    <div className="view-detail-item">
                        <span className="view-detail-icon">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f5a623"
                                strokeWidth="2.2"
                            >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                        </span>
                        <div>
                            <span className="view-detail-label">Location</span>
                            <span className="view-detail-value">{r.location}</span>
                        </div>
                    </div>

                    <div className="view-detail-item">
                        <span className="view-detail-icon">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f5a623"
                                strokeWidth="2.2"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                                <line x1="9" y1="9" x2="9.01" y2="9" />
                                <line x1="15" y1="9" x2="15.01" y2="9" />
                            </svg>
                        </span>
                        <div>
                            <span className="view-detail-label">Cuisine</span>
                            <div className="tags-cell" style={{ marginTop: 4 }}>
                                {r.cuisine.map((c) => (
                                    <span key={c} className="tag">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="view-detail-item">
                        <span className="view-detail-icon">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f5a623"
                                strokeWidth="2.2"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </span>
                        <div>
                            <span className="view-detail-label">Rating</span>
                            <span className="view-detail-value">
                                <span style={{ color: "#f5c842", marginRight: 4 }}>★</span>
                                {r.rating.toFixed(1)}{" "}
                                <span
                                    style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}
                                >
                                    ({r.reviews} reviews)
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="view-detail-item">
                        <span className="view-detail-icon">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#f5a623"
                                strokeWidth="2.2"
                            >
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </span>
                        <div>
                            <span className="view-detail-label">Monthly Revenue</span>
                            <span
                                className="view-detail-value"
                                style={{
                                    fontFamily: "'Sora',sans-serif",
                                    fontWeight: 800,
                                    fontSize: "1.1rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {formatRevenue(r.revenue)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: 24 }}>
                    <button className="btn-cancel" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Add / Edit Modal ─── */
function RestaurantModal({ initial, onClose, onSave }) {
    const blank = {
        name: "",
        location: "",
        cuisine: "",
        revenue: "",
        active: true,
        offer: "",
        deliveryTime: "",
        image: "",
        emoji: "🍽️",
        color: "#888",
        rating: 0,
        reviews: 0,
    };
    const [form, setForm] = useState(
        initial
            ? {
                ...initial,
                cuisine: initial.cuisine.join(", "),
                revenue: String(initial.revenue),
                offer: initial.offer || "",
                deliveryTime: initial.deliveryTime || "",
                image: initial.image || "",
            }
            : blank,
    );
    const [imagePreview, setImagePreview] = useState(initial?.image || "");

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImagePreview(ev.target.result);
            setForm((f) => ({ ...f, image: ev.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.location.trim())
            return alert("Name and Location are required.");
        onSave({
            ...form,
            id: initial
                ? initial.id
                : Math.random().toString(36).slice(2, 8).toUpperCase(),
            cuisine: form.cuisine
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            rating: initial ? initial.rating : 0,
            reviews: initial ? initial.reviews : 0,
            revenue: parseInt(form.revenue) || 0,
            active:
                typeof form.active === "boolean" ? form.active : form.active === "true",
        });
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal">
                <h2>{initial ? "Edit Restaurant" : "Add Restaurant"}</h2>
                <div className="form-grid">
                    {/* Image Upload */}
                    <div className="form-field full">
                        <label>Restaurant Image</label>
                        {imagePreview ? (
                            <div className="img-preview-wrap">
                                <img src={imagePreview} alt="preview" className="img-preview" />
                                <button
                                    className="img-remove-btn"
                                    onClick={() => {
                                        setImagePreview("");
                                        setForm((f) => ({ ...f, image: "" }));
                                    }}
                                >
                                    ✕ Remove
                                </button>
                            </div>
                        ) : (
                            <label className="img-upload-label" htmlFor="rm-img-upload">
                                <span className="img-upload-icon">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#f5a623"
                                        strokeWidth="2"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="3" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </span>
                                <span className="img-upload-text">Click to upload image</span>
                                <span className="img-upload-hint">PNG, JPG up to 5MB</span>
                                <input
                                    id="rm-img-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    <div className="form-field full">
                        <label>Restaurant Name *</label>
                        <input
                            value={form.name}
                            onChange={set("name")}
                            placeholder="e.g. Burger King"
                        />
                    </div>
                    <div className="form-field full">
                        <label>Location *</label>
                        <input
                            value={form.location}
                            onChange={set("location")}
                            placeholder="e.g. 123 Main St, NY"
                        />
                    </div>
                    <div className="form-field full">
                        <label>Cuisine (comma-separated)</label>
                        <input
                            value={form.cuisine}
                            onChange={set("cuisine")}
                            placeholder="e.g. Fast Food, Burgers"
                        />
                    </div>
                    <div className="form-field">
                        <label>Monthly Revenue ($)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.revenue}
                            onChange={set("revenue")}
                            placeholder="15000"
                        />
                    </div>
                    <div className="form-field">
                        <label>Status</label>
                        <select value={String(form.active)} onChange={set("active")}>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Offer / Promo</label>
                        <input
                            value={form.offer}
                            onChange={set("offer")}
                            placeholder="e.g. 20% off on weekends"
                        />
                    </div>
                    <div className="form-field">
                        <label>Delivery Time</label>
                        <input
                            value={form.deliveryTime}
                            onChange={set("deliveryTime")}
                            placeholder="e.g. 25–35 min"
                        />
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn-submit" onClick={handleSubmit}>
                        {initial ? "Save Changes" : "Add Restaurant"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─── */
export default function RestaurantManagement() {
    const [restaurants, setRestaurants] = useState(INITIAL_RESTAURANTS);
    const [search, setSearch] = useState("");
    const [cuisineFilter, setCuisineFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null); // null | "add" | { restaurant }
    const [viewModal, setViewModal] = useState(null); // null | restaurant object
    const [viewMode, setViewMode] = useState("list");
    const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const cuisineRef = useRef();
    const statusRef = useRef();

    useEffect(() => {
        const h = (e) => {
            if (cuisineRef.current && !cuisineRef.current.contains(e.target))
                setShowCuisineDropdown(false);
            if (statusRef.current && !statusRef.current.contains(e.target))
                setShowStatusDropdown(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    /* Derived stats */
    const stats = useMemo(
        () => ({
            total: restaurants.length,
            active: restaurants.filter((r) => r.active).length,
            pending: restaurants.filter((r) => !r.active).length,
            revenue: restaurants.reduce((s, r) => s + r.revenue, 0),
        }),
        [restaurants],
    );

    /* Filtered list */
    const filtered = useMemo(() => {
        return restaurants.filter((r) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                r.name.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q) ||
                r.location.toLowerCase().includes(q);
            const matchCuisine =
                cuisineFilter === "All" || r.cuisine.includes(cuisineFilter);
            const matchStatus =
                statusFilter === "All" ||
                (statusFilter === "Active" ? r.active : !r.active);
            return matchSearch && matchCuisine && matchStatus;
        });
    }, [restaurants, search, cuisineFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handleToggle = (id) => {
        setRestaurants((rs) =>
            rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
        );
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this restaurant?")) {
            setRestaurants((rs) => rs.filter((r) => r.id !== id));
        }
    };

    const handleSave = (data) => {
        if (modal === "add") {
            setRestaurants((rs) => [data, ...rs]);
        } else {
            setRestaurants((rs) => rs.map((r) => (r.id === data.id ? data : r)));
        }
        setModal(null);
    };

    const revenueFormatted =
        stats.revenue >= 1000000
            ? `$${(stats.revenue / 1000000).toFixed(1)}M`
            : stats.revenue >= 1000
                ? `$${(stats.revenue / 1000).toFixed(1)}K`
                : formatRevenue(stats.revenue);

    return (
        <div className="rm-page">
            {/* Header */}
            <div className="rm-header">
                <div className="rm-header-left">
                    <h1>Restaurant Management</h1>
                    <p>Manage your restaurant partners and their performance.</p>
                </div>
                <button className="btn-add" onClick={() => setModal("add")}>
                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Add
                    Restaurant
                </button>
            </div>

            {/* Stats */}
            <div className="rm-stats">
                <div className="stat-card">
                    <div className="stat-top">
                        <span className="stat-label">Total Restaurants</span>
                        <span className="stat-badge positive">+12%</span>
                    </div>
                    <div className="stat-value">{stats.total.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-top">
                        <span className="stat-label">Active Locations</span>
                        <span className="stat-badge positive">+5%</span>
                    </div>
                    <div className="stat-value">{stats.active.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-top">
                        <span className="stat-label">Pending Approval</span>
                        <span className="stat-badge negative">-2%</span>
                    </div>
                    <div className="stat-value">{stats.pending}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-top">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-badge positive">+18%</span>
                    </div>
                    <div className="stat-value">{revenueFormatted}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="rm-toolbar">
                <div className="search-wrap">
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        className="search-input"
                        placeholder="Search by name, ID, or location..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                {/* Cuisine Filter */}
                <div style={{ position: "relative" }} ref={cuisineRef}>
                    <button
                        className={`filter-btn ${cuisineFilter !== "All" ? "active" : ""}`}
                        onClick={() => setShowCuisineDropdown((p) => !p)}
                    >
                        Cuisine {cuisineFilter !== "All" ? `(${cuisineFilter})` : ""}{" "}
                        <span>▾</span>
                    </button>
                    {showCuisineDropdown && (
                        <div className="action-menu" style={{ minWidth: 150 }}>
                            {["All", ...ALL_CUISINES].map((c) => (
                                <button
                                    key={c}
                                    style={{ fontWeight: cuisineFilter === c ? 700 : 400 }}
                                    onClick={() => {
                                        setCuisineFilter(c);
                                        setPage(1);
                                        setShowCuisineDropdown(false);
                                    }}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div style={{ position: "relative" }} ref={statusRef}>
                    <button
                        className={`filter-btn ${statusFilter !== "All" ? "active" : ""}`}
                        onClick={() => setShowStatusDropdown((p) => !p)}
                    >
                        Status {statusFilter !== "All" ? `(${statusFilter})` : ""}{" "}
                        <span style={{ fontSize: "0.7rem" }}>✕</span>
                    </button>
                    {showStatusDropdown && (
                        <div className="action-menu" style={{ minWidth: 130 }}>
                            {["All", "Active", "Inactive"].map((s) => (
                                <button
                                    key={s}
                                    style={{ fontWeight: statusFilter === s ? 700 : 400 }}
                                    onClick={() => {
                                        setStatusFilter(s);
                                        setPage(1);
                                        setShowStatusDropdown(false);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                        onClick={() => setViewMode("list")}
                        title="List view"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="8" y1="6" x2="21" y2="6" />
                            <line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" />
                            <line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </button>
                    <button
                        className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title="Grid view"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Table / Grid */}
            {viewMode === "list" ? (
                <div className="rm-table-wrap">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                <th>Restaurant</th>
                                <th>Location</th>
                                <th>Cuisine</th>
                                <th>Offer</th>
                                <th>Rating</th>
                                <th>Revenue</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <span style={{ fontSize: "2rem" }}>🔍</span>
                                            <p>No restaurants found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pageData.map((r) => (
                                    <tr key={r.id}>
                                        <td data-label="Restaurant">
                                            <div className="rest-cell">
                                                <RestaurantAvatar restaurant={r} size={42} />
                                                <div className="rest-info">
                                                    <strong>{r.name}</strong>
                                                    <span className="rest-id">ID: #{r.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Location">
                                            <div className="location-cell">
                                                <svg
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    style={{ flexShrink: 0, marginTop: 2 }}
                                                >
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {r.location}
                                            </div>
                                        </td>
                                        <td data-label="Cuisine">
                                            <div className="tags-cell">
                                                {r.cuisine.map((c) => (
                                                    <span key={c} className="tag">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td data-label="Offer">
                                            {r.offer ? (
                                                <span className="offer-badge">
                                                    <span className="offer-icon">🏷</span>
                                                    {r.offer}
                                                </span>
                                            ) : (
                                                <span className="offer-none">—</span>
                                            )}
                                        </td>
                                        <td data-label="Rating">
                                            <div className="rating-cell">
                                                <span className="star">★</span>
                                                <span className="rating-num">
                                                    {r.rating.toFixed(1)}
                                                </span>
                                                <span className="rating-count">({r.reviews})</span>
                                            </div>
                                        </td>
                                        <td data-label="Revenue" className="revenue-cell">
                                            {formatRevenue(r.revenue)}
                                        </td>
                                        <td data-label="Status">
                                            <div className="toggle-wrap">
                                                <Toggle
                                                    checked={r.active}
                                                    onChange={() => handleToggle(r.id)}
                                                />
                                            </div>
                                        </td>
                                        <td data-label="Action">
                                            <ActionMenu
                                                onView={() => setViewModal(r)}
                                                onEdit={() => setModal(r)}
                                                onDelete={() => handleDelete(r.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="rm-footer">
                        <span>
                            Showing{" "}
                            {filtered.length === 0
                                ? 0
                                : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                            to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                            {filtered.length} entries
                        </span>
                        <div className="pagination">
                            <button
                                className="page-btn nav"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    className={`page-btn ${n === currentPage ? "active" : ""}`}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="page-btn nav"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Grid view */
                <div>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                            gap: 16,
                        }}
                    >
                        {pageData.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                                <span style={{ fontSize: "2rem" }}>🔍</span>
                                <p>No restaurants found.</p>
                            </div>
                        ) : (
                            pageData.map((r) => (
                                <div
                                    key={r.id}
                                    className="stat-card"
                                    style={{ cursor: "default" }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            marginBottom: 10,
                                        }}
                                    >
                                        <RestaurantAvatar restaurant={r} size={48} />
                                        <div>
                                            <strong
                                                style={{
                                                    fontFamily: "'Sora',sans-serif",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {r.name}
                                            </strong>
                                            <div className="rest-id" style={{ fontSize: "0.75rem" }}>
                                                #{r.id}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="location-cell"
                                        style={{ marginBottom: 8, fontSize: "0.82rem" }}
                                    >
                                        <svg
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {r.location}
                                    </div>
                                    <div className="tags-cell" style={{ marginBottom: 10 }}>
                                        {r.cuisine.map((c) => (
                                            <span key={c} className="tag">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div className="rating-cell">
                                            <span className="star">★</span>
                                            <span className="rating-num">{r.rating.toFixed(1)}</span>
                                        </div>
                                        <div
                                            className="revenue-cell"
                                            style={{ fontSize: "0.88rem" }}
                                        >
                                            {formatRevenue(r.revenue)}
                                        </div>
                                        <Toggle
                                            checked={r.active}
                                            onChange={() => handleToggle(r.id)}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: 6,
                                            marginTop: 10,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            className="action-btn"
                                            title="Edit"
                                            onClick={() => setModal(r)}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="action-btn"
                                            title="Delete"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Footer pagination for grid */}
                    <div
                        className="rm-footer"
                        style={{
                            background: "transparent",
                            paddingLeft: 0,
                            paddingRight: 0,
                            marginTop: 12,
                        }}
                    >
                        <span>
                            Showing{" "}
                            {filtered.length === 0
                                ? 0
                                : (currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                            to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                            {filtered.length} entries
                        </span>
                        <div className="pagination">
                            <button
                                className="page-btn nav"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    className={`page-btn ${n === currentPage ? "active" : ""}`}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                            <button
                                className="page-btn nav"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit/Add Modal */}
            {modal && (
                <RestaurantModal
                    initial={modal === "add" ? null : modal}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}

            {/* View Modal */}
            {viewModal && (
                <ViewModal restaurant={viewModal} onClose={() => setViewModal(null)} />
            )}
        </div>
    );
}
