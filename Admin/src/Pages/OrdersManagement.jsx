import React, { useState, useRef, useEffect } from "react";
import "../CSS/OrdersManagement.css";
import OrderDetails from "./Orderdetails";

/* ── Constants ── */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const STATUS_CLASSES = {
    Preparing: "status-preparing",
    "Driver Assigned": "status-driver",
    Delivered: "status-delivered",
    Pending: "status-pending",
    Cancelled: "status-cancelled",
    Ready: "status-ready",
};

const STATUS_FLOW = ["Pending", "Preparing", "Driver Assigned", "Ready", "Delivered"];
const STATUS_FILTERS = ["All", "Pending", "Preparing", "Ready", "Delivered"];
const RESTAURANTS = ["Burger Joint", "Sushi Master", "Pizza Heaven", "Taco Fiesta", "Wok & Roll", "Salad Stop", "Noodle Bar", "The Grill House"];
const AVATAR_COLORS = ["#c084fc", "#f472b6", "#34d399", "#60a5fa", "#fb923c", "#a78bfa"];

const INITIAL_ORDERS = [
    { id: "#ORD-4921", customer: "Alex M.", initials: "AM", avatar: "https://i.pravatar.cc/40?img=1", avatarBg: null, restaurant: "Burger Joint", items: "2x Smash Burger, 1x Fries", amount: 32.50, status: "Preparing" },
    { id: "#ORD-4920", customer: "Sarah J.", initials: "SJ", avatar: null, avatarBg: "#c084fc", restaurant: "Sushi Master", items: "1x Spicy Tuna Roll, 1x Miso Soup", amount: 18.00, status: "Driver Assigned" },
    { id: "#ORD-4919", customer: "Emily R.", initials: "ER", avatar: "https://i.pravatar.cc/40?img=5", avatarBg: null, restaurant: "Pizza Heaven", items: "1x Large Pepperoni, 1x Garlic Bread", amount: 24.50, status: "Delivered" },
    { id: "#ORD-4918", customer: "Mike K.", initials: "MK", avatar: null, avatarBg: "#f472b6", restaurant: "Taco Fiesta", items: "3x Beef Tacos, 1x Nachos", amount: 15.75, status: "Pending" },
    { id: "#ORD-4917", customer: "David B.", initials: "DB", avatar: "https://i.pravatar.cc/40?img=8", avatarBg: null, restaurant: "Wok & Roll", items: "1x Pad Thai, 1x Spring Rolls", amount: 21.00, status: "Cancelled" },
    { id: "#ORD-4916", customer: "Lisa C.", initials: "LC", avatar: null, avatarBg: "#34d399", restaurant: "Salad Stop", items: "1x Caesar Salad, 1x Green Juice", amount: 19.50, status: "Preparing" },
];

let nextId = 4922;
function getInitials(name) { return name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2); }
function truncate(str, n = 30) { return str.length > n ? str.slice(0, n) + "…" : str; }

