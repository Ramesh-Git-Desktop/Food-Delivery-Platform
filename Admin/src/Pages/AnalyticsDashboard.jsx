import React, { useState, useRef } from "react";

import "../CSS/AnalyticsDashboard.css";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { FaFilePdf, FaFileExcel, FaEllipsisV } from "react-icons/fa";
import { BsCalendar3 } from "react-icons/bs";
import { IoChevronDown } from "react-icons/io5";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Top Performance Food Photo
import burger from "../assets/image/doubleburger.jpg";
import pizza from "../assets/image/Vegpizza.avif";
import sushi from "../assets/image/subwaylogo.jpg";
import taco from "../assets/image/tacologo.jpg";
import pasta from "../assets/image/pasta.jpg";
import bbq from "../assets/image/Spicywings.jpg";
import salad from "../assets/image/Chickencaesar.jpg";
import chicken from "../assets/image/Cheesenuggets.webp";
import dessert from "../assets/image/Goldenfries.jpg";
import cafe from "../assets/image/Coldcoffee.avif";

const topPerformers = [
    {
        id: 1,
        name: "Burger & Co.",
        orders: "1,240 Orders",
        revenue: "$14,203",
        profit: "+12%",
        image: burger,
    },
    {
        id: 2,
        name: "Pizza Paradise",
        orders: "980 Orders",
        revenue: "$12,100",
        profit: "+8%",
        image: pizza,
    },
    {
        id: 3,
        name: "Sushi World",
        orders: "1,520 Orders",
        revenue: "$18,450",
        profit: "+15%",
        image: sushi,
    },
    {
        id: 4,
        name: "Taco Fiesta",
        orders: "860 Orders",
        revenue: "$9,870",
        profit: "+6%",
        image: taco,
    },
    {
        id: 5,
        name: "Pasta House",
        orders: "1,100 Orders",
        revenue: "$13,900",
        profit: "+10%",
        image: pasta,
    },
    {
        id: 6,
        name: "BBQ Nation",
        orders: "1,340 Orders",
        revenue: "$16,720",
        profit: "+14%",
        image: bbq,
    },
    {
        id: 7,
        name: "Green Bowl",
        orders: "720 Orders",
        revenue: "$8,250",
        profit: "+5%",
        image: salad,
    },
    {
        id: 8,
        name: "Chicken Hub",
        orders: "1,460 Orders",
        revenue: "$17,300",
        profit: "+13%",
        image: chicken,
    },
    {
        id: 9,
        name: "Sweet Treats",
        orders: "640 Orders",
        revenue: "$7,400",
        profit: "+4%",
        image: dessert,
    },
    {
        id: 10,
        name: "Cafe Delight",
        orders: "890 Orders",
        revenue: "$10,550",
        profit: "+7%",
        image: cafe,
    },
];

/* ================= MINI CARD DATA ================= */

const revenueData = [
    { v: 20 },
    { v: 35 },
    { v: 25 },
    { v: 50 },
    { v: 45 },
    { v: 65 },
];
const ordersData = [
    { v: 15 },
    { v: 25 },
    { v: 40 },
    { v: 35 },
    { v: 50 },
    { v: 60 },
];
const avgData = [
    { v: 40 },
    { v: 35 },
    { v: 30 },
    { v: 28 },
    { v: 25 },
    { v: 27 },
];
const usersData = [
    { v: 10 },
    { v: 20 },
    { v: 30 },
    { v: 45 },
    { v: 55 },
    { v: 50 },
];

/* ================= MAIN GRAPH DATA ================= */

