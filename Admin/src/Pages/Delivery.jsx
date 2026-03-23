import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    FiDownload, FiTruck, FiMaximize2, FiMinimize2,
    FiZoomIn, FiZoomOut, FiCheckCircle, FiAlertTriangle,
    FiNavigation, FiTrendingDown, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { BsBoxSeam } from "react-icons/bs";
import { MdOutlineSpeed } from "react-icons/md";
import "../CSS/Delivery.css";

/* ─── Data ───────────────────────────────────────────── */
const ALL_SHIPMENTS = [
    { id: "#ORD-8821", customer: "Helena Brauer", addr: "242 Oak St, Suite 4", driver: "Marcus J.", avatar: "MJ", status: "Out for Delivery" },
    { id: "#ORD-8794", customer: "Julian Casablancas", addr: "9th Avenue Loft", driver: "Sarah Lee", avatar: "SL", status: "Delayed" },
    { id: "#ORD-8750", customer: "Amara Walker", addr: "Central Park West", driver: "David K.", avatar: "DK", status: "Delivered" },
    { id: "#ORD-8742", customer: "Robert Chen", addr: "Kings Cross 12", driver: "Marcus J.", avatar: "MJ", status: "Delivered" },
    { id: "#ORD-8731", customer: "Sofia Martínez", addr: "88 Riverside Blvd", driver: "Sarah Lee", avatar: "SL", status: "Out for Delivery" },
    { id: "#ORD-8720", customer: "James Whitfield", addr: "14 Harbour View", driver: "David K.", avatar: "DK", status: "Delayed" },
    { id: "#ORD-8712", customer: "Yuki Tanaka", addr: "3 Blossom Court", driver: "Marcus J.", avatar: "MJ", status: "Delivered" },
    { id: "#ORD-8704", customer: "Leila Hassan", addr: "Crown Plaza, Floor 5", driver: "Sarah Lee", avatar: "SL", status: "Delivered" },
    { id: "#ORD-8698", customer: "Tom Archer", addr: "55 Wellington Rd", driver: "David K.", avatar: "DK", status: "Out for Delivery" },
    { id: "#ORD-8685", customer: "Priya Nair", addr: "Elmwood Terrace, Apt 2B", driver: "Marcus J.", avatar: "MJ", status: "Delayed" },
    { id: "#ORD-8671", customer: "Carlos Vega", addr: "Ocean Drive 202", driver: "Sarah Lee", avatar: "SL", status: "Delivered" },
    { id: "#ORD-8660", customer: "Emma Schulz", addr: "Bergstrasse 9", driver: "David K.", avatar: "DK", status: "Delivered" },
    { id: "#ORD-8644", customer: "Liam O'Brien", addr: "Phoenix Quay, Unit 7", driver: "Marcus J.", avatar: "MJ", status: "Out for Delivery" },
    { id: "#ORD-8630", customer: "Nia Owusu", addr: "Sunset Boulevard 310", driver: "Sarah Lee", avatar: "SL", status: "Delayed" },
];

const STATUS_CONFIG = {
    "Out for Delivery": { icon: <FiTruck size={12} />, cls: "badge--out", label: "Out for Delivery" },
    "Delayed": { icon: <FiAlertTriangle size={12} />, cls: "badge--delayed", label: "Delayed" },
    "Delivered": { icon: <FiCheckCircle size={12} />, cls: "badge--delivered", label: "Delivered" },
};

const ROWS_PER_PAGE = 5;

/* ─── Avatar ─────────────────────────────────────────── */
function Avatar({ initials, status }) {
    const cls = status === "Delayed" ? "av--warn" : status === "Delivered" ? "av--ok" : "av--go";
    return <span className={`dl-av ${cls}`}>{initials}</span>;
}

