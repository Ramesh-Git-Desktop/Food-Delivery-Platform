import React, { useState, useMemo, useRef, useEffect } from "react";
import "../CSS/RestaurantManagement.css";

/* ─── Static seed data enriched with full owner/restaurant details ─── */
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
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop",
        offer: "Buy 1 Get 1 Free",
        deliveryTime: "20–30 min",
        // owner
        ownerName: "James Miller",
        email: "james@burgerking.com",
        phone: "9123456780",
        // restaurant details
        restaurantAddress: "123 Main St",
        restaurantCity: "New York",
        restaurantState: "New York",
        restaurantPincode: "10001",
        restaurantPhone: "011-12345678",
        openingTime: "09:00",
        closingTime: "23:00",
        deliveryRadius: 8,
        avgDeliveryTime: 25,
        menu: [
            {
                category: "Burgers",
                items: [
                    { name: "Whopper", price: 12, description: "Classic flame-grilled beef burger", isVeg: false },
                    { name: "Veggie Burger", price: 10, description: "Crispy vegetable patty", isVeg: true },
                ],
            },
            {
                category: "Sides",
                items: [
                    { name: "French Fries", price: 4, description: "Golden crispy fries", isVeg: true },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop",
        offer: "10% off on weekdays",
        deliveryTime: "15–25 min",
        ownerName: "Priya Nair",
        email: "priya@greenleaf.com",
        phone: "9876012345",
        restaurantAddress: "456 Elm Street",
        restaurantCity: "Los Angeles",
        restaurantState: "California",
        restaurantPincode: "90001",
        restaurantPhone: "021-87654321",
        openingTime: "08:00",
        closingTime: "22:00",
        deliveryRadius: 6,
        avgDeliveryTime: 20,
        menu: [
            {
                category: "Salads",
                items: [
                    { name: "Caesar Salad", price: 11, description: "Crisp romaine with house dressing", isVeg: true },
                    { name: "Buddha Bowl", price: 14, description: "Quinoa, roasted veggies & tahini", isVeg: true },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=120&h=120&fit=crop",
        offer: "",
        deliveryTime: "30–40 min",
        ownerName: "Marco Rossi",
        email: "marco@pastahouse.com",
        phone: "9001122334",
        restaurantAddress: "789 Oak Avenue",
        restaurantCity: "Houston",
        restaurantState: "Texas",
        restaurantPincode: "77001",
        restaurantPhone: "031-11223344",
        openingTime: "11:00",
        closingTime: "22:00",
        deliveryRadius: 5,
        avgDeliveryTime: 35,
        menu: [
            {
                category: "Pasta",
                items: [
                    { name: "Spaghetti Carbonara", price: 16, description: "Creamy egg sauce, pancetta", isVeg: false },
                    { name: "Penne Arrabbiata", price: 13, description: "Spicy tomato sauce", isVeg: true },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=120&h=120&fit=crop",
        offer: "Free miso soup",
        deliveryTime: "25–35 min",
        ownerName: "Kenji Tanaka",
        email: "kenji@sushimaster.com",
        phone: "9234567890",
        restaurantAddress: "210 Pine Street",
        restaurantCity: "Seattle",
        restaurantState: "Washington",
        restaurantPincode: "98101",
        restaurantPhone: "041-23456789",
        openingTime: "12:00",
        closingTime: "23:00",
        deliveryRadius: 7,
        avgDeliveryTime: 30,
        menu: [
            {
                category: "Rolls",
                items: [
                    { name: "Dragon Roll", price: 18, description: "Shrimp tempura, avocado, eel", isVeg: false },
                    { name: "Avocado Roll", price: 10, description: "Fresh avocado & cucumber", isVeg: true },
                ],
            },
            {
                category: "Nigiri",
                items: [
                    { name: "Salmon Nigiri", price: 14, description: "Fresh Atlantic salmon", isVeg: false },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=120&h=120&fit=crop",
        offer: "20% off above $30",
        deliveryTime: "20–35 min",
        ownerName: "Sofia Conti",
        email: "sofia@pizzaexpress.com",
        phone: "9345678901",
        restaurantAddress: "555 Maple Road",
        restaurantCity: "Chicago",
        restaurantState: "Illinois",
        restaurantPincode: "60601",
        restaurantPhone: "051-34567890",
        openingTime: "11:00",
        closingTime: "23:30",
        deliveryRadius: 9,
        avgDeliveryTime: 28,
        menu: [
            {
                category: "Pizzas",
                items: [
                    { name: "Margherita", price: 14, description: "Classic tomato & mozzarella", isVeg: true },
                    { name: "Pepperoni", price: 17, description: "Rich tomato, pepperoni slices", isVeg: false },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=120&h=120&fit=crop",
        offer: "Happy Hour 3–5 PM",
        deliveryTime: "15–25 min",
        ownerName: "Carlos Mendez",
        email: "carlos@tacobell.com",
        phone: "9456789012",
        restaurantAddress: "900 Birch Lane",
        restaurantCity: "Dallas",
        restaurantState: "Texas",
        restaurantPincode: "75201",
        restaurantPhone: "061-45678901",
        openingTime: "10:00",
        closingTime: "00:00",
        deliveryRadius: 10,
        avgDeliveryTime: 20,
        menu: [
            {
                category: "Tacos",
                items: [
                    { name: "Crunchy Taco", price: 3, description: "Seasoned beef in a crunchy shell", isVeg: false },
                    { name: "Bean Taco", price: 2.5, description: "Refried beans, cheese & lettuce", isVeg: true },
                ],
            },
            {
                category: "Burritos",
                items: [
                    { name: "Beef Burrito", price: 6, description: "Grilled beef, rice & salsa", isVeg: false },
                ],
            },
        ],
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
        image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=120&h=120&fit=crop",
        offer: "Free spring rolls on $25+",
        deliveryTime: "30–45 min",
        ownerName: "Mei Lin",
        email: "mei@chinagarden.com",
        phone: "9567890123",
        restaurantAddress: "11 Dragon Boulevard",
        restaurantCity: "San Francisco",
        restaurantState: "California",
        restaurantPincode: "94102",
        restaurantPhone: "071-56789012",
        openingTime: "11:30",
        closingTime: "22:30",
        deliveryRadius: 6,
        avgDeliveryTime: 35,
        menu: [
            {
                category: "Starters",
                items: [
                    { name: "Spring Rolls", price: 7, description: "Crispy vegetable rolls", isVeg: true },
                    { name: "Dumplings", price: 9, description: "Steamed pork & ginger dumplings", isVeg: false },
                ],
            },
            {
                category: "Mains",
                items: [
                    { name: "Kung Pao Chicken", price: 15, description: "Spicy stir-fried chicken with peanuts", isVeg: false },
                    { name: "Tofu Fried Rice", price: 12, description: "Wok-tossed rice with tofu & veggies", isVeg: true },
                ],
            },
        ],
    },
];

const ITEMS_PER_PAGE = 5;
const ALL_CUISINES = [...new Set(INITIAL_RESTAURANTS.flatMap((r) => r.cuisine))].sort();

function formatRevenue(n) {
    return "$" + n.toLocaleString();
}

/* ─── Restaurant Avatar ─── */
function RestaurantAvatar({ restaurant: r, size = 42 }) {
    const [imgError, setImgError] = useState(false);
    const style = { width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden" };
    if (r.image && !imgError) {
        return (
            <div style={style}>
                <img src={r.image} alt={r.name} onError={() => setImgError(true)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
        );
    }
    return (
        <div className="rest-avatar" style={{ background: r.color, width: size, height: size, fontSize: size * 0.45 }}>
            {r.emoji}
        </div>
    );
}

/* ─── Toggle ─── */
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
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="action-wrap" ref={ref}>
            <button className="action-btn" onClick={() => setOpen((p) => !p)} title="More actions">⋮</button>
            {open && (
                <div className="action-menu">
                    <button className="view-item" onClick={() => { onView(); setOpen(false); }}>
                        <span className="menu-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a6cf7" strokeWidth="2.2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                            </svg>
                        </span>View
                    </button>
                    <button className="edit-item" onClick={() => { onEdit(); setOpen(false); }}>
                        <span className="menu-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </span>Edit
                    </button>
                    <div className="action-menu-divider" />
                    <button className="danger" onClick={() => { onDelete(); setOpen(false); }}>
                        <span className="menu-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d63b2f" strokeWidth="2.2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        </span>Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─── Detail Page (full page view when clicking a restaurant) ─── */
function RestaurantDetailPage({ restaurant: r, onBack, onEdit }) {
    const [activeTab, setActiveTab] = useState("overview");

    const InfoRow = ({ label, value }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
            <span style={{ fontSize: "0.92rem", color: "var(--text-primary)", fontWeight: 500 }}>{value || "—"}</span>
        </div>
    );

    return (
        <div className="rm-page">
            {/* Back bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button
                    onClick={onBack}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, background: "var(--card-bg)",
                        border: "1px solid var(--border)", borderRadius: 8, padding: "7px 14px",
                        cursor: "pointer", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600,
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back to Restaurants
                </button>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    Restaurant Management &rsaquo; <strong>{r.name}</strong>
                </span>
            </div>

            {/* Hero card */}
            <div className="stat-card" style={{ marginBottom: 20, padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
                    <RestaurantAvatar restaurant={r} size={72} />
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 800 }}>{r.name}</h2>
                            <span className={`view-status-badge ${r.active ? "active" : "inactive"}`}>
                                {r.active ? "● Active" : "● Inactive"}
                            </span>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 6 }}>ID: #{r.id}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {r.restaurantAddress}, {r.restaurantCity}, {r.restaurantState} – {r.restaurantPincode}
                        </div>
                        <div className="tags-cell">
                            {r.cuisine.map((c) => <span key={c} className="tag">{c}</span>)}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginLeft: "auto", flexShrink: 0 }}>
                        <button
                            onClick={onEdit}
                            style={{
                                padding: "8px 18px", borderRadius: 8, border: "1px solid var(--border)",
                                background: "var(--card-bg)", cursor: "pointer", fontWeight: 600,
                                fontSize: "0.85rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6,
                            }}
                        >
                            ✏️ Edit
                        </button>
                    </div>
                </div>

                {/* Quick stats strip */}
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                    {[
                        { label: "Rating", value: `★ ${r.rating.toFixed(1)} (${r.reviews} reviews)`, color: "#f5c842" },
                        { label: "Revenue", value: formatRevenue(r.revenue) + "/mo", color: "var(--accent)" },
                        { label: "Delivery Time", value: r.deliveryTime, color: "var(--text-primary)" },
                        { label: "Delivery Radius", value: `${r.deliveryRadius} km`, color: "var(--text-primary)" },
                        { label: "Hours", value: `${r.openingTime} – ${r.closingTime}`, color: "var(--text-primary)" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span style={{ fontSize: "0.73rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                            <span style={{ fontSize: "0.9rem", fontWeight: 700, color }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 18, borderBottom: "2px solid var(--border)" }}>
                {["overview", "menu", "documents"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "8px 20px", border: "none", background: "none", cursor: "pointer",
                            fontWeight: 700, fontSize: "0.88rem", textTransform: "capitalize",
                            color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
                            borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                            marginBottom: -2,
                        }}
                    >
                        {tab === "overview" ? "🏠 Overview" : tab === "menu" ? "🍽️ Menu" : "📄 Documents"}
                    </button>
                ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {/* Owner details */}
                    <div className="stat-card" style={{ padding: "18px 20px" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.88rem", marginBottom: 8, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            👤 Owner Details
                        </div>
                        <InfoRow label="Owner Name" value={r.ownerName} />
                        <InfoRow label="Email" value={r.email} />
                        <InfoRow label="Phone" value={r.phone} />
                    </div>

                    {/* Restaurant details */}
                    <div className="stat-card" style={{ padding: "18px 20px" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.88rem", marginBottom: 8, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            🏪 Restaurant Details
                        </div>
                        <InfoRow label="Restaurant Phone" value={r.restaurantPhone} />
                        <InfoRow label="City" value={r.restaurantCity} />
                        <InfoRow label="State" value={r.restaurantState} />
                        <InfoRow label="Pincode" value={r.restaurantPincode} />
                    </div>

                    {/* Operational details */}
                    <div className="stat-card" style={{ padding: "18px 20px" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.88rem", marginBottom: 8, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            ⚙️ Operational Info
                        </div>
                        <InfoRow label="Opening Time" value={r.openingTime} />
                        <InfoRow label="Closing Time" value={r.closingTime} />
                        <InfoRow label="Avg Delivery Time" value={`${r.avgDeliveryTime} mins`} />
                        <InfoRow label="Delivery Radius" value={`${r.deliveryRadius} km`} />
                        {r.offer && <InfoRow label="Current Offer" value={r.offer} />}
                    </div>
                </div>
            )}

            {/* Tab: Menu */}
            {activeTab === "menu" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(!r.menu || r.menu.length === 0) ? (
                        <div className="empty-state"><span style={{ fontSize: "2rem" }}>🍽️</span><p>No menu items added yet.</p></div>
                    ) : (
                        r.menu.map((cat) => (
                            <div key={cat.category} className="stat-card" style={{ padding: "18px 20px" }}>
                                <div style={{ fontWeight: 800, fontSize: "1rem", marginBottom: 12, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ background: "var(--accent)", color: "#fff", borderRadius: 6, padding: "2px 10px", fontSize: "0.78rem" }}>{cat.category}</span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{cat.items.length} item{cat.items.length !== 1 ? "s" : ""}</span>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {cat.items.map((item) => (
                                        <div key={item.name} style={{
                                            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                            padding: "10px 12px", background: "var(--bg)", borderRadius: 8,
                                            border: "1px solid var(--border)",
                                        }}>
                                            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                                <span style={{
                                                    width: 12, height: 12, borderRadius: 2, marginTop: 4, flexShrink: 0,
                                                    border: `2px solid ${item.isVeg ? "#27ae60" : "#e74c3c"}`,
                                                    background: item.isVeg ? "#27ae60" : "#e74c3c",
                                                }} />
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>{item.name}</div>
                                                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>{item.description}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--accent)", whiteSpace: "nowrap" }}>
                                                ${item.price}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Documents */}
            {activeTab === "documents" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {[
                        { icon: "🪪", label: "FSSAI License", key: "fssaiLicense" },
                        { icon: "📋", label: "GST Certificate", key: "gstCertificate" },
                        { icon: "🪙", label: "PAN Card", key: "panCard" },
                        { icon: "🖼️", label: "Restaurant Logo", key: "restaurantLogo" },
                    ].map(({ icon, label, key }) => (
                        <div key={key} className="stat-card" style={{
                            padding: "20px", display: "flex", flexDirection: "column",
                            alignItems: "center", gap: 10, textAlign: "center",
                        }}>
                            <div style={{ fontSize: "2rem" }}>{icon}</div>
                            <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)" }}>{label}</div>
                            {r[key] ? (
                                <span style={{
                                    background: "#e6f9ee", color: "#27ae60", borderRadius: 6,
                                    padding: "3px 10px", fontSize: "0.75rem", fontWeight: 700,
                                }}>✓ Uploaded</span>
                            ) : (
                                <span style={{
                                    background: "var(--bg)", color: "var(--text-muted)", borderRadius: 6,
                                    padding: "3px 10px", fontSize: "0.75rem", fontWeight: 600,
                                    border: "1px dashed var(--border)",
                                }}>Not uploaded</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Edit/Add Modal ─── */
function RestaurantModal({ initial, onClose, onSave }) {
    const blank = {
        name: "", location: "", cuisine: "", revenue: "", active: true,
        offer: "", deliveryTime: "", image: "", emoji: "🍽️", color: "#888",
        rating: 0, reviews: 0,
    };
    const [form, setForm] = useState(
        initial
            ? { ...initial, cuisine: initial.cuisine.join(", "), revenue: String(initial.revenue), offer: initial.offer || "", deliveryTime: initial.deliveryTime || "", image: initial.image || "" }
            : blank,
    );
    const [imagePreview, setImagePreview] = useState(initial?.image || "");
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { setImagePreview(ev.target.result); setForm((f) => ({ ...f, image: ev.target.result })); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        if (!form.name.trim() || !form.location.trim()) return alert("Name and Location are required.");
        onSave({
            ...form,
            id: initial ? initial.id : Math.random().toString(36).slice(2, 8).toUpperCase(),
            cuisine: form.cuisine.split(",").map((s) => s.trim()).filter(Boolean),
            rating: initial ? initial.rating : 0,
            reviews: initial ? initial.reviews : 0,
            revenue: parseInt(form.revenue) || 0,
            active: typeof form.active === "boolean" ? form.active : form.active === "true",
        });
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <h2>{initial ? "Edit Restaurant" : "Add Restaurant"}</h2>
                <div className="form-grid">
                    <div className="form-field full">
                        <label>Restaurant Image</label>
                        {imagePreview ? (
                            <div className="img-preview-wrap">
                                <img src={imagePreview} alt="preview" className="img-preview" />
                                <button className="img-remove-btn" onClick={() => { setImagePreview(""); setForm((f) => ({ ...f, image: "" })); }}>✕ Remove</button>
                            </div>
                        ) : (
                            <label className="img-upload-label" htmlFor="rm-img-upload">
                                <span className="img-upload-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </span>
                                <span className="img-upload-text">Click to upload image</span>
                                <span className="img-upload-hint">PNG, JPG up to 5MB</span>
                                <input id="rm-img-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <div className="form-field full"><label>Restaurant Name *</label><input value={form.name} onChange={set("name")} placeholder="e.g. Spice Garden" /></div>
                    <div className="form-field full"><label>Location *</label><input value={form.location} onChange={set("location")} placeholder="e.g. 123 MG Road, Bangalore" /></div>
                    <div className="form-field full"><label>Cuisine (comma-separated)</label><input value={form.cuisine} onChange={set("cuisine")} placeholder="e.g. North Indian, Chinese" /></div>
                    <div className="form-field"><label>Monthly Revenue ($)</label><input type="number" min="0" value={form.revenue} onChange={set("revenue")} placeholder="15000" /></div>
                    <div className="form-field"><label>Status</label>
                        <select value={String(form.active)} onChange={set("active")}>
                            <option value="true">Active</option><option value="false">Inactive</option>
                        </select>
                    </div>
                    <div className="form-field"><label>Offer / Promo</label><input value={form.offer} onChange={set("offer")} placeholder="e.g. 20% off on weekends" /></div>
                    <div className="form-field"><label>Delivery Time</label><input value={form.deliveryTime} onChange={set("deliveryTime")} placeholder="e.g. 25–35 min" /></div>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-submit" onClick={handleSubmit}>{initial ? "Save Changes" : "Add Restaurant"}</button>
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
    const [modal, setModal] = useState(null);
    const [viewMode, setViewMode] = useState("list");
    const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    // NEW: detail page state
    const [detailRestaurant, setDetailRestaurant] = useState(null);

    const cuisineRef = useRef();
    const statusRef = useRef();

    useEffect(() => {
        const h = (e) => {
            if (cuisineRef.current && !cuisineRef.current.contains(e.target)) setShowCuisineDropdown(false);
            if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusDropdown(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const stats = useMemo(() => ({
        total: restaurants.length,
        active: restaurants.filter((r) => r.active).length,
        pending: restaurants.filter((r) => !r.active).length,
        revenue: restaurants.reduce((s, r) => s + r.revenue, 0),
    }), [restaurants]);

    const filtered = useMemo(() => {
        return restaurants.filter((r) => {
            const q = search.toLowerCase();
            const matchSearch = !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
            const matchCuisine = cuisineFilter === "All" || r.cuisine.includes(cuisineFilter);
            const matchStatus = statusFilter === "All" || (statusFilter === "Active" ? r.active : !r.active);
            return matchSearch && matchCuisine && matchStatus;
        });
    }, [restaurants, search, cuisineFilter, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    const currentPage = Math.min(page, totalPages);
    const pageData = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleToggle = (id) => setRestaurants((rs) => rs.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
    const handleDelete = (id) => { if (window.confirm("Delete this restaurant?")) setRestaurants((rs) => rs.filter((r) => r.id !== id)); };
    const handleSave = (data) => {
        if (modal === "add") setRestaurants((rs) => [data, ...rs]);
        else setRestaurants((rs) => rs.map((r) => (r.id === data.id ? data : r)));
        setModal(null);
        // Refresh detail page if the edited restaurant is currently shown
        if (detailRestaurant && detailRestaurant.id === data.id) setDetailRestaurant(data);
    };

    const revenueFormatted = stats.revenue >= 1000000
        ? `$${(stats.revenue / 1000000).toFixed(1)}M`
        : stats.revenue >= 1000 ? `$${(stats.revenue / 1000).toFixed(1)}K` : formatRevenue(stats.revenue);

    /* ─── Show Detail Page ─── */
    if (detailRestaurant) {
        return (
            <RestaurantDetailPage
                restaurant={detailRestaurant}
                onBack={() => setDetailRestaurant(null)}
                onEdit={() => setModal(detailRestaurant)}
            >
                {modal && (
                    <RestaurantModal
                        initial={modal === "add" ? null : modal}
                        onClose={() => setModal(null)}
                        onSave={handleSave}
                    />
                )}
            </RestaurantDetailPage>
        );
    }

    return (
        <div className="rm-page">
            {/* Header */}
            <div className="rm-header">
                <div className="rm-header-left">
                    <h1>Restaurant Management</h1>
                    <p>Manage your restaurant partners and their performance.</p>
                </div>
                <button className="btn-add" onClick={() => setModal("add")}>
                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> Add Restaurant
                </button>
            </div>

            {/* Stats */}
            <div className="rm-stats">
                <div className="stat-card"><div className="stat-top"><span className="stat-label">Total Restaurants</span><span className="stat-badge positive">+12%</span></div><div className="stat-value">{stats.total.toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-top"><span className="stat-label">Active Locations</span><span className="stat-badge positive">+5%</span></div><div className="stat-value">{stats.active.toLocaleString()}</div></div>
                <div className="stat-card"><div className="stat-top"><span className="stat-label">Pending Approval</span><span className="stat-badge negative">-2%</span></div><div className="stat-value">{stats.pending}</div></div>
                <div className="stat-card"><div className="stat-top"><span className="stat-label">Total Revenue</span><span className="stat-badge positive">+18%</span></div><div className="stat-value">{revenueFormatted}</div></div>
            </div>

            {/* Toolbar */}
            <div className="rm-toolbar">
                <div className="search-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input className="search-input" placeholder="Search by name, ID, or location..."
                        value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>

                <div style={{ position: "relative" }} ref={cuisineRef}>
                    <button className={`filter-btn ${cuisineFilter !== "All" ? "active" : ""}`} onClick={() => setShowCuisineDropdown((p) => !p)}>
                        Cuisine {cuisineFilter !== "All" ? `(${cuisineFilter})` : ""} <span>▾</span>
                    </button>
                    {showCuisineDropdown && (
                        <div className="action-menu" style={{ minWidth: 150 }}>
                            {["All", ...ALL_CUISINES].map((c) => (
                                <button key={c} style={{ fontWeight: cuisineFilter === c ? 700 : 400 }}
                                    onClick={() => { setCuisineFilter(c); setPage(1); setShowCuisineDropdown(false); }}>{c}</button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ position: "relative" }} ref={statusRef}>
                    <button className={`filter-btn ${statusFilter !== "All" ? "active" : ""}`} onClick={() => setShowStatusDropdown((p) => !p)}>
                        Status {statusFilter !== "All" ? `(${statusFilter})` : ""} <span style={{ fontSize: "0.7rem" }}>✕</span>
                    </button>
                    {showStatusDropdown && (
                        <div className="action-menu" style={{ minWidth: 130 }}>
                            {["All", "Active", "Inactive"].map((s) => (
                                <button key={s} style={{ fontWeight: statusFilter === s ? 700 : 400 }}
                                    onClick={() => { setStatusFilter(s); setPage(1); setShowStatusDropdown(false); }}>{s}</button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="view-toggle">
                    <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List view">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                    </button>
                    <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── LIST VIEW ── */}
            {viewMode === "list" ? (
                <div className="rm-table-wrap">
                    <table className="rm-table">
                        <thead>
                            <tr>
                                <th>Restaurant</th><th>Location</th><th>Cuisine</th>
                                <th>Offer</th><th>Rating</th><th>Revenue</th><th>Status</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr><td colSpan={8}><div className="empty-state"><span style={{ fontSize: "2rem" }}>🔍</span><p>No restaurants found.</p></div></td></tr>
                            ) : (
                                pageData.map((r) => (
                                    <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setDetailRestaurant(r)}>
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
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {r.location}
                                            </div>
                                        </td>
                                        <td data-label="Cuisine">
                                            <div className="tags-cell">{r.cuisine.map((c) => <span key={c} className="tag">{c}</span>)}</div>
                                        </td>
                                        <td data-label="Offer">
                                            {r.offer ? <span className="offer-badge"><span className="offer-icon">🏷</span>{r.offer}</span> : <span className="offer-none">—</span>}
                                        </td>
                                        <td data-label="Rating">
                                            <div className="rating-cell">
                                                <span className="star">★</span>
                                                <span className="rating-num">{r.rating.toFixed(1)}</span>
                                                <span className="rating-count">({r.reviews})</span>
                                            </div>
                                        </td>
                                        <td data-label="Revenue" className="revenue-cell">{formatRevenue(r.revenue)}</td>
                                        <td data-label="Status">
                                            <div className="toggle-wrap">
                                                <Toggle checked={r.active} onChange={(e) => { e.stopPropagation(); handleToggle(r.id); }} />
                                            </div>
                                        </td>
                                        <td data-label="Action" onClick={(e) => e.stopPropagation()}>
                                            <ActionMenu
                                                onView={() => setDetailRestaurant(r)}
                                                onEdit={() => setModal(r)}
                                                onDelete={() => handleDelete(r.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="rm-footer">
                        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries</span>
                        <div className="pagination">
                            <button className="page-btn nav" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button key={n} className={`page-btn ${n === currentPage ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                            ))}
                            <button className="page-btn nav" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── GRID VIEW ── */
                <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                        {pageData.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                                <span style={{ fontSize: "2rem" }}>🔍</span><p>No restaurants found.</p>
                            </div>
                        ) : (
                            pageData.map((r) => (
                                <div
                                    key={r.id}
                                    className="stat-card"
                                    style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
                                    onClick={() => setDetailRestaurant(r)}
                                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                                        <RestaurantAvatar restaurant={r} size={48} />
                                        <div>
                                            <strong style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>{r.name}</strong>
                                            <div className="rest-id" style={{ fontSize: "0.75rem" }}>#{r.id}</div>
                                        </div>
                                    </div>
                                    <div className="location-cell" style={{ marginBottom: 8, fontSize: "0.82rem" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {r.location}
                                    </div>
                                    <div className="tags-cell" style={{ marginBottom: 10 }}>
                                        {r.cuisine.map((c) => <span key={c} className="tag">{c}</span>)}
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div className="rating-cell"><span className="star">★</span><span className="rating-num">{r.rating.toFixed(1)}</span></div>
                                        <div className="revenue-cell" style={{ fontSize: "0.88rem" }}>{formatRevenue(r.revenue)}</div>
                                        <Toggle checked={r.active} onChange={(e) => { e.stopPropagation(); handleToggle(r.id); }} />
                                    </div>
                                    <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                                        <button className="action-btn" title="Edit" onClick={() => setModal(r)}>✏️</button>
                                        <button className="action-btn" title="Delete" onClick={() => handleDelete(r.id)}>🗑</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="rm-footer" style={{ background: "transparent", paddingLeft: 0, paddingRight: 0, marginTop: 12 }}>
                        <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries</span>
                        <div className="pagination">
                            <button className="page-btn nav" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button key={n} className={`page-btn ${n === currentPage ? "active" : ""}`} onClick={() => setPage(n)}>{n}</button>
                            ))}
                            <button className="page-btn nav" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>›</button>
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
        </div>
    );
}