import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/GeneralCustomer.css";

const initialCustomers = [
    { uid: 1, id: "#C-004560", joinDate: "27 March 2020, 12:43 AM", name: "Veronica", location: "Corner Street 5th, London", totalSpent: 78.92, lastOrder: 33.35 },
    { uid: 2, id: "#C-004561", joinDate: "14 April 2021, 09:20 AM", name: "James", location: "Baker Street 12th, Manchester", totalSpent: 120.5, lastOrder: 45.0 },
    { uid: 3, id: "#C-004562", joinDate: "05 June 2021, 11:10 AM", name: "Sophia", location: "High Street 3rd, Birmingham", totalSpent: 200.0, lastOrder: 60.75 },
    { uid: 4, id: "#C-004563", joinDate: "22 January 2022, 08:00 AM", name: "Oliver", location: "King's Road, London", totalSpent: 55.3, lastOrder: 20.0 },
    { uid: 5, id: "#C-004564", joinDate: "30 September 2020, 03:15 PM", name: "Emma", location: "Park Lane, Liverpool", totalSpent: 340.1, lastOrder: 90.0 },
    { uid: 6, id: "#C-004565", joinDate: "18 December 2019, 05:45 PM", name: "Liam", location: "Oxford Street, London", totalSpent: 89.99, lastOrder: 29.99 },
    { uid: 7, id: "#C-004566", joinDate: "09 March 2022, 01:30 PM", name: "Ava", location: "Chapel Street, Leeds", totalSpent: 175.6, lastOrder: 55.2 },
    { uid: 8, id: "#C-004567", joinDate: "01 July 2023, 10:00 AM", name: "Noah", location: "Castle Road, Edinburgh", totalSpent: 62.4, lastOrder: 18.9 },
    { uid: 9, id: "#C-004568", joinDate: "15 February 2021, 07:30 AM", name: "Isabella", location: "Queen Street, Bristol", totalSpent: 410.0, lastOrder: 110.0 },
    { uid: 10, id: "#C-004569", joinDate: "28 August 2020, 04:00 PM", name: "Mason", location: "Victoria Road, Sheffield", totalSpent: 95.75, lastOrder: 40.0 },
    { uid: 11, id: "#C-004570", joinDate: "11 November 2022, 02:15 PM", name: "Mia", location: "Regent Street, London", totalSpent: 230.8, lastOrder: 75.5 },
    { uid: 12, id: "#C-004571", joinDate: "03 October 2021, 06:00 PM", name: "Ethan", location: "Market Street, Nottingham", totalSpent: 48.0, lastOrder: 15.0 },
    { uid: 13, id: "#C-004572", joinDate: "20 May 2023, 09:45 AM", name: "Charlotte", location: "Bridge Lane, Cardiff", totalSpent: 300.25, lastOrder: 85.0 },
    { uid: 14, id: "#C-004573", joinDate: "07 January 2020, 11:00 AM", name: "Aiden", location: "Hill Road, Glasgow", totalSpent: 145.6, lastOrder: 50.0 },
    { uid: 15, id: "#C-004574", joinDate: "25 April 2022, 08:30 AM", name: "Amelia", location: "Elm Avenue, Southampton", totalSpent: 70.0, lastOrder: 25.0 },
    { uid: 16, id: "#C-004575", joinDate: "12 August 2021, 03:00 PM", name: "Lucas", location: "Grove Street, Leicester", totalSpent: 185.3, lastOrder: 65.0 },
    { uid: 17, id: "#C-004576", joinDate: "19 June 2022, 12:00 PM", name: "Harper", location: "Station Road, Plymouth", totalSpent: 99.1, lastOrder: 38.5 },
];

let toastId = 0;