/* ─────────────────────────────────────────
   DatePicker
───────────────────────────────────────── */
function DatePicker({ selectedDate, onChange }) {
    const [open, setOpen] = useState(false);
    const [view, setView] = useState({ month: selectedDate.getMonth(), year: selectedDate.getFullYear() });
    const ref = useRef(null);

    useEffect(() => {
        function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const firstDay = (m, y) => new Date(y, m, 1).getDay();

    const prevM = () => setView(v => v.month === 0 ? { month: 11, year: v.year - 1 } : { month: v.month - 1, year: v.year });
    const nextM = () => setView(v => v.month === 11 ? { month: 0, year: v.year + 1 } : { month: v.month + 1, year: v.year });

    function formatBtn(d) {
        const t = new Date(); t.setHours(0, 0, 0, 0);
        if (d.getTime() === t.getTime()) return `Today, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
        return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
    }

    const total = daysInMonth(view.month, view.year);
    const startBlk = firstDay(view.month, view.year);
    const cells = Array(startBlk).fill(null).concat(Array.from({ length: total }, (_, i) => i + 1));
    while (cells.length % 7 !== 0) cells.push(null);
    const selD = new Date(selectedDate); selD.setHours(0, 0, 0, 0);

    return (
        <div className="om-datepicker-wrap" ref={ref}>
            <button className="om-date-btn" onClick={() => setOpen(o => !o)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {formatBtn(selectedDate)}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </button>
            {open && (
                <div className="om-cal">
                    <div className="om-cal-nav">
                        <button className="om-cal-arrow" onClick={prevM}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <span className="om-cal-title">{MONTHS[view.month]} {view.year}</span>
                        <button className="om-cal-arrow" onClick={nextM}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <div className="om-cal-grid">
                        {DAYS.map(d => <div key={d} className="om-cal-day-hdr">{d}</div>)}
                        {cells.map((d, i) => {
                            if (!d) return <div key={`b${i}`} />;
                            const td = new Date(view.year, view.month, d); td.setHours(0, 0, 0, 0);
                            return (
                                <button key={i}
                                    className={`om-cal-day ${td.getTime() === today.getTime() ? "om-cal-today" : ""} ${td.getTime() === selD.getTime() ? "om-cal-selected" : ""}`}
                                    onClick={() => { onChange(new Date(view.year, view.month, d)); setOpen(false); }}>
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                    <div className="om-cal-footer">
                        <button className="om-cal-today-btn" onClick={() => {
                            const t = new Date(); t.setHours(0, 0, 0, 0); onChange(t);
                            setView({ month: t.getMonth(), year: t.getFullYear() }); setOpen(false);
                        }}>Today</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────
   Toast
───────────────────────────────────────── */
function Toast({ toasts }) {
    return (
        <div className="om-toasts">
            {toasts.map(t => (
                <div key={t.id} className={`om-toast om-toast-${t.type}`}>
                    {t.type === "success" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>}
                    {t.type === "error" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></svg>}
                    {t.type === "info" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>}
                    <span>{t.msg}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────
   Notification Panel
───────────────────────────────────────── */
function NotificationPanel({ orders, onClose, onViewOrder }) {
    const ref = useRef(null);
    useEffect(() => {
        function h(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [onClose]);

    const notes = [
        ...orders.filter(o => o.status === "Pending").map(o => ({ order: o, label: "Awaiting confirmation", color: "#6b7280", bg: "#f1f2f4", dot: "#6b7280" })),
        ...orders.filter(o => o.status === "Preparing").map(o => ({ order: o, label: "Being prepared now", color: "#f97316", bg: "#fff3e0", dot: "#f97316" })),
        ...orders.filter(o => o.status === "Driver Assigned").map(o => ({ order: o, label: "Driver on the way", color: "#db2777", bg: "#fce7f3", dot: "#db2777" })),
        ...orders.filter(o => o.status === "Ready").map(o => ({ order: o, label: "Ready for pickup", color: "#7c3aed", bg: "#ede9fe", dot: "#7c3aed" })),
    ];

    return (
        <div className="om-notif-panel" ref={ref}>
            <div className="om-notif-panel-hdr">
                <span className="om-notif-panel-title">Notifications</span>
                {notes.length > 0 && <span className="om-notif-count">{notes.length} active</span>}
            </div>
            {notes.length === 0
                ? <div className="om-notif-empty"><p>🔔</p><p>All caught up!</p></div>
                : <div className="om-notif-list">
                    {notes.map((n, i) => (
                        <div key={i} className="om-notif-item" onClick={() => { onViewOrder(n.order); onClose(); }}>
                            <div className="om-notif-dot-wrap" style={{ position: "relative", width: 14, height: 14, flexShrink: 0 }}>
                                <span style={{ position: "absolute", inset: -3, borderRadius: "50%", background: n.dot + "30" }} />
                                <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: n.dot }} />
                            </div>
                            <div className="om-notif-info">
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                    <span className="om-notif-id">{n.order.id}</span>
                                    <span className="om-notif-stag" style={{ background: n.bg, color: n.color }}>{n.order.status}</span>
                                </div>
                                <div className="om-notif-cust">{n.order.customer} · {n.order.restaurant}</div>
                                <div className="om-notif-desc" style={{ color: n.color }}>{n.label}</div>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                        </div>
                    ))}
                </div>
            }
            <div className="om-notif-footer">
                <button className="om-notif-dismiss" onClick={onClose}>Dismiss</button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Action Menu
───────────────────────────────────────── */
function ActionMenu({ order, onView, onEdit, onNext, onDelete }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const canAdvance = order.status !== "Delivered" && order.status !== "Cancelled";

    return (
        <div className="om-action-wrap" ref={ref}>
            <button className={`om-dots-btn ${open ? "om-dots-open" : ""}`} onClick={() => setOpen(o => !o)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
            </button>
            {open && (
                <div className="om-dropdown">
                    <button className="om-dropdown-item om-drop-view" onClick={() => { onView(); setOpen(false); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg> View
                    </button>
                    <button className="om-dropdown-item om-drop-edit" onClick={() => { onEdit(); setOpen(false); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> Edit
                    </button>
                    {canAdvance && (
                        <button className="om-dropdown-item om-drop-next" onClick={() => { onNext(); setOpen(false); }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg> Next Status
                        </button>
                    )}
                    <button className="om-dropdown-item om-drop-delete" onClick={() => { onDelete(); setOpen(false); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────
   Status Badge
───────────────────────────────────────── */
function StatusBadge({ status }) {
    return (
        <span className={`om-status ${STATUS_CLASSES[status] || ""}`}>
            {status === "Delivered" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg>}
            {status === "Cancelled" && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 14.14 14.14" /></svg>}
            {!["Delivered", "Cancelled"].includes(status) && <span className="om-status-dot" />}
            {status}
        </span>
    );
}

/* ─────────────────────────────────────────
   Create / Edit Modal
───────────────────────────────────────── */
function OrderModal({ order, onClose, onSave }) {
    const isEdit = !!order?.id;
    const [form, setForm] = useState({
        customer: order?.customer || "",
        restaurant: order?.restaurant || "",
        items: order?.items || "",
        amount: order?.amount || "",
        status: order?.status || "Pending",
    });
    const [errors, setErrors] = useState({});

    function validate() {
        const e = {};
        if (!form.customer.trim()) e.customer = "Customer name is required";
        if (!form.restaurant.trim()) e.restaurant = "Restaurant is required";
        if (!form.items.trim()) e.items = "Items are required";
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Valid amount required";
        return e;
    }

    function submit() {
        const e = validate(); if (Object.keys(e).length) { setErrors(e); return; }
        onSave({
            ...(isEdit ? order : {}),
            id: isEdit ? order.id : `#ORD-${nextId++}`,
            customer: form.customer.trim(),
            initials: getInitials(form.customer),
            avatar: isEdit ? order.avatar : null,
            avatarBg: order?.avatarBg || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
            restaurant: form.restaurant.trim(),
            items: form.items.trim(),
            amount: parseFloat(form.amount),
            status: form.status,
        });
    }

    return (
        <div className="om-modal-overlay" onClick={onClose}>
            <div className="om-modal" onClick={e => e.stopPropagation()}>
                <div className="om-modal-header">
                    <h2>{isEdit ? "Edit Order" : "Create New Order"}</h2>
                    <button className="om-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="om-modal-body">
                    <div className="om-field">
                        <label>Customer Name</label>
                        <input value={form.customer} placeholder="e.g. John D." className={errors.customer ? "om-input-err" : ""}
                            onChange={e => setForm({ ...form, customer: e.target.value })} />
                        {errors.customer && <span className="om-err">{errors.customer}</span>}
                    </div>
                    <div className="om-field">
                        <label>Restaurant</label>
                        <select value={form.restaurant} className={errors.restaurant ? "om-input-err" : ""}
                            onChange={e => setForm({ ...form, restaurant: e.target.value })}>
                            <option value="">Select restaurant...</option>
                            {RESTAURANTS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.restaurant && <span className="om-err">{errors.restaurant}</span>}
                    </div>
                    <div className="om-field">
                        <label>Items</label>
                        <input value={form.items} placeholder="e.g. 2x Burger, 1x Fries" className={errors.items ? "om-input-err" : ""}
                            onChange={e => setForm({ ...form, items: e.target.value })} />
                        {errors.items && <span className="om-err">{errors.items}</span>}
                    </div>
                    <div className="om-field-row">
                        <div className="om-field">
                            <label>Amount ($)</label>
                            <input type="number" min="0" step="0.01" value={form.amount} placeholder="0.00"
                                className={errors.amount ? "om-input-err" : ""} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            {errors.amount && <span className="om-err">{errors.amount}</span>}
                        </div>
                        <div className="om-field">
                            <label>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                {Object.keys(STATUS_CLASSES).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="om-modal-footer">
                    <button className="om-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="om-btn-save" onClick={submit}>{isEdit ? "Save Changes" : "Create Order"}</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   View Modal (quick peek — not full page)
───────────────────────────────────────── */
function ViewModal({ order, onClose, onStatusChange }) {
    const idx = STATUS_FLOW.indexOf(order.status);
    return (
        <div className="om-modal-overlay" onClick={onClose}>
            <div className="om-modal om-modal-view" onClick={e => e.stopPropagation()}>
                <div className="om-modal-header">
                    <h2>Order Details</h2>
                    <button className="om-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="om-modal-body">
                    <div className="om-view-top">
                        <span className="om-view-id">{order.id}</span>
                        <StatusBadge status={order.status} />
                    </div>
                    {order.status !== "Cancelled" && (
                        <div className="om-stepper">
                            {STATUS_FLOW.map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`om-step ${i <= idx ? "om-step-done" : ""}`}>
                                        <div className="om-step-circle">{i < idx ? "✓" : i + 1}</div>
                                        <div className="om-step-label">{s}</div>
                                    </div>
                                    {i < STATUS_FLOW.length - 1 && <div className={`om-step-line ${i < idx ? "om-step-line-done" : ""}`} />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                    <div className="om-view-grid">
                        <div className="om-view-item"><span className="om-view-key">Customer</span><span className="om-view-val">{order.customer}</span></div>
                        <div className="om-view-item"><span className="om-view-key">Restaurant</span><span className="om-view-val">{order.restaurant}</span></div>
                        <div className="om-view-item om-view-full"><span className="om-view-key">Items</span><span className="om-view-val">{order.items}</span></div>
                        <div className="om-view-item"><span className="om-view-key">Amount</span><span className="om-view-val om-view-amount">${order.amount.toFixed(2)}</span></div>
                    </div>
                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <div>
                            <p className="om-view-actions-label">Update Status</p>
                            <div className="om-view-status-btns">
                                {Object.keys(STATUS_CLASSES).filter(s => s !== order.status && s !== "Cancelled").map(s => (
                                    <button key={s} className={`om-status-update-btn ${STATUS_CLASSES[s]}`}
                                        onClick={() => { onStatusChange(order.id, s); onClose(); }}>→ {s}</button>
                                ))}
                                <button className="om-status-update-btn status-cancelled"
                                    onClick={() => { onStatusChange(order.id, "Cancelled"); onClose(); }}>✕ Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="om-modal-footer">
                    <button className="om-btn-save" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────
   Delete Modal
───────────────────────────────────────── */
function DeleteModal({ order, onClose, onConfirm }) {
    return (
        <div className="om-modal-overlay" onClick={onClose}>
            <div className="om-modal om-modal-delete" onClick={e => e.stopPropagation()}>
                <div className="om-delete-icon">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                    </svg>
                </div>
                <h2 className="om-delete-title">Delete Order</h2>
                <p className="om-delete-msg">Are you sure you want to delete <strong>{order.id}</strong> for <strong>{order.customer}</strong>? This cannot be undone.</p>
                <div className="om-modal-footer" style={{ justifyContent: "center" }}>
                    <button className="om-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="om-btn-delete" onClick={() => onConfirm(order.id)}>Delete Order</button>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   MAIN: OrdersManagement
═══════════════════════════════════════════ */
export default function OrdersManagement() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [activeFilter, setActiveFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showNotif, setShowNotif] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [editOrder, setEditOrder] = useState(null);
    const [detailOrder, setDetailOrder] = useState(null);  // → full OrderDetails page
    const [quickView, setQuickView] = useState(null);  // → quick ViewModal
    const [deleteOrder, setDeleteOrder] = useState(null);
    const [toasts, setToasts] = useState([]);
    const notifRef = useRef(null);

    function showToast(msg, type = "success") {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
    }

    const totalDelivered = orders.filter(o => o.status === "Delivered").length;
    const preparingCount = orders.filter(o => o.status === "Preparing").length;
    const outForDelivery = orders.filter(o => o.status === "Driver Assigned").length;
    const activeNotifCount = orders.filter(o => ["Pending", "Preparing", "Driver Assigned", "Ready"].includes(o.status)).length;

    const filtered = orders.filter(o => {
        const mf = activeFilter === "All" || o.status === activeFilter;
        const q = search.toLowerCase();
        const ms = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q)
            || o.items.toLowerCase().includes(q) || o.restaurant.toLowerCase().includes(q);
        return mf && ms;
    });

    function handleSave(data) {
        const exists = orders.some(o => o.id === data.id);
        setOrders(prev => exists ? prev.map(o => o.id === data.id ? data : o) : [data, ...prev]);
        showToast(`Order ${data.id} ${exists ? "updated" : "created"}`);
        setShowCreate(false); setEditOrder(null);
    }

    function handleDelete(id) {
        setOrders(prev => prev.filter(o => o.id !== id));
        showToast(`Order ${id} deleted`, "error");
        setDeleteOrder(null);
    }

    function handleStatusChange(id, newStatus) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        showToast(`${id} → ${newStatus}`, "info");
    }

    /* Convert table row order into OrderDetails prop shape */
    function toDetailProp(o) {
        const itemArr = o.items.split(",").map((s, i) => {
            const m = s.trim().match(/^(\d+)x?\s+(.+)/i);
            return {
                id: i + 1,
                name: m ? m[2] : s.trim(),
                qty: m ? parseInt(m[1]) : 1,
                unit: "Unit",
                price: +(o.amount / o.items.split(",").length).toFixed(2),
                emoji: ["🍔", "🍣", "🍕", "🌮", "🍜", "🥗", "🍷", "🥩"][i] || "🍽️",
                tags: [],
            };
        });
        const sub = o.amount;
        const tax = +(sub * 0.08).toFixed(2);
        return {
            id: o.id,
            customer: o.customer,
            elite: false,
            status: o.status === "Driver Assigned" ? "Out for Delivery"
                : o.status === "Preparing" ? "Preparing"
                    : o.status === "Delivered" ? "Delivered"
                        : "Received",
            createdAt: "14:20 PM",
            prepMinsInit: 18,
            address: "124 Via Montenapoleone,\nMilan, IT 20121",
            courier: { name: "Marco V.", etaMinsInit: 12 },
            items: itemArr,
            subtotal: sub,
            tax,
            deliveryFee: 5.00,
            total: +(sub + tax + 5).toFixed(2),
            paymentMethod: "Apple Pay",
        };
    }

    /* Full page OrderDetails */
    if (detailOrder) {
        return (
            <OrderDetails
                order={toDetailProp(detailOrder)}
                onBack={() => setDetailOrder(null)}
            />
        );
    }

    return (
        <div className="om-wrap">
            <Toast toasts={toasts} />

            <div className="container">

                {/* ── Header ── */}
                <div className="om-header">
                    <div>
                        <h1 className="om-title">Orders Management</h1>
                        <div className="om-live"><span className="om-live-dot" />Live Status: Online</div>
                    </div>
                    <div className="om-header-actions">
                        <div className="om-notif-wrap" ref={notifRef}>
                            <button className="om-notif-btn" onClick={() => setShowNotif(o => !o)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {activeNotifCount > 0 && <span className="om-notif-badge">{activeNotifCount}</span>}
                            </button>
                            {showNotif && (
                                <NotificationPanel
                                    orders={orders}
                                    onClose={() => setShowNotif(false)}
                                    onViewOrder={o => { setDetailOrder(o); setShowNotif(false); }}
                                />
                            )}
                        </div>
                        <button className="om-create-btn" onClick={() => setShowCreate(true)}>
                            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Create Order
                        </button>
                    </div>
                </div>

                {/* ── Stats ── */}
                <div className="om-stats">
                    <div className="om-stat-card">
                        <div className="om-stat-label">Total Delivered</div>
                        <div className="om-stat-value">{totalDelivered}<span className="om-stat-unit"> orders</span></div>
                    </div>
                    <div className="om-stat-card">
                        <div className="om-stat-label">Total Today</div>
                        <div className="om-stat-value">{orders.length}<span className="om-stat-unit"> orders</span></div>
                    </div>
                    <div className="om-stat-card">
                        <div className="om-stat-label">Preparing</div>
                        <div className="om-stat-value">{preparingCount}<span className="om-stat-unit"> active</span></div>
                        <div className="om-progress-bar">
                            <div className="om-progress-fill"
                                style={{ width: `${orders.length ? Math.min((preparingCount / orders.length) * 100, 100) : 0}%` }} />
                        </div>
                    </div>
                    <div className="om-stat-card">
                        <div className="om-stat-label-row">
                            Out for Delivery
                            <svg width="22" height="15" viewBox="0 0 24 16" fill="none">
                                <rect x="1" y="5" width="15" height="9" rx="1" stroke="#f97316" strokeWidth="1.5" fill="none" />
                                <path d="M16 8h4l3 4v2h-7V8z" stroke="#f97316" strokeWidth="1.5" fill="none" />
                                <circle cx="6" cy="14" r="2" stroke="#f97316" strokeWidth="1.5" fill="none" />
                                <circle cx="19" cy="14" r="2" stroke="#f97316" strokeWidth="1.5" fill="none" />
                            </svg>
                        </div>
                        <div className="om-stat-value">{outForDelivery}<span className="om-stat-unit"> riders</span></div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="om-table-section">
                    <div className="om-toolbar">
                        <div className="om-search">
                            <svg className="om-search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input type="text" placeholder="Search by ID, Customer, or Item..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                            {search && <button className="om-search-clear" onClick={() => setSearch("")}>✕</button>}
                        </div>
                        <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
                        <div className="om-filters">
                            {STATUS_FILTERS.map(f => (
                                <button key={f}
                                    className={`om-filter-btn ${activeFilter === f ? "om-filter-active" : ""}`}
                                    onClick={() => setActiveFilter(f)}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="om-table-scroll">
                        <table className="om-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th><th>Customer</th><th>Restaurant</th>
                                    <th>Items</th><th>Amount</th><th>Status</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan="7" className="om-empty">
                                                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                                </svg>
                                                <p>No orders found</p>
                                                {search && <button className="om-clear-search" onClick={() => setSearch("")}>Clear search</button>}
                                            </td>
                                        </tr>
                                    )
                                    : filtered.map(order => (
                                        <tr key={order.id}
                                            onClick={() => setDetailOrder(order)}
                                            title={`Open ${order.id} details`}>
                                            <td className="om-order-id">{order.id}</td>
                                            <td>
                                                <div className="om-customer">
                                                    {order.avatar
                                                        ? <img src={order.avatar} alt={order.customer} className="om-avatar" />
                                                        : <div className="om-avatar om-avatar-initials" style={{ background: order.avatarBg }}>{order.initials}</div>
                                                    }
                                                    <strong>{order.customer}</strong>
                                                </div>
                                            </td>
                                            <td>{order.restaurant}</td>
                                            <td>{truncate(order.items)}</td>
                                            <td><strong>${order.amount.toFixed(2)}</strong></td>
                                            <td><StatusBadge status={order.status} /></td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <div className="om-actions">
                                                    <ActionMenu
                                                        order={order}
                                                        onView={() => setDetailOrder(order)}
                                                        onEdit={() => setEditOrder(order)}
                                                        onNext={() => {
                                                            const next = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
                                                            if (next) handleStatusChange(order.id, next);
                                                        }}
                                                        onDelete={() => setDeleteOrder(order)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>

                    <div className="om-table-footer">
                        Showing <strong>{filtered.length}</strong> of <strong>{orders.length}</strong> orders
                    </div>
                </div>

            </div>

            {/* ── Modals ── */}
            {(showCreate || editOrder) && (
                <OrderModal order={editOrder} onClose={() => { setShowCreate(false); setEditOrder(null); }} onSave={handleSave} />
            )}
            {quickView && (
                <ViewModal order={quickView} onClose={() => setQuickView(null)} onStatusChange={handleStatusChange} />
            )}
            {deleteOrder && (
                <DeleteModal order={deleteOrder} onClose={() => setDeleteOrder(null)} onConfirm={handleDelete} />
            )}
        </div>
    );
}