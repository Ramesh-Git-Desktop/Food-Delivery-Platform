import React, { useState, useEffect } from "react";
import "../CSS/OrderDetails.css";

/* ─────────────────────────────────────────
   Constants
───────────────────────────────────────── */
const STEPS = [
    { key: "Received", icon: "✓", svgIcon: null },
    { key: "Preparing", icon: "🍳", svgIcon: null },
    { key: "Out for Delivery", icon: "🔗", svgIcon: null },
    { key: "Delivered", icon: "📍", svgIcon: null },
];

/* ─────────────────────────────────────────
   Timers
───────────────────────────────────────── */
function useCountdown(initSecs) {
    const [s, setS] = useState(initSecs);
    useEffect(() => {
        const t = setInterval(() => setS((v) => (v > 0 ? v - 1 : 0)), 1000);
        return () => clearInterval(t);
    }, []);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m} mins` : `${s % 60}s`;
}

function usePrepMinutes(init) {
    const [m, setM] = useState(init);
    useEffect(() => {
        const t = setInterval(() => setM((v) => v + 1), 60000);
        return () => clearInterval(t);
    }, []);
    return m;
}

/* ─────────────────────────────────────────
   Toast
───────────────────────────────────────── */
function OdmToasts({ toasts }) {
    return (
        <div className="odm-toasts">
            {toasts.map((t) => (
                <div key={t.id} className="odm-toast">
                    {t.type === "success" && "✅"}
                    {t.type === "error" && "❌"}
                    {t.type === "info" && "ℹ️"}
                    <span>{t.msg}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────
   Edit Modal
───────────────────────────────────────── */
function OdmEditModal({ order, onClose, onSave }) {
    const [form, setForm] = useState({
        customer: order.customer,
        address: order.address || "124 Via Montenapoleone, Milan, IT 20121",
        instructions: "",
    });

    return (
        <div className="odm-overlay" onClick={onClose}>
            <div className="odm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="odm-modal-head">
                    <h5>Edit Order</h5>
                    <button className="odm-modal-x" onClick={onClose}>✕</button>
                </div>
                <div className="odm-modal-body">
                    <div className="odm-field">
                        <label>Customer Name</label>
                        <input
                            value={form.customer}
                            onChange={(e) => setForm({ ...form, customer: e.target.value })}
                            placeholder="Customer name"
                        />
                    </div>
                    <div className="odm-field">
                        <label>Delivery Address</label>
                        <input
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Delivery address"
                        />
                    </div>
                    <div className="odm-field">
                        <label>Special Instructions</label>
                        <textarea
                            rows={2}
                            value={form.instructions}
                            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                            placeholder="Any special requests?"
                        />
                    </div>
                </div>
                <div className="odm-modal-foot">
                    <button className="odm-mbtn odm-mbtn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="odm-mbtn odm-mbtn-primary"
                        onClick={() => { onSave(form); onClose(); }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Refund Modal
───────────────────────────────────────── */
function OdmRefundModal({ items, onClose, onSubmit }) {
    const [sel, setSel] = useState({});
    const [reason, setReason] = useState("");

    const total = Object.entries(sel).reduce(
        (acc, [id, checked]) => {
            if (!checked) return acc;
            const item = items.find((i) => String(i.id) === id);
            return acc + (item ? item.price : 0);
        },
        0
    );

    function submit() {
        if (total === 0 || !reason) return;
        onSubmit(total);
        onClose();
    }

    return (
        <div className="odm-overlay" onClick={onClose}>
            <div className="odm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="odm-modal-head">
                    <h5>Request Refund</h5>
                    <button className="odm-modal-x" onClick={onClose}>✕</button>
                </div>
                <div className="odm-modal-body">
                    <p style={{ fontSize: 13, color: "var(--odm-muted)", marginBottom: 12 }}>
                        Select the items you'd like to refund:
                    </p>
                    {items.map((item) => (
                        <div key={item.id} className="odm-refund-item">
                            <input
                                type="checkbox"
                                checked={!!sel[item.id]}
                                onChange={() => setSel((s) => ({ ...s, [item.id]: !s[item.id] }))}
                            />
                            <div style={{ flex: 1 }}>
                                <div className="odm-refund-item-name">{item.name}</div>
                                <div className="odm-refund-item-sub">{item.qty}× {item.unit}</div>
                            </div>
                            <div className="odm-refund-item-price">${item.price.toFixed(2)}</div>
                        </div>
                    ))}
                    <div className="odm-field" style={{ marginTop: 12 }}>
                        <label>Reason for Refund</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)}>
                            <option value="">Select a reason...</option>
                            <option>Wrong item delivered</option>
                            <option>Item quality issue</option>
                            <option>Order arrived late</option>
                            <option>Missing items</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div className="odm-refund-total-row">
                        <span>Refund Amount</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="odm-modal-foot">
                    <button className="odm-mbtn odm-mbtn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="odm-mbtn odm-mbtn-primary"
                        style={{ opacity: (!reason || total === 0) ? 0.5 : 1 }}
                        onClick={submit}
                    >
                        Submit Refund
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Support Modal
───────────────────────────────────────── */
function OdmSupportModal({ onClose }) {
    const OPTIONS = [
        { ico: "💬", title: "Live Chat", sub: "Avg. response: 2 mins", href: null },
        { ico: "📞", title: "Call Support", sub: "+39 02 8765 4321", href: "tel:+390287654321" },
        { ico: "✉️", title: "Email Support", sub: "support@delivery.com", href: "mailto:support@delivery.com" },
    ];
    return (
        <div className="odm-overlay" onClick={onClose}>
            <div className="odm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="odm-modal-head">
                    <h5>Contact Support</h5>
                    <button className="odm-modal-x" onClick={onClose}>✕</button>
                </div>
                <div className="odm-modal-body">
                    {OPTIONS.map((o) => (
                        <button
                            key={o.title}
                            className="odm-support-opt"
                            onClick={() => { if (o.href) window.location.href = o.href; onClose(); }}
                        >
                            <span className="odm-support-opt-icon">{o.ico}</span>
                            <div>
                                <div className="odm-support-opt-title">{o.title}</div>
                                <div className="odm-support-opt-sub">{o.sub}</div>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="odm-modal-foot">
                    <button className="odm-mbtn odm-mbtn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Main: OrderDetails
───────────────────────────────────────── */
export default function OrderDetails({ order: propOrder }) {
    /* Default data matching the screenshot exactly */
    const defaultOrder = {
        id: "#ORD-9928",
        customer: "Isabella Rossi",
        elite: true,
        status: "Preparing",   // index 1 in STEPS
        createdAt: "14:20 PM",
        prepMinsInit: 18,
        address: "124 Via Montenapoleone,\nMilan, IT 20121",
        courier: { name: "Marco V.", etaMinsInit: 12 },
        items: [
            {
                id: 1,
                name: "Saffron Gold Risotto",
                qty: 1,
                unit: "Unit",
                price: 32.00,
                emoji: "🍚",
                tags: [
                    { label: "Extra Parmesan", cls: "odm-tag-green" },
                    { label: "No Onions", cls: "odm-tag-red" },
                ],
            },
            {
                id: 2,
                name: "Truffle Infused Veal",
                qty: 2,
                unit: "Units",
                unitPrice: 42.00,
                price: 84.00,
                emoji: "🥩",
                tags: [{ label: "Medium Rare", cls: "odm-tag-blue" }],
            },
            {
                id: 3,
                name: "Barolo Reserva 2018",
                qty: 1,
                unit: "Bottle (750ml)",
                price: 120.00,
                emoji: "🍷",
                tags: [{ label: "Premium Selection", cls: "odm-tag-gold" }],
            },
        ],
        subtotal: 236.00,
        tax: 18.88,
        deliveryFee: 5.00,
        total: 259.88,
        paymentMethod: "Apple Pay",
    };

    const order = propOrder || defaultOrder;

    const [modal, setModal] = useState(null);   // "edit" | "refund" | "support"
    const [toasts, setToasts] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(order);

    const eta = useCountdown((currentOrder.courier?.etaMinsInit || 12) * 60);
    const prepMin = usePrepMinutes(currentOrder.prepMinsInit || 18);

    function showToast(msg, type = "success") {
        const id = Date.now();
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    }

    /* Step index: "Received"=0, "Preparing"=1, "Out for Delivery"=2, "Delivered"=3 */
    const currentIdx = STEPS.findIndex((s) => s.key === currentOrder.status);
    const safeIdx = currentIdx < 0 ? 0 : currentIdx;

    /* Width of the progress fill line between step circles */
    const stepCount = STEPS.length;
    const pct = safeIdx === 0 ? 0 : (safeIdx / (stepCount - 1)) * 100;

    function stepClass(i) {
        if (i < safeIdx) return "odm-done";
        if (i === safeIdx) return "odm-active";
        return "";
    }

    /* Step icons */
    const stepIcon = (step, i) => {
        if (i < safeIdx) {
            /* Done — white check mark */
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            );
        }
        /* Active / future — emoji icon */
        const icons = ["✓", "🍳", "🔗", "📍"];
        // Use SVG icons matching the screenshot
        if (i === 0) return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
            </svg>
        );
        if (i === 1) return (
            // Kitchen pot icon
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M3 11h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                <path d="M3 11V9a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v2" />
                <path d="M7 5V3M12 5V3M17 5V3" />
            </svg>
        );
        if (i === 2) return (
            // Bike / delivery icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="5.5" cy="17.5" r="3.5" />
                <circle cx="18.5" cy="17.5" r="3.5" />
                <path d="M15 6h-5l-2 5h9l-1 4" />
                <path d="M15 6l2.5 6" />
                <path d="M5.5 14L9 6" />
            </svg>
        );
        if (i === 3) return (
            // Location pin
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        );
        return icons[i] || i + 1;
    };

    return (
        <div className="odm-root">
            <OdmToasts toasts={toasts} />

            {/* ════════════ TOP BAR ════════════ */}
            <div className="odm-topbar">
                <div className="container">
                    <div className="odm-topbar-inner">
                        {/* Left: heading */}
                        <div>
                            <div className="odm-meta-row">
                                <span className="odm-in-progress-pill">
                                    <span className="odm-pill-dot" />
                                    In Progress
                                </span>
                                <span className="odm-created-time">Created {currentOrder.createdAt}</span>
                            </div>
                            <h1 className="odm-order-number">{currentOrder.id}</h1>
                            <div className="odm-customer-row">
                                <span className="odm-customer-icon">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <span className="odm-customer-name">{currentOrder.customer}</span>
                                {currentOrder.elite && (
                                    <span className="odm-elite-badge">Elite Member</span>
                                )}
                            </div>
                        </div>

                        {/* Right: buttons */}
                        <div className="odm-topbar-btns">
                            <button
                                className="odm-btn-print"
                                onClick={() => { showToast("Sending to printer…", "info"); setTimeout(() => window.print(), 400); }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2">
                                    <polyline points="6 9 6 2 18 2 18 9" />
                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                    <rect x="6" y="14" width="12" height="8" />
                                </svg>
                                Print Receipt
                            </button>
                            <button className="odm-btn-edit" onClick={() => setModal("edit")}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                Edit Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════ BODY ════════════ */}
            <div className="odm-body">
                <div className="container">
                    <div className="row g-4">

                        {/* ── LEFT COLUMN ── */}
                        <div className="col-lg-6">

                            {/* Real-time Status */}
                            <div className="odm-card">
                                <div className="odm-rts-head">
                                    <span className="odm-rts-title">Real-time Status</span>
                                    <span className="odm-prep-time">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        Prep Time: {prepMin} mins elapsed
                                    </span>
                                </div>

                                {/* Stepper */}
                                <div className="odm-tracker">
                                    {/* Background grey line */}
                                    <div className="odm-track-line-bg" />
                                    {/* Green fill line */}
                                    <div
                                        className="odm-track-line-fill"
                                        style={{ width: `calc(${pct}% - 36px)` }}
                                    />

                                    {STEPS.map((step, i) => (
                                        <div key={step.key} className={`odm-step ${stepClass(i)}`}>
                                            <div className="odm-step-circle">
                                                {stepIcon(step, i)}
                                            </div>
                                            <span className="odm-step-label">{step.key}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="odm-card">
                                <div className="odm-summary-title">Order Summary</div>

                                {currentOrder.items.map((item) => (
                                    <div key={item.id} className="odm-item">
                                        {/* Beige thumbnail square */}
                                        <div className="odm-item-thumb">{item.emoji}</div>

                                        <div className="odm-item-details">
                                            <div className="odm-item-name">{item.name}</div>
                                            <div className="odm-item-qty">
                                                {item.qty}x {item.unit}
                                                {item.unitPrice ? ` ($${item.unitPrice.toFixed(2)} ea)` : ""}
                                            </div>
                                            <div>
                                                {item.tags.map((tag) => (
                                                    <span key={tag.label} className={`odm-tag ${tag.cls}`}>
                                                        {tag.label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="odm-item-price">${item.price.toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN ── */}
                        <div className="col-lg-5">

                            {/* Logistics Card */}
                            <div className="odm-card" style={{ marginBottom: 16 }}>
                                <div className="odm-logistics-label">Logistics</div>

                                {/* Delivery Address */}
                                <div className="odm-address-block">
                                    <span className="odm-addr-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="#aaa" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </span>
                                    <div className="odm-addr-inner">
                                        <div className="odm-addr-label">Delivery Address</div>
                                        <div className="odm-addr-text">
                                            {currentOrder.address.split("\n").map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line}
                                                    {i < currentOrder.address.split("\n").length - 1 && <br />}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Courier */}
                                <div className="odm-courier-block">
                                    <div className="odm-courier-avatar">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            stroke="#999" strokeWidth="1.8">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div className="odm-courier-info">
                                        <div className="odm-courier-label">Courier</div>
                                        <div className="odm-courier-name">{currentOrder.courier.name}</div>
                                        <div className="odm-courier-eta">Arriving in {eta}</div>
                                    </div>
                                    <button
                                        className="odm-courier-call-btn"
                                        onClick={() => showToast(`Calling ${currentOrder.courier.name}…`, "info")}
                                        title="Call courier"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                            stroke="#fff" strokeWidth="2.5">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Map */}
                                <div className="odm-map-box">
                                    <svg viewBox="0 0 310 106" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="310" height="106" fill="#e8e2d4" />
                                        {/* Grid */}
                                        <line x1="0" y1="35" x2="310" y2="35" stroke="#d8d1c4" strokeWidth="1" />
                                        <line x1="0" y1="70" x2="310" y2="70" stroke="#d8d1c4" strokeWidth="1" />
                                        <line x1="77" y1="0" x2="77" y2="106" stroke="#d8d1c4" strokeWidth="1" />
                                        <line x1="155" y1="0" x2="155" y2="106" stroke="#d8d1c4" strokeWidth="1" />
                                        <line x1="233" y1="0" x2="233" y2="106" stroke="#d8d1c4" strokeWidth="1" />
                                        {/* Route dashed line */}
                                        <polyline
                                            points="28,78 77,78 77,53 155,53 155,28 222,28"
                                            stroke="#e07b2a"
                                            strokeWidth="2.5"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeDasharray="6,3"
                                        />
                                        {/* Animated courier dot */}
                                        <circle cx="155" cy="53" r="5" fill="#e07b2a" opacity="0.9">
                                            <animate attributeName="r" values="5;8;5" dur="1.8s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.8s" repeatCount="indefinite" />
                                        </circle>
                                        {/* Destination pin */}
                                        <circle cx="222" cy="28" r="8" fill="#2d6a4f" />
                                        <text x="222" y="32" textAnchor="middle" fontSize="9" fill="white">📍</text>
                                    </svg>
                                </div>
                            </div>

                            {/* Payment Card */}
                            <div className="odm-card">
                                <div className="odm-payment-label">Payment</div>

                                <div className="odm-pay-line">
                                    <span>Subtotal</span>
                                    <span>${currentOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="odm-pay-line">
                                    <span>Tax (8%)</span>
                                    <span>${currentOrder.tax.toFixed(2)}</span>
                                </div>
                                <div className="odm-pay-line">
                                    <span>Delivery Fee</span>
                                    <span>${currentOrder.deliveryFee.toFixed(2)}</span>
                                </div>

                                <div className="odm-pay-divider" />

                                <div className="odm-pay-total-row">
                                    <span className="odm-pay-total-label">Total</span>
                                    <span className="odm-pay-total-amount">
                                        ${currentOrder.total.toFixed(2)}
                                    </span>
                                </div>

                                {/* Apple Pay row */}
                                <div className="odm-pay-method-row">
                                    <span className="odm-pay-method-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="1.8">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                            <line x1="1" y1="10" x2="23" y2="10" />
                                        </svg>
                                    </span>
                                    <span className="odm-pay-method-name">{currentOrder.paymentMethod}</span>
                                    <span className="odm-verified-tag">VERIFIED</span>
                                </div>

                                {/* Refund + Contact Support buttons */}
                                <div className="odm-action-row">
                                    <button className="odm-btn-refund" onClick={() => setModal("refund")}>
                                        Refund
                                    </button>
                                    <button className="odm-btn-contact" onClick={() => setModal("support")}>
                                        CONTACT<br />SUPPORT
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════ MODALS ════════════ */}
            {modal === "edit" && (
                <OdmEditModal
                    order={currentOrder}
                    onClose={() => setModal(null)}
                    onSave={(form) => {
                        setCurrentOrder((o) => ({ ...o, customer: form.customer }));
                        showToast("Order updated successfully!");
                    }}
                />
            )}

            {modal === "refund" && (
                <OdmRefundModal
                    items={currentOrder.items}
                    onClose={() => setModal(null)}
                    onSubmit={(amt) => showToast(`Refund of $${amt.toFixed(2)} submitted!`)}
                />
            )}

            {modal === "support" && (
                <OdmSupportModal onClose={() => setModal(null)} />
            )}
        </div>
    );
}