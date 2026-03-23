import { useState } from "react";
import "../CSS/CouponDetails.css";

/* ─────────────────────────────────────────
   Bar chart data (30 days)
───────────────────────────────────────── */
const BAR_DATA = [
    14, 8, 18, 6, 22, 10, 16, 12, 24, 9,
    20, 15, 11, 28, 7, 19, 13, 26, 8, 14,
    18, 10, 32, 16, 22, 12, 20, 38, 14, 18,
];

const BAR_COLORS = [
    "#d6cbb8", "#c8bfa8", "#d6cbb8", "#c8bfa8", "#d6cbb8",
    "#c8bfa8", "#d6cbb8", "#c8bfa8", "#d6cbb8", "#c8bfa8",
    "#d6cbb8", "#c8bfa8", "#d6cbb8", "#c8bfa8", "#c8bfa8",
    "#d6cbb8", "#c8bfa8", "#d6cbb8", "#c8bfa8", "#d6cbb8",
    "#c8bfa8", "#d6cbb8", "#e07b2a", "#c8bfa8", "#d6cbb8", // index 22 = amber peak
    "#c8bfa8", "#d6cbb8", "#c8bfa8", "#d6cbb8", "#c8bfa8",
];

const MAX_BAR = Math.max(...BAR_DATA);

/* ─────────────────────────────────────────
   Menu items
───────────────────────────────────────── */
const MENU_ITEMS = [
    { cat: "CATEGORY", name: "All\nAppetizers", emoji: "🥗", bg: "#c5b99a" },
    { cat: "SIGNATURE", name: "Signature\nRisottos", emoji: "🍝", bg: "#a89070" },
    { cat: "MAIN", name: "Truw e\nMains", emoji: "🍖", bg: "#7a6550" },
];

/* ─────────────────────────────────────────
   Redemption logic rules
───────────────────────────────────────── */
const LOGIC_RULES = [
    { title: "Minimum Spend", sub: "Order must exceed $50.00" },
    { title: "Weekly Availability", sub: "Valid only on Tuesdays &\nWednesdays" },
    { title: "Dine-in Only", sub: "Not applicable for takeaway or\ndelivery" },
    { title: "Usage Limit", sub: "Once per customer per visit" },
];

/* ─────────────────────────────────────────
   Recent redemptions
───────────────────────────────────────── */
const REDEMPTIONS = [
    { initials: "JD", name: "Julianne Deville", meta: "Table 12 · 2:14 PM", order: "$142.00 Order", saved: "-$28.40 Saved", avatarBg: "#5b8dee" },
    { initials: "MR", name: "Marcus Rossi", meta: "Table 04 · 1:55 PM", order: "$88.50 Order", saved: "-$17.70 Saved", avatarBg: "#7c6ea0" },
];

/* ─────────────────────────────────────────
   Calendar picker (reused from CouponsManagement)
───────────────────────────────────────── */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CalPicker({ value, onChange, placeholder }) {
    const [open, setOpen] = useState(false);
    const today = new Date();
    const parsed = value ? (() => { const [d, m, y] = value.split("/"); return new Date(+y, +m - 1, +d); })() : null;
    const [vy, setVY] = useState(parsed ? parsed.getFullYear() : today.getFullYear());
    const [vm, setVM] = useState(parsed ? parsed.getMonth() : today.getMonth());

    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDay = (y, m) => new Date(y, m, 1).getDay();
    const prevM = () => { if (vm === 0) { setVM(11); setVY(y => y - 1); } else setVM(m => m - 1); };
    const nextM = () => { if (vm === 11) { setVM(0); setVY(y => y + 1); } else setVM(m => m + 1); };

    const selDay = parsed && parsed.getFullYear() === vy && parsed.getMonth() === vm ? parsed.getDate() : null;
    const total = daysInMonth(vy, vm);
    const first = firstDay(vy, vm);
    const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

    return (
        <div style={{ position: "relative" }} onMouseLeave={() => { }}>
            <div
                className="cdx-modal-input"
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                onClick={() => setOpen(o => !o)}
            >
                <span style={{ color: value ? "inherit" : "#aaa" }}>{value || placeholder}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </div>
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
                    background: "#fff", border: "1px solid #e8e1cf", borderRadius: 14,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)", padding: 14, width: 230,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <button onClick={prevM} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" }}>&#8249;</button>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{MONTHS[vm]} {vy}</span>
                        <button onClick={nextM} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" }}>&#8250;</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                        {WDAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#bbb", padding: "3px 0" }}>{d}</div>)}
                        {cells.map((day, i) => (
                            <div key={i}
                                onClick={() => { if (!day) return; const dd = String(day).padStart(2, "0"), mm = String(vm + 1).padStart(2, "0"); onChange(`${dd}/${mm}/${vy}`); setOpen(false); }}
                                style={{
                                    textAlign: "center", fontSize: 12, padding: "5px 2px", borderRadius: 7, cursor: day ? "pointer" : "default",
                                    background: day === selDay ? "#e07b2a" : "none",
                                    color: day === selDay ? "#fff" : day ? "#222" : "transparent",
                                    fontWeight: day === selDay ? 700 : 400,
                                }}
                            >{day || ""}</div>
                        ))}
                    </div>
                    <div style={{ borderTop: "1px solid #e8e1cf", paddingTop: 8, marginTop: 6, textAlign: "center" }}>
                        <button onClick={() => { const t = new Date(); onChange(`${String(t.getDate()).padStart(2, "0")}/${String(t.getMonth() + 1).padStart(2, "0")}/${t.getFullYear()}`); setOpen(false); }}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#e07b2a", fontFamily: "inherit" }}>
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────
   Main CouponDetails component
