import { useState, useRef, useEffect } from "react";
import "../CSS/CouponsManagement.css";
import CouponDetails from "./Coupondetails";

const initialCoupons = [
  {
    id: 1,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
  {
    id: 2,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: false,
  },
  {
    id: 3,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
  {
    id: 4,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
  {
    id: 5,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: false,
  },
  {
    id: 6,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
  {
    id: 7,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
  {
    id: 8,
    name: "Get Flat 20% Off",
    restaurant: "WOW momo",
    code: "DEYKXJXS",
    discount: "20%",
    activeTo: "23/08/2027",
    activeFrom: "23/08/2027",
    limit: 50,
    used: 0,
    isActive: true,
  },
];

const emptyForm = {
  name: "",
  discountType: "",
  activeFrom: "",
  activeTo: "",
  limitNumber: "",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CalendarPicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const parsed = value
    ? (() => {
      const [d, m, y] = value.split("/");
      return new Date(+y, +m - 1, +d);
    })()
    : null;
  const [viewYear, setViewYear] = useState(
    parsed ? parsed.getFullYear() : today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed ? parsed.getMonth() : today.getMonth(),
  );
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const dd = String(day).padStart(2, "0");
    const mm = String(viewMonth + 1).padStart(2, "0");
    onChange(`${dd}/${mm}/${viewYear}`);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const selectedDay =
    parsed &&
      parsed.getFullYear() === viewYear &&
      parsed.getMonth() === viewMonth
      ? parsed.getDate()
      : null;

  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div className="cm-datepicker" ref={ref}>
      <div
        className={`cm-datepicker-input ${open ? "cm-datepicker-input--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={
            value ? "cm-datepicker-value" : "cm-datepicker-placeholder"
          }
        >
          {value || placeholder}
        </span>
        <svg
          className="cm-datepicker-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {open && (
        <div className="cm-calendar">
          <div className="cm-calendar-header">
            <button className="cm-cal-nav" onClick={prevMonth}>
              &#8249;
            </button>
            <span className="cm-cal-month-label">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button className="cm-cal-nav" onClick={nextMonth}>
              &#8250;
            </button>
          </div>
          <div className="cm-calendar-grid">
            {DAYS.map((d) => (
              <div key={d} className="cm-cal-day-name">
                {d}
              </div>
            ))}
            {cells.map((day, i) => (
              <div
                key={i}
                className={`cm-cal-cell ${day ? "cm-cal-cell--day" : ""} ${day === selectedDay ? "cm-cal-cell--selected" : ""}`}
                onClick={() => day && handleDayClick(day)}
              >
                {day || ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CouponsManagement() {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  const handleDotsClick = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const handleToggleActive = (id) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      name: coupon.name,
      discountType: coupon.discount,
      activeFrom: coupon.activeFrom,
      activeTo: coupon.activeTo,
      limitNumber: coupon.limit,
    });
    setOpenMenuId(null);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setOpenMenuId(null);
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
              ...c,
              name: form.name,
              discount: form.discountType,
              activeFrom: form.activeFrom,
              activeTo: form.activeTo,
              limit: form.limitNumber,
            }
            : c,
        ),
      );
    } else {
      const newCoupon = {
        id: Date.now(),
        name: form.name,
        restaurant: "WOW momo",
        code: Math.random().toString(36).substring(2, 10).toUpperCase(),
        discount: form.discountType,
        activeFrom: form.activeFrom,
        activeTo: form.activeTo,
        limit: form.limitNumber,
        used: 0,
        isActive: true,
      };
      setCoupons((prev) => [newCoupon, ...prev]);
    }
    setShowModal(false);
  };

  return (
    <div className="cm-page">
      {selectedCoupon && (
        <CouponDetails
          coupon={{
            ...selectedCoupon,
            description: `${selectedCoupon.discount} off total order value for loyal patrons.`,
          }}
          onBack={() => setSelectedCoupon(null)}
        />
      )}
      {!selectedCoupon && (<>
        <div className="cm-header">
          <h1 className="cm-title">Coupons Management</h1>
          <button className="cm-add-btn" onClick={handleAddNew}>
            + Add New Coupon
          </button>
        </div>

        <div className="cm-table-wrapper">
          <table className="cm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Restaurant name</th>
                <th>Code</th>
                <th>Discount %</th>
                <th>Active to</th>
                <th>Active from</th>
                <th>Limit no</th>
                <th>Used from</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}
                  onClick={() => setSelectedCoupon(coupon)}
                  style={{ cursor: "pointer" }}>
                  <td>{coupon.name}</td>
                  <td>{coupon.restaurant}</td>
                  <td className="cm-code">{coupon.code}</td>
                  <td>{coupon.discount}</td>
                  <td>{coupon.activeTo}</td>
                  <td>{coupon.activeFrom}</td>
                  <td>{coupon.limit}</td>
                  <td>{coupon.used}</td>
                  <td className="cm-actions-cell" onClick={e => e.stopPropagation()}>
                    <button
                      className="cm-dots-btn"
                      onClick={(e) => handleDotsClick(coupon.id, e)}
                    >
                      ⋮
                    </button>
                    {openMenuId === coupon.id && (
                      <div className="cm-dropdown" ref={menuRef}>
                        <button
                          className="cm-dropdown-item"
                          onClick={() => handleEdit(coupon)}
                        >
                          <span className="cm-dropdown-icon">✏️</span> Edit
                        </button>
                        <div className="cm-dropdown-divider" />
                        <div className="cm-dropdown-toggle-row">
                          <span className="cm-dropdown-toggle-label">
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                          <button
                            className={`cm-toggle ${coupon.isActive ? "cm-toggle--on" : "cm-toggle--off"}`}
                            onClick={() => handleToggleActive(coupon.id)}
                          >
                            <span className="cm-toggle-knob" />
                          </button>
                        </div>
                        <div className="cm-dropdown-divider" />
                        <button
                          className="cm-dropdown-item cm-delete"
                          onClick={() => handleDelete(coupon.id)}
                        >
                          <span className="cm-dropdown-icon">🗑️</span> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="cm-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
              <button
                className="cm-modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
              <h2 className="cm-modal-title">
                {editingCoupon ? "Edit coupon" : "Add new coupon"}
              </h2>

              <label className="cm-label">Name</label>
              <input
                className="cm-input"
                placeholder="Enter Coupon Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <label className="cm-label">Discount %</label>
              <input
                className="cm-input"
                placeholder="e.g. 20%"
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value })
                }
              />

              <label className="cm-label">Active from</label>
              <CalendarPicker
                value={form.activeFrom}
                onChange={(val) => setForm({ ...form, activeFrom: val })}
                placeholder="DD/MM/YYYY"
              />

              <label className="cm-label">Active to</label>
              <CalendarPicker
                value={form.activeTo}
                onChange={(val) => setForm({ ...form, activeTo: val })}
                placeholder="DD/MM/YYYY"
              />

              <label className="cm-label">Limit Number</label>
              <input
                className="cm-input"
                placeholder="e.g. 50"
                value={form.limitNumber}
                onChange={(e) =>
                  setForm({ ...form, limitNumber: e.target.value })
                }
              />

              <button className="cm-save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </>)}
    </div>
  );
}