/* ─── Status Badge ───────────────────────────────────── */
function Badge({ status }) {
    const cfg = STATUS_CONFIG[status] || {};
    return (
        <span className={`dl-badge ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

/* ─── Map Component ──────────────────────────────────── */
// Dubai center: 25.2048, 55.2708
const DUBAI_CENTER = [25.2048, 55.2708];
const DUBAI_VEHICLES = [
    [25.2150, 55.2800], [25.1980, 55.2600], [25.2200, 55.2650],
    [25.1900, 55.2750], [25.2080, 55.2900], [25.2250, 55.2550],
    [25.1950, 55.2680], [25.2100, 55.2720], [25.2300, 55.2610],
    [25.1870, 55.2820], [25.2130, 55.2480], [25.2020, 55.2760],
];

function FleetMap({ fullscreen, onToggleFullscreen }) {
    const mapRef = useRef(null);
    const leafRef = useRef(null);

    const initMap = useCallback(() => {
        if (leafRef.current || !mapRef.current || !window.L) return;

        const map = window.L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
        }).setView(DUBAI_CENTER, 12);

        // OpenStreetMap tiles — always available, no API key needed
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
        }).addTo(map);

        // Vehicle markers (Dubai positions)
        const icon = window.L.divIcon({
            className: "",
            html: `<div class="map-marker"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
        });
        DUBAI_VEHICLES.forEach((pos) => window.L.marker(pos, { icon }).addTo(map));

        leafRef.current = map;
    }, []);

    useEffect(() => {
        if (window.L) { initMap(); return; }
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }
        // Load Leaflet JS
        if (!document.querySelector('script[src*="leaflet"]')) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = initMap;
            document.head.appendChild(script);
        }
    }, [initMap]);

    // Re-render map on fullscreen toggle
    useEffect(() => {
        if (!leafRef.current) return;
        setTimeout(() => { leafRef.current.invalidateSize(); }, 350);
    }, [fullscreen]);

    const zoomIn = () => { if (leafRef.current) leafRef.current.zoomIn(); };
    const zoomOut = () => { if (leafRef.current) leafRef.current.zoomOut(); };

    return (
        <div className={`dl-map-wrapper ${fullscreen ? "dl-map-wrapper--fs" : ""}`}>

            {/* Zoom buttons — top right */}
            <div className="dl-map-zoom-group">
                <button className="dl-zoom-btn" onClick={zoomIn} title="Zoom in" ><FiZoomIn size={15} /></button>
                <button className="dl-zoom-btn" onClick={zoomOut} title="Zoom out"><FiZoomOut size={15} /></button>
            </div>

            {/* Map canvas */}
            <div ref={mapRef} className="dl-map" />

            {/* Bottom overlay — ONE Live Fleet View label + Full Screen button */}
            <div className="dl-map-overlay-bot">
                <div className="dl-fleet-info">
                    <div>
                        <p className="dl-fleet-title">
                            <span className="dl-live-dot" />
                            Live Fleet View
                        </p>
                        <p className="dl-fleet-sub">12 vehicles currently in active rotation</p>
                    </div>
                </div>
                <button className="dl-fullscreen-btn" onClick={onToggleFullscreen}>
                    {fullscreen
                        ? <><FiMinimize2 size={14} /> Exit Full Screen</>
                        : <><FiMaximize2 size={14} /> Full Screen View</>}
                </button>
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────── */
export default function Delivery() {
    const [filter, setFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [mapFullscreen, setMapFS] = useState(false);

    const filters = ["All", "Active", "Delivered", "Delayed"];

    const filtered = ALL_SHIPMENTS.filter((s) => {
        if (filter === "All") return true;
        if (filter === "Active") return s.status === "Out for Delivery";
        if (filter === "Delivered") return s.status === "Delivered";
        if (filter === "Delayed") return s.status === "Delayed";
        return true;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const pageRows = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
    const handleFilter = (f) => { setFilter(f); setPage(1); };

    const exportCSV = () => {
        const header = "Order ID,Customer,Address,Driver,Status\n";
        const rows = filtered.map(r =>
            `${r.id},"${r.customer}","${r.addr}","${r.driver}","${r.status}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "shipments.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="dl-page">

            {/* ── Header ── */}
            <div className="dl-topbar">
                <div className="dl-topbar__left">
                    <h1 className="dl-title">Delivery Ledger</h1>
                    <p className="dl-subtitle">Real-time logistics and dispatch management.</p>
                </div>
                <div className="dl-filter-group">
                    {filters.map((f) => (
                        <button
                            key={f}
                            className={`dl-pill ${filter === f ? "dl-pill--active" : ""}`}
                            onClick={() => handleFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="row g-3 mb-3">

                {/* Left: Stats */}
                <div className="col-12 col-lg-3">
                    {/* Avg Delivery Time */}
                    <div className="dl-card dl-stat-card mb-3">
                        <div className="dl-stat-card__header">
                            <span className="dl-stat-label">AVG. DELIVERY TIME</span>
                            <span className="dl-stat-icon"><MdOutlineSpeed size={18} /></span>
                        </div>
                        <div className="dl-stat-value">24 <span className="dl-stat-unit">mins</span></div>
                        <div className="dl-stat-chip dl-stat-chip--green">
                            <FiTrendingDown size={12} /> 4m lower than avg.
                        </div>
                    </div>

                    {/* Route Efficiency */}
                    <div className="dl-card dl-route-card">
                        <div className="dl-route-header">
                            <FiNavigation size={16} className="dl-route-icon" />
                            <h3 className="dl-route-title">Route Efficiency</h3>
                        </div>
                        {[
                            { name: "Downtown Core", pct: 94, color: "green" },
                            { name: "North Industrial", pct: 78, color: "amber" },
                            { name: "East Harbour", pct: 88, color: "green" },
                        ].map(({ name, pct, color }) => (
                            <div className="dl-route-item" key={name}>
                                <div className="dl-route-row">
                                    <span className={`dl-route-dot dl-route-dot--${color}`} />
                                    <span className="dl-route-name">{name}</span>
                                    <span className="dl-route-pct">{pct}%</span>
                                </div>
                                <div className="dl-progress">
                                    <div className={`dl-progress__bar dl-progress__bar--${color}`} style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Table */}
                <div className="col-12 col-lg-9">
                    <div className="dl-card dl-table-card">
                        <div className="dl-table-topbar">
                            <h2 className="dl-table-title">Active Shipments</h2>
                            <button className="dl-export-btn" onClick={exportCSV}>
                                <FiDownload size={14} /> Export CSV
                            </button>
                        </div>

                        <div className="table-responsive">
                            <table className="dl-table">
                                <thead>
                                    <tr>
                                        <th>ORDER ID</th>
                                        <th>CUSTOMER</th>
                                        <th>DRIVER</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="dl-empty">
                                                <BsBoxSeam size={28} />
                                                <p>No shipments found.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        pageRows.map((row) => (
                                            <tr key={row.id} className="dl-table__row">
                                                <td><span className="dl-order-id">{row.id}</span></td>
                                                <td>
                                                    <p className="dl-cust-name">{row.customer}</p>
                                                    <p className="dl-cust-addr">{row.addr}</p>
                                                </td>
                                                <td>
                                                    <div className="dl-driver-cell">
                                                        <Avatar initials={row.avatar} status={row.status} />
                                                        <span className="dl-driver-name">{row.driver}</span>
                                                    </div>
                                                </td>
                                                <td><Badge status={row.status} /></td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="dl-pagination">
                            <span className="dl-pagination__info">
                                SHOWING {filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
                                {Math.min(page * ROWS_PER_PAGE, filtered.length)} OF {filtered.length} SHIPMENTS
                            </span>
                            <div className="dl-pagination__btns">
                                <button className="dl-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                                    <FiChevronLeft size={15} />
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        className={`dl-page-btn dl-page-btn--num ${page === p ? "dl-page-btn--active" : ""}`}
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button className="dl-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                                    <FiChevronRight size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Fleet Map ── */}
            <FleetMap
                fullscreen={mapFullscreen}
                onToggleFullscreen={() => setMapFS(f => !f)}
            />
        </div>
    );
}