export default function GeneralCustomer() {
    const navigate = useNavigate();

    const [customers, setCustomers] = useState(initialCustomers);
    const [search, setSearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const [filterLocation, setFilterLocation] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [menuOpenUid, setMenuOpenUid] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [toasts, setToasts] = useState([]);

    const filterRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target))
                setShowFilter(false);
            if (!e.target.closest(".gc-context-menu") && !e.target.closest(".gc-dots-btn"))
                setMenuOpenUid(null);
        };
        const handleScroll = () => setMenuOpenUid(null);
        document.addEventListener("mousedown", handler);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handler);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, []);

    const pushToast = (message, type = "success") => {
        const id = ++toastId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    };

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        const matchSearch = !q || c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
        const matchLocation = !filterLocation || c.location.toLowerCase().includes(filterLocation.toLowerCase());
        const matchDate = !filterDate || c.joinDate.toLowerCase().includes(filterDate.toLowerCase());
        return matchSearch && matchLocation && matchDate;
    });

    const openDeleteConfirm = (customer) => {
        setMenuOpenUid(null);
        setTimeout(() => setDeleteTarget(customer), 0);
    };

    const confirmDelete = () => {
        setCustomers((prev) => prev.filter((c) => c.uid !== deleteTarget.uid));
        pushToast(`Customer "${deleteTarget.name}" deleted successfully.`, "deleted");
        setDeleteTarget(null);
    };

    const cancelDelete = () => setDeleteTarget(null);

    // Navigate to CustomerDetails — strip the "#" so URL stays clean
    const handleRowClick = (customer) => {
        const cleanId = customer.id.replace("#", ""); // "C-004560"
        navigate(`/customers/${cleanId}`, { state: { customer } });
    };

    return (
        <div className="gc-page">
            {/* Toast */}
            <div className="gc-toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`gc-toast gc-toast--${t.type}`}>
                        <span className="gc-toast-icon">🗑</span>
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Top Bar */}
            <div className="gc-topbar">
                <div className="gc-search-wrap">
                    <svg className="gc-search-icon" width="20" height="20" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        className="gc-search-input"
                        placeholder="Search here....."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="gc-search-clear" onClick={() => setSearch("")}>×</button>
                    )}
                </div>
            </div>

            {/* Title + Filter */}
            <div className="gc-title-row">
                <div>
                    <h1 className="gc-title">General Customer</h1>
                    <p className="gc-subtitle">Here is your general customers list data</p>
                </div>

                <div className="gc-filter-wrap" ref={filterRef}>
                    <button
                        className={`gc-filter-btn ${filterLocation || filterDate ? "gc-filter-btn--active" : ""}`}
                        onClick={() => setShowFilter((v) => !v)}
                    >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                            <line x1="11" y1="18" x2="13" y2="18" />
                        </svg>
                        Filter
                        {(filterLocation || filterDate) && <span className="gc-filter-dot" />}
                    </button>

                    {showFilter && (
                        <div className="gc-filter-dropdown">
                            <div className="gc-filter-title">Filter Options</div>
                            <label className="gc-filter-label">Location</label>
                            <input className="gc-filter-input" placeholder="e.g. London" value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} />
                            <label className="gc-filter-label">Join Date (keyword)</label>
                            <input className="gc-filter-input" placeholder="e.g. March 2020" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                            <button className="gc-filter-clear" onClick={() => { setFilterLocation(""); setFilterDate(""); }}>Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="gc-table-wrap">
                <table className="gc-table">
                    <thead>
                        <tr className="gc-thead-row">
                            <th className="gc-th">Customer ID ▾</th>
                            <th className="gc-th">Join Date ▾</th>
                            <th className="gc-th">Customer Name ▾</th>
                            <th className="gc-th">Location ▾</th>
                            <th className="gc-th">Total Spent ▾</th>
                            <th className="gc-th">Last Order ▾</th>
                            <th className="gc-th"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="gc-no-results">
                                    <div className="gc-no-results-icon">🔍</div>
                                    No customers found matching your search.
                                </td>
                            </tr>
                        )}
                        {filtered.map((c) => (
                            <tr
                                key={c.uid}
                                className="gc-tr gc-tr--clickable"
                                onClick={() => handleRowClick(c)}
                                title={`View details for ${c.name}`}
                            >
                                <td className="gc-td">{c.id}</td>
                                <td className="gc-td">{c.joinDate}</td>
                                <td className="gc-td">{c.name}</td>
                                <td className="gc-td">{c.location}</td>
                                <td className="gc-td">{parseFloat(c.totalSpent).toFixed(2)}</td>
                                <td className="gc-td">{parseFloat(c.lastOrder).toFixed(2)}</td>
                                <td className="gc-td gc-td-action">
                                    <button
                                        className="gc-dots-btn"
                                        onClick={(e) => {
                                            // Stop propagation so row click doesn't also fire
                                            e.stopPropagation();
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const menuHeight = 50;
                                            const spaceBelow = window.innerHeight - rect.bottom;
                                            const top = spaceBelow < menuHeight ? rect.top - menuHeight - 6 : rect.bottom + 6;
                                            setMenuPos({ top, left: rect.right - 160 });
                                            setMenuOpenUid(menuOpenUid === c.uid ? null : c.uid);
                                        }}
                                    >
                                        ⋮
                                    </button>
                                    {menuOpenUid === c.uid && (
                                        <div className="gc-context-menu" style={{ top: menuPos.top, left: menuPos.left }}>
                                            <button
                                                className="gc-menu-item gc-menu-item--delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openDeleteConfirm(c);
                                                }}
                                            >
                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                    <path d="M10 11v6M14 11v6" />
                                                    <path d="M9 6V4h6v2" />
                                                </svg>
                                                Delete Customer
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DELETE CONFIRM DIALOG */}
            {deleteTarget && (
                <div className="gc-modal-overlay" onClick={cancelDelete}>
                    <div className="gc-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="gc-confirm-icon">🗑️</div>
                        <div className="gc-confirm-title">Delete Customer?</div>
                        <div className="gc-confirm-msg">
                            Are you sure you want to delete <strong>{deleteTarget.name}</strong> (<span className="gc-confirm-id">{deleteTarget.id}</span>)?
                            <br />This action cannot be undone.
                        </div>
                        <div className="gc-confirm-actions">
                            <button className="gc-btn-cancel" onClick={cancelDelete}>Cancel</button>
                            <button className="gc-btn-delete" onClick={confirmDelete}>
                                <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4h6v2" />
                                </svg>
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}