// Dashboard.jsx (fixed)
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    FaArrowUp, FaEllipsisH, FaFilter, FaDownload, FaSearch,
    FaStar, FaUsers, FaShoppingBag, FaUtensils, FaChartBar,
    FaTruck, FaIdCard, FaUser, FaCog, FaBoxOpen, FaChevronDown, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const REVENUE_DATA = {
    '30 Days': {
        labels: ['Jan 20', 'Jan 25', 'Jan 30', 'Feb 05', 'Feb 10', 'Feb 15', 'Feb 19'],
        yLabels: ['$80k', '$60k', '$40k', '$20k', '$0'],
        values: [25000, 32000, 40000, 48000, 55000, 68000, 75000],
        max: 80000
    },
    '60 Days': {
        labels: ['Dec 20', 'Jan 01', 'Jan 15', 'Feb 01', 'Feb 19'],
        yLabels: ['$150k', '$112k', '$75k', '$37k', '$0'],
        values: [45000, 58000, 85000, 110000, 135000],
        max: 150000
    },
    '90 Days': {
        labels: ['Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'],
        yLabels: ['$250k', '$187k', '$125k', '$62k', '$0'],
        values: [80000, 120000, 185000, 215000],
        max: 250000
    },
    '1 Year': {
        labels: ['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
        yLabels: ['$2M', '$1.5M', '$1M', '$500k', '$0'],
        values: [600000, 950000, 1300000, 1550000, 1840000],
        max: 2000000
    }
};

const ALL_RESTAURANTS = [
    { name: 'Burger King', rating: 4.8, rev: '$45k Rev', percentage: 90, img: 'https://images.pexels.com/photos/6205791/pexels-photo-6205791.jpeg', meals: 1200, status: 'Open' },
    { name: 'Sushi Place', rating: 4.9, rev: '$38k Rev', percentage: 85, img: 'https://images.pexels.com/photos/10311486/pexels-photo-10311486.jpeg', meals: 850, status: 'Open' },
    { name: 'Pizza Hut', rating: 4.5, rev: '$32k Rev', percentage: 75, img: 'https://images.pexels.com/photos/4004463/pexels-photo-4004463.jpeg', meals: 2100, status: 'Closed' },
    { name: 'Taco Bell', rating: 4.2, rev: '$21k Rev', percentage: 60, img: 'https://images.pexels.com/photos/15434290/pexels-photo-15434290.jpeg', meals: 1560, status: 'Open' },
    { name: 'McDonalds', rating: 4.6, rev: '$52k Rev', percentage: 92, img: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', meals: 3400, status: 'Open' },
    { name: 'KFC', rating: 4.3, rev: '$28k Rev', percentage: 70, img: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg', meals: 1800, status: 'Open' },
    { name: 'Subway', rating: 4.7, rev: '$19k Rev', percentage: 65, img: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', meals: 1100, status: 'Closed' },
];

const Dashboard = ({ searchQuery = '', setSearchQuery }) => {
    const [revenueTimeframe, setRevenueTimeframe] = useState('30 Days');
    const [isRevenueMenuOpen, setIsRevenueMenuOpen] = useState(false);
    const [orderFilter, setOrderFilter] = useState('All');
    const [isOrderFilterOpen, setIsOrderFilterOpen] = useState(false);
    const [isResModalOpen, setIsResModalOpen] = useState(false);
    const [managingRestaurant, setManagingRestaurant] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);

    const revenueMenuRef = useRef(null);
    const orderFilterRef = useRef(null);

    const stats = [
        { label: 'Total Revenue', value: '$1,284,500', trend: '+12.5%', color: '#1E293B', data: [35, 25, 30, 20, 35, 10, 25] },
        { label: "Today's Orders", value: '3,450', trend: '+5.2%', color: '#3B82F6', data: [30, 20, 28, 22, 35, 15, 20] },
        { label: 'Active Users', value: '12,842', trend: '+8.1%', color: '#14B8A6', data: [35, 30, 25, 20, 15, 12, 10] },
        { label: 'Active Restaurants', value: '850', trend: '+2.4%', color: '#EE9C00', data: [30, 35, 32, 34, 28, 35, 30] },
    ];

    // Fix: Add safe checks for undefined values
    const filteredRestaurants = useMemo(() => {
        if (!searchQuery) return ALL_RESTAURANTS;
        return ALL_RESTAURANTS.filter(r =>
            r && r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const filteredOrders = useMemo(() => {
        const orders = [
            { id: '#ORD-0092', customer: 'John Doe', amount: '$45.00', status: 'Delivered', time: '2 min ago', av: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '#ORD-0091', customer: 'Sarah Smith', amount: '$28.50', status: 'Preparing', time: '15 min ago', av: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { id: '#ORD-0090', customer: 'Mike P.', amount: '$12.00', status: 'Cancelled', time: '1 hr ago', av: 'https://randomuser.me/api/portraits/men/85.jpg' },
            { id: '#ORD-0089', customer: 'David Lee', amount: '$67.20', status: 'On Route', time: '1.2 hr ago', av: 'https://randomuser.me/api/portraits/men/52.jpg' },
        ];

        return orders.filter(o => {
            if (!searchQuery) return orderFilter === 'All' || o.status === orderFilter;

            const matchesSearch = (o.customer && o.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (o.id && o.id.includes(searchQuery));
            const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, orderFilter]);

    const chartPoints = useMemo(() => {
        const data = REVENUE_DATA[revenueTimeframe];
        if (!data) return [];

        const width = 800;
        const height = 240;
        const spacing = width / (data.values.length - 1);
        return data.values.map((v, i) => ({
            x: i * spacing,
            y: height - (v / data.max * height),
            value: v,
            label: data.labels[i]
        }));
    }, [revenueTimeframe]);

    const chartPath = useMemo(() => {
        if (!chartPoints.length) return "";
        return chartPoints.reduce((acc, p, i) => {
            if (i === 0) return `M ${p.x} ${p.y}`;
            const prev = chartPoints[i - 1];
            const cp1x = prev.x + (p.x - prev.x) / 2;
            const cp2x = prev.x + (p.x - prev.x) / 2;
            return acc + ` C ${cp1x} ${prev.y}, ${cp2x} ${p.y}, ${p.x} ${p.y}`;
        }, "");
    }, [chartPoints]);

    const chartFillPath = useMemo(() => {
        if (!chartPoints.length) return "";
        return `${chartPath} L ${chartPoints[chartPoints.length - 1].x} 240 L 0 240 Z`;
    }, [chartPath, chartPoints]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (revenueMenuRef.current && !revenueMenuRef.current.contains(event.target)) {
                setIsRevenueMenuOpen(false);
            }
            if (orderFilterRef.current && !orderFilterRef.current.contains(event.target)) {
                setIsOrderFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isResModalOpen || managingRestaurant) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isResModalOpen, managingRestaurant]);

    const generatePath = (data) => {
        if (!data || !data.length) return "";
        const width = 100;
        const spacing = width / (data.length - 1);

        let path = `M0 ${data[0]}`;
        for (let i = 1; i < data.length; i++) {
            const cp1x = (i - 1) * spacing + spacing / 2;
            const cp1y = data[i - 1];
            const cp2x = (i - 1) * spacing + spacing / 2;
            const cp2y = data[i];
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${i * spacing} ${data[i]}`;
        }
        return path;
    };

    const handleDownloadReport = () => {
        toast.loading("Generating order report...", { duration: 1500 });
        setTimeout(() => {
            toast.success("Order report (CSV) downloaded successfully!");
        }, 1600);
    };

    return (
        <>
            <div className="dashboard-header-search">
                <div className="page-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="page-search-input"
                        placeholder="Search orders, restaurants or customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <section className="stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => toast(`Detailed stats for ${stat.label}`)}>
                        <div className="stat-header">
                            <span className="stat-label">{stat.label}</span>
                            <span className={`stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                                <FaArrowUp size={10} className="me-1" style={{ transform: stat.trend.startsWith('+') ? 'none' : 'rotate(180deg)' }} /> {stat.trend}
                            </span>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-chart">
                            <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path
                                    d={generatePath(stat.data)}
                                    fill="none"
                                    stroke={stat.color}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="sparkline-path"
                                />
                            </svg>
                        </div>
                    </div>
                ))}
            </section>

            <div className="dashboard-sections">
                {/* Revenue Widget */}
                <section className="section-card position-relative">
                    <div className="card-header">
                        <div>
                            <h2 className="card-title-main">Revenue Overview</h2>
                            <p className="card-subtitle">Showing {revenueTimeframe} Performance</p>
                        </div>
                        <div className="position-relative" ref={revenueMenuRef}>
                            <FaEllipsisH
                                className="cursor-pointer text-muted"
                                onClick={() => setIsRevenueMenuOpen(!isRevenueMenuOpen)}
                            />
                            {isRevenueMenuOpen && (
                                <div className="custom-dropdown revenue-dropdown">
                                    {['30 Days', '60 Days', '90 Days', '1 Year'].map(t => (
                                        <div
                                            key={t}
                                            className={`dropdown-item ${revenueTimeframe === t ? 'active' : ''}`}
                                            onClick={() => {
                                                setRevenueTimeframe(t);
                                                setIsRevenueMenuOpen(false);
                                                toast.success(`Data updated for ${t}`);
                                            }}
                                        >
                                            {t}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="revenue-chart-wrapper">
                        <div className="y-axis-labels">
                            {REVENUE_DATA[revenueTimeframe]?.yLabels.map(l => (
                                <span key={l}>{l}</span>
                            ))}
                        </div>
                        <div className="revenue-chart-container">
                            <svg width="100%" height="240" viewBox="0 0 800 240" preserveAspectRatio="none" className="revenue-svg">
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" style={{ stopColor: '#ee9c00', stopOpacity: 0.3 }} />
                                        <stop offset="100%" style={{ stopColor: '#ee9c00', stopOpacity: 0 }} />
                                    </linearGradient>
                                </defs>
                                {[60, 120, 180].map(y => (
                                    <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="2" strokeDasharray="5,5" />
                                ))}
                                {hoveredData !== null && chartPoints[hoveredData] && (
                                    <line x1={chartPoints[hoveredData].x} y1="0" x2={chartPoints[hoveredData].x} y2="240" stroke="#EE9C00" strokeWidth="1" strokeDasharray="4,4" />
                                )}
                                <path d={chartFillPath} fill="url(#grad1)" className="chart-transition" />
                                <path d={chartPath} fill="none" stroke="#ee9c00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="chart-transition" />
                                {chartPoints.map((p, i) => (
                                    <g key={i} onMouseEnter={() => setHoveredData(i)} onMouseLeave={() => setHoveredData(null)}>
                                        <circle cx={p.x} cy={p.y} r={hoveredData === i ? "8" : "5"} fill={hoveredData === i ? "#EE9C00" : "white"} stroke="#EE9C00" strokeWidth="3" className="chart-point" />
                                        <rect x={p.x - 40} y="0" width="80" height="240" fill="transparent" style={{ cursor: 'pointer' }} />
                                    </g>
                                ))}
                            </svg>
                            {hoveredData !== null && chartPoints[hoveredData] && (
                                <div
                                    className="chart-tooltip"
                                    style={{
                                        left: `${(chartPoints[hoveredData].x / 800) * 100}%`,
                                        top: `${chartPoints[hoveredData].y}px`
                                    }}
                                >
                                    <div className="tooltip-label">{chartPoints[hoveredData].label}</div>
                                    <div className="tooltip-value">${chartPoints[hoveredData].value.toLocaleString()}</div>
                                </div>
                            )}
                            <div className="chart-axis-labels">
                                {REVENUE_DATA[revenueTimeframe]?.labels.map(l => (
                                    <span key={l}>{l}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Top Restaurants Widget */}
                <section className="section-card top-restaurants-card">
                    <div className="card-header">
                        <h2 className="card-title-main">Top Restaurants</h2>
                        <button
                            className="view-all-link border-0 bg-transparent"
                            onClick={() => setIsResModalOpen(true)}
                        >
                            View All
                        </button>
                    </div>
                    <div className="restaurant-list">
                        {filteredRestaurants.slice(0, 4).map((res, idx) => (
                            <div key={idx} className="res-item cursor-pointer" onClick={() => toast(`Selected ${res.name}`)}>
                                <div className="res-img-wrap">
                                    <img src={res.img} alt={res.name} />
                                </div>
                                <div className="res-info-main">
                                    <div className="res-name-row">
                                        <span className="res-name-text">{res.name}</span>
                                        <span className="res-rating-text">{res.rating}</span>
                                    </div>
                                    <div className="rating-bar-container">
                                        <div className="rating-bar-fill" style={{ width: `${res.percentage}%` }}></div>
                                    </div>
                                    <div className="res-rev-text">{res.rev}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="dashboard-sections">
                {/* Orders Widget */}
                <section className="section-card" style={{ overflow: 'hidden' }}>
                    <div className="card-header">
                        <div>
                            <h2 className="card-title-main">Recent Orders</h2>
                            <p className="card-subtitle">Showing {orderFilter} orders</p>
                        </div>
                        <div className="d-flex gap-3 position-relative" ref={orderFilterRef}>
                            <FaFilter className={`cursor-pointer ${orderFilter !== 'All' ? 'text-primary' : 'text-muted'}`} onClick={() => setIsOrderFilterOpen(!isOrderFilterOpen)} />
                            {isOrderFilterOpen && (
                                <div className="custom-dropdown order-filter-dropdown">
                                    {['All', 'Delivered', 'Preparing', 'On Route', 'Cancelled'].map(f => (
                                        <div key={f} className={`dropdown-item ${orderFilter === f ? 'active' : ''}`} onClick={() => { setOrderFilter(f); setIsOrderFilterOpen(false); toast.success(`Filtering by ${f}`); }}>
                                            {f}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <FaDownload className="text-muted cursor-pointer" onClick={handleDownloadReport} />
                        </div>
                    </div>
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Time</th></tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order, idx) => (
                                    <tr key={idx} className="cursor-pointer hover-row" onClick={() => { toast.success(`Opening order ${order.id}`); }}>
                                        <td className="order-id-txt">{order.id}</td>
                                        <td><div className="cust-cell"><img src={order.av} alt={order.customer} className="cust-av" /><span>{order.customer}</span></div></td>
                                        <td className="fw-bold">{order.amount}</td>
                                        <td><span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span></td>
                                        <td className="text-muted">{order.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Health Widget */}
                <section className="section-card health-card">
                    <div className="card-header"><h2 className="card-title-main">Platform Health</h2></div>
                    <div className="health-metrics">
                        {[
                            { name: 'Order Success Rate', desc: 'Optimal performance', val: 92, color: '#f59e0b' },
                            { name: 'Courier Availability', desc: 'High demand in Downtown', val: 75, color: '#0ea5e9' },
                            { name: 'Server Load', desc: 'Stable, scaling up', val: 35, color: '#10b981' }
                        ].map((h, i) => (
                            <div key={i} className="health-item cursor-pointer" onClick={() => toast(`${h.name}: ${h.val}%`)}>
                                <div className="circular-progress">
                                    <svg width="60" height="60" viewBox="0 0 60 60">
                                        <circle className="circle-bg" cx="30" cy="30" r="24" />
                                        <circle
                                            className="circle-main"
                                            cx="30"
                                            cy="30"
                                            r="24"
                                            style={{
                                                strokeDasharray: `${2 * Math.PI * 24}`,
                                                strokeDashoffset: `${2 * Math.PI * 24 * (1 - h.val / 100)}`,
                                                stroke: h.color,
                                                transition: 'stroke-dashoffset 1s ease-in-out'
                                            }}
                                        />
                                    </svg>
                                    <span className="circle-text">{h.val}%</span>
                                </div>
                                <div className="health-info">
                                    <div className="health-name">{h.name}</div>
                                    <div className="health-desc" style={{ color: h.color }}>{h.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Restaurants Modal */}
            {isResModalOpen && (
                <div className="modal-overlay" onClick={() => {
                    setIsResModalOpen(false);
                    setManagingRestaurant(null);
                }}>
                    <div className="modal-content restaurant-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="d-flex align-items-center gap-3">
                                {managingRestaurant ? (
                                    <div className="modal-icon-wrap bg-primary" onClick={() => setManagingRestaurant(null)} style={{ cursor: 'pointer' }}>
                                        <FaChevronDown style={{ transform: 'rotate(90deg)' }} />
                                    </div>
                                ) : (
                                    <div className="modal-icon-wrap"><FaUtensils /></div>
                                )}
                                <div>
                                    <h2 className="modal-title">{managingRestaurant ? `Managing ${managingRestaurant.name}` : 'All Restaurants'}</h2>
                                    <p className="modal-subtitle">{managingRestaurant ? 'Update restaurant status and configurations' : 'Manage and monitor all partner restaurants'}</p>
                                </div>
                            </div>
                            <button className="modal-close-btn" onClick={() => {
                                setIsResModalOpen(false);
                                setManagingRestaurant(null);
                            }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            {managingRestaurant ? (
                                <div className="management-panel">
                                    <div className="manage-header-stats">
                                        <div className="manage-stat-box">
                                            <span className="manage-stat-label">Total Revenue</span>
                                            <span className="manage-stat-val text-primary">{managingRestaurant.rev}</span>
                                        </div>
                                        <div className="manage-stat-box">
                                            <span className="manage-stat-label">Rating</span>
                                            <span className="manage-stat-val text-warning">
                                                <FaStar size={14} className="me-1" /> {managingRestaurant.rating}
                                            </span>
                                        </div>
                                        <div className="manage-stat-box">
                                            <span className="manage-stat-label">Orders</span>
                                            <span className="manage-stat-val">1.2k</span>
                                        </div>
                                    </div>

                                    <div className="manage-form">
                                        <div className="form-group mb-4">
                                            <label className="d-block mb-2 fw-bold small">OPERATIONAL STATUS</label>
                                            <div className="d-flex gap-3">
                                                <button
                                                    className={`status-toggle-btn ${managingRestaurant.status === 'Open' ? 'active' : ''}`}
                                                    onClick={() => toast.success(`${managingRestaurant.name} is now LIVE`)}
                                                >
                                                    Open
                                                </button>
                                                <button
                                                    className={`status-toggle-btn ${managingRestaurant.status === 'Closed' ? 'active-closed' : ''}`}
                                                    onClick={() => toast.error(`${managingRestaurant.name} is now CLOSED`)}
                                                >
                                                    Closed
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="res-full-list">
                                    {ALL_RESTAURANTS.map((res, i) => (
                                        <div key={i} className="res-row-item">
                                            <div className="res-row-left">
                                                <img src={res.img} alt={res.name} className="res-row-img" />
                                                <div className="res-row-info">
                                                    <div className="res-row-name">{res.name}</div>
                                                    <div className="res-row-meta">
                                                        <span className="res-row-rating"><FaStar size={10} className="me-1" /> {res.rating}</span>
                                                        <span className="dot-sep">•</span>
                                                        <span className="res-row-meals">{res.meals} Meals</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="res-row-stats">
                                                <div className="res-row-rev">{res.rev}</div>
                                                <div className={`status-dot ${res.status === 'Open' ? 'status-open' : 'status-closed'}`}>
                                                    {res.status}
                                                </div>
                                            </div>
                                            <div className="res-row-actions">
                                                <button
                                                    className="row-action-btn"
                                                    onClick={() => {
                                                        setManagingRestaurant(res);
                                                        toast.success(`Managing ${res.name}`);
                                                    }}
                                                >
                                                    Manage
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            {managingRestaurant ? (
                                <button className="modal-primary-btn bg-dark" onClick={() => setManagingRestaurant(null)}>
                                    Back to List
                                </button>
                            ) : (
                                <button className="modal-primary-btn" onClick={() => setIsResModalOpen(false)}>
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;