───────────────────────────────────────── */
export default function CouponDetails({ coupon, onBack }) {
    /* Default data matching screenshot exactly */
    const defaultCoupon = {
        id: 1,
        name: "Get Flat 20% Off",
        code: "SAVOR20",
        discount: "20%",
        activeFrom: "Oct 12, 2023",
        activeTo: "Dec 31, 2024",
        limit: 50,
        used: 0,
        isActive: true,
        description: "20% off total order value for loyal patrons.",
        restaurant: "WOW momo",
    };

    const c = coupon || defaultCoupon;

    const [isActive, setIsActive] = useState(c.isActive);
    const [showEdit, setShowEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        name: c.name,
        discount: c.discount,
        activeFrom: c.activeFrom,
        activeTo: c.activeTo,
        limit: c.limit,
    });

    /* Stats */
    const stats = [
        { icon: "👥", value: "450", label: "TOTAL REDEEMED", badge: "+12%↗" },
        { icon: "💰", value: "$12,400", label: "REVENUE GENERATED", badge: "+5.2%↗" },
        { icon: "🛒", value: "$82.50", label: "AVG. ORDER VALUE", badge: null },
    ];

    return (
        <div className="cdx-root" style={{backgroundColor:"transparent"}}>
            <div className="cdx-page-card">

                {/* Breadcrumb */}
                <div className="cdx-breadcrumb">
                    <span onClick={onBack} style={{ cursor: "pointer" }}>Coupons</span>
                    <span className="cdx-bc-sep">›</span>
                    <span className="cdx-bc-cur">{c.code}</span>
                </div>

                {/* Top row: title + buttons */}
                <div className="cdx-top-row">
                    <h1 className="cdx-page-card-title">Coupon Details</h1>
                    <div className="cdx-top-actions">
                        <button className="cdx-btn-export">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Export Usage Report
                        </button>
                        <button className="cdx-btn-edit" onClick={() => setShowEdit(true)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit Coupon
                        </button>
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div className="row g-3">

                    {/* LEFT column */}
                    <div className="col-lg-7">

                        {/* Hero card */}
                        <div className="cdx-hero-card">
                            <div className="cdx-hero-top">
                                <span className="cdx-active-badge">
                                    <svg width="8" height="8" viewBox="0 0 8 8">
                                        <circle cx="4" cy="4" r="4" fill="currentColor" />
                                    </svg>
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                                <div className="cdx-hero-value-block">
                                    <div className="cdx-value-label">VALUE</div>
                                    <div className="cdx-value-num">
                                        {c.discount.replace("%", "")}<sup>%</sup>
                                    </div>
                                </div>
                            </div>

                            <div className="cdx-coupon-code">{c.code}</div>
                            <div className="cdx-coupon-desc">{c.description || "20% off total order value for loyal patrons."}</div>

                            <div className="cdx-hero-meta">
                                <div className="cdx-meta-dates">
                                    <div className="cdx-meta-date-item">
                                        <div className="cdx-meta-date-label">Created On</div>
                                        <div className="cdx-meta-date-val">{c.activeFrom}</div>
                                    </div>
                                    <div className="cdx-meta-date-item">
                                        <div className="cdx-meta-date-label">Expiry Date</div>
                                        <div className="cdx-meta-date-val">{c.activeTo}</div>
                                    </div>
                                </div>
                                <button
                                    className="cdx-btn-deactivate"
                                    onClick={() => setIsActive(a => !a)}
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                    </svg>
                                    {isActive ? "Deactivate Coupon" : "Activate Coupon"}
                                </button>
                            </div>
                        </div>

                        {/* Usage Velocity chart */}
                        <div className="cdx-chart-card">
                            <div className="cdx-chart-head">
                                <div>
                                    <div className="cdx-chart-title">Usage Velocity</div>
                                    <div className="cdx-chart-sub">Redemptions over the last 30 days</div>
                                </div>
                                <div className="cdx-chart-icon">🔥</div>
                            </div>

                            <div className="cdx-bars">
                                {BAR_DATA.map((v, i) => (
                                    <div key={i} className="cdx-bar-wrap">
                                        <div
                                            className="cdx-bar"
                                            style={{
                                                height: `${(v / MAX_BAR) * 100}%`,
                                                background: BAR_COLORS[i],
                                            }}
                                            title={`Day ${i + 1}: ${v} redemptions`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="cdx-chart-footer">
                                <span className="cdx-chart-foot-label">30 DAYS AGO</span>
                                <span className="cdx-chart-foot-label">TODAY</span>
                            </div>
                        </div>

                        {/* Menu Applicability */}
                        <div className="cdx-menu-card">
                            <div className="cdx-menu-head">
                                <div className="cdx-menu-title">Menu Applicability</div>
                                <button className="cdx-menu-manage">
                                    Manage Items
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                        <polyline points="15 3 21 3 21 9" />
                                        <line x1="10" y1="14" x2="21" y2="3" />
                                    </svg>
                                </button>
                            </div>
                            <div className="cdx-menu-sub">Specific items and categories linked to {c.code}</div>

                            <div className="cdx-menu-items">
                                {MENU_ITEMS.map((item, i) => (
                                    <div key={i} className="cdx-menu-item">
                                        <div className="cdx-menu-item-img" style={{ background: item.bg, fontSize: 22 }}>
                                            {item.emoji}
                                        </div>
                                        <div className="cdx-menu-item-cat">{item.cat}</div>
                                        <div className="cdx-menu-item-name">{item.name}</div>
                                    </div>
                                ))}
                                <button className="cdx-menu-add-btn">
                                    <div className="cdx-menu-add-circle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                    <span className="cdx-menu-add-label">Add More</span>
                                </button>
                            </div>
                        </div>

                        {/* Recent Redemptions */}
                        <div className="cdx-redemptions-title">Recent Redemptions</div>
                        {REDEMPTIONS.map((r, i) => (
                            <div key={i} className="cdx-redemption-row">
                                <div className="cdx-rr-avatar" style={{ background: r.avatarBg }}>
                                    {r.initials}
                                </div>
                                <div className="cdx-rr-info">
                                    <div className="cdx-rr-name">{r.name}</div>
                                    <div className="cdx-rr-meta">{r.meta}</div>
                                </div>
                                <div className="cdx-rr-right">
                                    <div className="cdx-rr-order">{r.order}</div>
                                    <div className="cdx-rr-saved">{r.saved}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT column */}
                    <div className="col-lg-5">

                        {/* Stat cards */}
                        {stats.map((s, i) => (
                            <div key={i} className="cdx-stat-card">
                                <div className="cdx-stat-top">
                                    <div className="cdx-stat-icon">{s.icon}</div>
                                    {s.badge && (
                                        <span className="cdx-stat-badge">
                                            {s.badge}
                                        </span>
                                    )}
                                </div>
                                <div className="cdx-stat-value">{s.value}</div>
                                <div className="cdx-stat-label">{s.label}</div>
                            </div>
                        ))}

                        {/* Redemption Logic */}
                        <div className="cdx-logic-card">
                            <div className="cdx-logic-title">Redemption Logic</div>
                            {LOGIC_RULES.map((rule, i) => (
                                <div key={i} className="cdx-logic-item">
                                    <div className="cdx-logic-check">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="cdx-logic-item-title">{rule.title}</div>
                                        <div className="cdx-logic-item-sub">{rule.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Edit Modal ── */}
            {showEdit && (
                <div className="cdx-overlay" onClick={() => setShowEdit(false)}>
                    <div className="cdx-modal" onClick={e => e.stopPropagation()}>
                        <button className="cdx-modal-close" onClick={() => setShowEdit(false)}>✕</button>
                        <div className="cdx-modal-title">Edit Coupon</div>

                        <div className="cdx-modal-field">
                            <label>Name</label>
                            <input className="cdx-modal-input" value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                placeholder="Enter coupon name" />
                        </div>

                        <div className="cdx-modal-field">
                            <label>Discount %</label>
                            <input className="cdx-modal-input" value={editForm.discount}
                                onChange={e => setEditForm({ ...editForm, discount: e.target.value })}
                                placeholder="e.g. 20%" />
                        </div>

                        <div className="cdx-modal-field">
                            <label>Active From</label>
                            <CalPicker value={editForm.activeFrom}
                                onChange={v => setEditForm({ ...editForm, activeFrom: v })}
                                placeholder="DD/MM/YYYY" />
                        </div>

                        <div className="cdx-modal-field">
                            <label>Active To</label>
                            <CalPicker value={editForm.activeTo}
                                onChange={v => setEditForm({ ...editForm, activeTo: v })}
                                placeholder="DD/MM/YYYY" />
                        </div>

                        <div className="cdx-modal-field">
                            <label>Limit Number</label>
                            <input className="cdx-modal-input" value={editForm.limit}
                                onChange={e => setEditForm({ ...editForm, limit: e.target.value })}
                                placeholder="e.g. 50" />
                        </div>

                        <button className="cdx-modal-save" onClick={() => setShowEdit(false)}>
                            Save Changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}