const mainData = [
    {
        name: "Oct 1",
        revenueGross: 10000,
        revenueNet: 9000,
        ordersGross: 120,
        ordersNet: 100,
        usersGross: 50,
        usersNet: 45,
        driversGross: 20,
        driversNet: 18,
        performanceGross: 70,
        performanceNet: 65,
    },
    {
        name: "Oct 5",
        revenueGross: 20000,
        revenueNet: 18000,
        ordersGross: 180,
        ordersNet: 160,
        usersGross: 80,
        usersNet: 70,
        driversGross: 35,
        driversNet: 30,
        performanceGross: 75,
        performanceNet: 70,
    },
    {
        name: "Oct 10",
        revenueGross: 28000,
        revenueNet: 25000,
        ordersGross: 240,
        ordersNet: 210,
        usersGross: 100,
        usersNet: 90,
        driversGross: 50,
        driversNet: 45,
        performanceGross: 82,
        performanceNet: 76,
    },
    {
        name: "Oct 15",
        revenueGross: 35000,
        revenueNet: 32000,
        ordersGross: 300,
        ordersNet: 270,
        usersGross: 140,
        usersNet: 130,
        driversGross: 70,
        driversNet: 60,
        performanceGross: 88,
        performanceNet: 82,
    },
    {
        name: "Oct 20",
        revenueGross: 42000,
        revenueNet: 39000,
        ordersGross: 380,
        ordersNet: 340,
        usersGross: 200,
        usersNet: 180,
        driversGross: 90,
        driversNet: 80,
        performanceGross: 92,
        performanceNet: 86,
    },
    {
        name: "Oct 25",
        revenueGross: 47000,
        revenueNet: 44000,
        ordersGross: 450,
        ordersNet: 400,
        usersGross: 250,
        usersNet: 220,
        driversGross: 120,
        driversNet: 105,
        performanceGross: 96,
        performanceNet: 90,
    },
    {
        name: "Oct 30",
        revenueGross: 47000,
        revenueNet: 44000,
        ordersGross: 450,
        ordersNet: 400,
        usersGross: 250,
        usersNet: 220,
        driversGross: 120,
        driversNet: 105,
        performanceGross: 96,
        performanceNet: 90,
    },
];

/* ================= HEAT MAP DATA ================= */

const heatData = [
    [1, 2, 3, 2, 4, 5, 4],
    [2, 3, 4, 3, 4, 5, 3],
    [3, 4, 5, 4, 3, 4, 2],
    [4, 5, 5, 5, 4, 3, 2],
    [3, 4, 5, 4, 3, 2, 1],
    [2, 3, 4, 3, 2, 1, 1],
];

const days = ["M", "T", "W", "T", "F", "S", "S"];
const times = ["12pm", "2pm", "4pm", "6pm", "8pm", "10pm"];

export default function AnalyticsDashboard() {
    // Peak Hours color
    const heatColors = [
        "#000000", // 0 safety
        "#000000", // 1 (Low)
        "#1f1f1f", // 2
        "#4b4b4b", // 3
        "#b45309", // 4
        "#f59e0b", // 5 (High)
    ];

    // calender
    function MonthCalendar() {
        const [month, setMonth] = useState("2023-10");
        const inputRef = useRef(null);

        const getMonthRangeText = (monthValue) => {
            const [year, mon] = monthValue.split("-").map(Number);

            const startDate = new Date(year, mon - 1, 1);
            const endDate = new Date(year, mon, 0);

            const formatDate = (date) =>
                date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                });

            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
        };

        const handleOpen = () => {
            if (inputRef.current) {
                inputRef.current.click(); // ✅ works everywhere
            }
        };

        return (
            <div className="month-pill" onClick={handleOpen}>
                <BsCalendar3 className="pill-icon" />
                <span className="pill-text">{getMonthRangeText(month)}</span>
                <IoChevronDown className="pill-arrow" />

                <input
                    ref={inputRef}
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="month-input"
                />
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState("revenue");
    const [showAll, setShowAll] = useState(false);
    const [viewFull, setViewFull] = useState(false);
    const dashboardRef = useRef(null);

    const [showModal, setShowModal] = useState(false);
    const [showAlertMenu, setShowAlertMenu] = useState(false);

    const [alertsData, setAlertsData] = useState([
        {
            id: 1,
            type: "danger",
            title: "High Cancellation Rate",
            message: "Zone B reported 15% cancellation in the last hour.",
            time: "10 mins ago",
            read: false,
        },
        {
            id: 2,
            type: "success",
            title: "Revenue Spike",
            message: "Crossed daily target of $50k ahead of schedule.",
            time: "2 hours ago",
            read: false,
        },
    ]);
    const handleMarkAllRead = () => {
        setAlertsData((prev) => prev.map((alert) => ({ ...alert, read: true })));
        setShowAlertMenu(false);
    };

    const handleClearAlerts = () => {
        if (window.confirm("Are you sure you want to clear all alerts?")) {
            setAlertsData([]);
        }
        setShowAlertMenu(false);
    };

    const handleExportPDF = async () => {
        const input = dashboardRef.current;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("AnalyticsDashboard.pdf");
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(mainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/octet-stream",
        });

        saveAs(blob, "AnalyticsDashboard.xlsx");
    };

    return (
        <div className="dashboard" ref={dashboardRef}>
            {/* HEADER */}
            <div className="header">
                <div className="header-left">
                    <p className="breadcrumb">
                        Dashboard &gt; <span>Analytics & Reports</span>
                    </p>
                    <h2>Platform Analytics</h2>
                </div>

                <div className="header-right">
                    <MonthCalendar />
                </div>
            </div>

            {/* CARDS */}
            <div className="cards">
                <Card
                    title="Total Revenue"
                    value="$1,240,500"
                    data={revenueData}
                    color="#9ca3af"
                    badge="↑ +12.5%"
                />
                <Card
                    title="Active Orders"
                    value="45,231"
                    data={ordersData}
                    color="#86efac"
                    badge="↑ +5.2%"
                />
                <Card
                    title="Avg. Order Value"
                    value="$27.50"
                    data={avgData}
                    color="#fdba74"
                    badge="↓ -1.4%"
                    red
                />
                <Card
                    title="New Users"
                    value="1,204"
                    data={usersData}
                    color="#a5b4fc"
                    badge="↑ +8.9%"
                />
            </div>

            {/* TABS */}
            <div className="tabs-wrapper">
                <div className="tabs">
                    {["revenue", "orders", "users", "drivers", "performance"].map(
                        (tab) => (
                            <button
                                key={tab}
                                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ),
                    )}
                </div>

                <div className="export">
                    <button className="pdf-btn" onClick={handleExportPDF}>
                        <FaFilePdf /> Export PDF
                    </button>
                    <button className="excel-btn" onClick={handleExportExcel}>
                        <FaFileExcel /> Export Excel
                    </button>
                </div>
            </div>

            <hr className="tab-divider" />

            {/* GRAPH SECTION */}
            <div className="graph-section">
                <div className="graph">
                    <div className="graph-header">
                        <div>
                            <h3>
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Trends
                            </h3>
                            <p>Gross vs Net over time</p>
                        </div>

                        <div className="custom-legend">
                            <span>
                                <span className="dot orange"></span> Gross
                            </span>
                            <span>
                                <span className="dot violet"></span> Net
                            </span>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={340}>
                        <AreaChart data={mainData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />

                            <Area
                                type="monotone"
                                dataKey={`${activeTab}Gross`}
                                stroke="#f97316"
                                fill="#f9731630"
                                strokeWidth={3}
                            />
                            <Area
                                type="monotone"
                                dataKey={`${activeTab}Net`}
                                stroke="#8b5cf6"
                                fill="#8b5cf630"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* PEAK HOURS */}
                {/* PEAK HOURS */}
                <div className="peak">
                    <div className="peak-header">
                        <div className="peak-left">
                            <h3>Peak Hours</h3>
                            <p>Traffic density by hour</p>
                        </div>

                        <span className="peak-right" onClick={() => setViewFull(!viewFull)}>
                            {viewFull ? "View Less" : "View Full"}
                        </span>
                    </div>

                    {/* DAYS HEADER */}
                    <div className="days">
                        <span></span>
                        {days.map((d, i) => (
                            <span key={i}>{d}</span>
                        ))}
                    </div>

                    {/* HEAT ROWS */}
                    {(viewFull ? heatData : heatData.slice(0, 4)).map((row, i) => (
                        <div key={i} className="heat-row">
                            <span className="time-label">{times[i]}</span>

                            {row.map((val, j) => (
                                <div
                                    key={j}
                                    className="heat-box"
                                    style={{ backgroundColor: heatColors[val] }}
                                />
                            ))}
                        </div>
                    ))}

                    {/* SCALE */}
                    <div className="scale">
                        <span className="scale-label">Low</span>
                        <div className="scale-bar"></div>
                        <span className="scale-label">High</span>
                    </div>
                </div>
            </div>

            {/* BOTTOM */}
            {/* ================= BOTTOM ================= */}
            <div className="bottom">
                {/* ================= TOP PERFORMERS ================= */}
                <div className="performers">
                    <div className="title">
                        <h3>Top Performers</h3>
                        <span onClick={() => setShowModal(true)}>View All</span>
                    </div>

                    {/* SHOW ONLY FIRST 2 */}
                    {topPerformers.slice(0, 3).map((item) => (
                        <div key={item.id} className="performer-card">
                            <div className="performer-left">
                                <div className="performer-img">
                                    <img src={item.image} alt={item.name} />
                                </div>

                                <div>
                                    <h4>{item.name}</h4>
                                    <p>{item.orders}</p>
                                </div>
                            </div>

                            <div className="performer-right">
                                <h4>{item.revenue}</h4>
                                <span className="profit">{item.profit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= SYSTEM ALERTS ================= */}
                <div className="alerts">
                    <div className="title">
                        <h3>
                            System Alerts{" "}
                            {alertsData.filter((a) => !a.read).length > 0 && (
                                <span style={{ color: "#ef4444", fontSize: "14px" }}>
                                    ({alertsData.filter((a) => !a.read).length})
                                </span>
                            )}
                        </h3>

                        <div className="dots-wrapper">
                            <FaEllipsisV onClick={() => setShowAlertMenu(!showAlertMenu)} />

                            {showAlertMenu && (
                                <div className="alert-menu">
                                    <div
                                        className="alert-menu-item"
                                        onClick={handleMarkAllRead} // ✅ added
                                    >
                                        <span className="menu-icon">✔</span>
                                        Mark All Read
                                    </div>

                                    <div className="menu-divider"></div>

                                    <div
                                        className="alert-menu-item danger"
                                        onClick={handleClearAlerts} // ✅ added
                                    >
                                        <span className="menu-icon">🗑</span>
                                        Clear Alerts
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {alertsData.length === 0 ? (
                        <p style={{ marginTop: "20px", color: "#777" }}>
                            No Alerts Available
                        </p>
                    ) : (
                        alertsData.map((alert, index) => (
                            <div
                                key={alert.id}
                                className={`alert-item ${alert.type} ${alert.read ? "read" : ""}`}
                            >
                                <div className="alert-left">
                                    <div className="alert-connector"></div>
                                    <div className={`alert-icon-box ${alert.type}`}>
                                        <div
                                            className={`alert-icon ${alert.type === "danger" ? "red" : "orange"}`}
                                        >
                                            {alert.type === "danger" ? "⚠" : "↗"}
                                        </div>
                                    </div>
                                </div>

                                <div className="alert-content">
                                    <h4>{alert.title}</h4>
                                    <p>{alert.message}</p>
                                    <span>{alert.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* All Top Performers */}
            {/* All Top Performers */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <h3>All Top Performers</h3>

                        {topPerformers.map((item) => (
                            <div key={item.id} className="performer-card">
                                <div className="performer-left">
                                    <div className="performer-img">
                                        <img src={item.image} alt={item.name} />
                                    </div>

                                    <div>
                                        <h4>{item.name}</h4>
                                        <p>{item.orders}</p>
                                    </div>
                                </div>

                                <div className="performer-right">
                                    <h4>{item.revenue}</h4>
                                    <span className="profit">{item.profit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function Card({ title, value, data, color, badge, red }) {
    return (
        <div className="card">
            <div className="card-top">
                <h4>{title}</h4>
                <span className={`badge ${red ? "red" : "green"}`}>{badge}</span>
            </div>
            <h3>{value}</h3>
            <ResponsiveContainer width="100%" height={60}>
                <BarChart data={data}>
                    <Bar dataKey="v" fill={color} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
