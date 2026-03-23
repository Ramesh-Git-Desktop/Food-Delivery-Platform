import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "../CSS/CustomerDetails.css";
import { FiSearch, FiBell } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";
import { HiOutlineClock } from "react-icons/hi";
import { MdDeliveryDining } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";

const CustomerDetails = () => {
    const { id } = useParams();                        // e.g. "C-004560"
    const { state } = useLocation();                  // { customer } passed from list
    const navigate = useNavigate();

    // Use customer data from navigation state if available
    const customer = state?.customer || null;

    const [orderStatus, setOrderStatus] = useState("pending");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [deliveryStatus, setDeliveryStatus] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const [estimatedTime, setEstimatedTime] = useState("12:54");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleCancelClick = () => setShowCancelModal(true);

    const handleDeliveryClick = () => {
        setShowDeliveryModal(true);
        setDeliveryStatus(orderStatus);
    };

    const handleConfirmCancel = () => {
        if (!cancelReason.trim()) {
            alert("Please select or enter a reason for cancellation");
            return;
        }
        setIsCancelling(true);
        setTimeout(() => {
            setOrderStatus("cancelled");
            setShowCancelModal(false);
            setIsCancelling(false);
            setCancelReason("");
            setSuccessMessage("Order has been cancelled successfully");
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        }, 1500);
    };

    const handleUpdateDeliveryStatus = () => {
        setIsUpdating(true);
        setTimeout(() => {
            setOrderStatus(deliveryStatus);
            setShowDeliveryModal(false);
            setIsUpdating(false);
            let message = "";
            if (deliveryStatus === "on-delivery") message = "Order is now out for delivery";
            else if (deliveryStatus === "delivered") { message = "Order has been marked as delivered"; setEstimatedTime("Delivered"); }
            setSuccessMessage(message);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        }, 1500);
    };

    const handleCloseModal = () => {
        setShowCancelModal(false);
        setCancelReason("");
        setShowDeliveryModal(false);
        setDeliveryStatus("");
    };

    const getDeliveryButtonText = () => {
        switch (orderStatus) {
            case "pending": return "Start Delivery";
            case "on-delivery": return "On Delivery";
            case "delivered": return "Delivered";
            case "cancelled": return "Cancelled";
            default: return "On Delivery";
        }
    };

    return (
        <div className="customer-wrapper">

            {/* ================= HEADER ================= */}
            <div className="top-section">
                <div className="header-top">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Back button */}
                        <button
                            onClick={() => navigate("/customers")}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: 6,
                                color: "#E53935", fontWeight: 700, fontSize: 14, padding: 0
                            }}
                        >
                            <FaArrowLeft size={14} /> Back
                        </button>
                        <h1 className="page-title">Customer Details</h1>
                    </div>
                    <div className="notification-icon">
                        <FiBell />
                        <span className="notification-dot"></span>
                    </div>
                </div>
                <div className="search-box">
                    <input placeholder="Search here......" />
                    <FiSearch className="search-icon" />
                </div>
            </div>

            {/* ================= ORDER INFO ROW ================= */}
            <div className="order-id-row">
                <div className="order-info">
                    {/* Show the actual customer ID from the URL param */}
                    <h3>Order ID # {id}</h3>
                    <p>
                        <span
                            className="order-text-red"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/customers")}
                        >
                            Order
                        </span>
                        /Order Details
                        {orderStatus === "cancelled" && <span className="cancelled-badge"> (Cancelled)</span>}
                        {orderStatus === "delivered" && <span className="delivered-badge"> (Delivered)</span>}
                        {orderStatus === "on-delivery" && <span className="delivery-badge"> (Out for Delivery)</span>}
                    </p>
                </div>

                <div className="order-actions">
                    <button
                        className="cancel-btn"
                        onClick={handleCancelClick}
                        disabled={orderStatus === "cancelled" || orderStatus === "delivered"}
                    >
                        Cancel Order
                    </button>
                    <button
                        className="delivery-btn"
                        onClick={handleDeliveryClick}
                        disabled={orderStatus === "cancelled" || orderStatus === "delivered"}
                    >
                        <span className="delivery-icon"><MdDeliveryDining /></span>
                        {getDeliveryButtonText()}
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            {showSuccessMessage && (
                <div className="success-toast">{successMessage}</div>
            )}

            <div className="main-layout">
                {/* ================= LEFT PANEL ================= */}
                <div className="left-panel">
                    <div className="profile-card">
                        <img
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            alt="profile"
                            className="profile-img"
                        />
                        {/* Show customer name from passed state, fallback to ID */}
                        <h4>{customer?.name || id}</h4>
                        <span className="customer-tag">Customer</span>
                        {customer?.location && (
                            <p style={{ fontSize: 12, color: "#888", marginTop: 4, textAlign: "center" }}>
                                {customer.location}
                            </p>
                        )}
                    </div>

                    <div className="note-wrapper">
                        <div className="note-top">
                            <h5>Note Order</h5>
                            <p>Food customization message.....</p>
                        </div>
                        <div className="note-address">
                            <div className="address-icon"><MdDeliveryDining /></div>
                            <div>
                                <p>{customer?.location || "6th Avenue, London"}</p>
                                <span>EC50 4GN</span>
                            </div>
                        </div>
                    </div>

                    <div className="history-card">
                        <h5>History</h5>

                        <div className="history-item">
                            <span className={`history-dot ${orderStatus === "delivered" ? "delivered" : "pending"}`}></span>
                            <div>
                                <p className="history-title">Order Delivered</p>
                                {orderStatus === "delivered" && (
                                    <span className="history-date">
                                        {new Date().toLocaleString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="history-item">
                            <span className={`history-dot ${orderStatus === "cancelled" ? "cancelled" : orderStatus === "delivered" ? "delivered" : orderStatus === "on-delivery" ? "active" : "pending"}`}></span>
                            <div>
                                <p className="history-title">
                                    {orderStatus === "cancelled" ? "Order Cancelled" : "On Delivery"}
                                </p>
                                {(orderStatus === "on-delivery" || orderStatus === "delivered") && (
                                    <span className="history-date">Sat, 25 Jul 2020, 01:24 PM</span>
                                )}
                            </div>
                        </div>

                        <div className="history-item">
                            <span className="history-dot pending"></span>
                            <div>
                                <p className="history-title">Payment Success</p>
                                <span className="history-date">Sat, 25 Jul 2020, 01:24 PM</span>
                            </div>
                        </div>

                        <div className="history-item">
                            <span className="history-dot pending"></span>
                            <div>
                                <p className="history-title">Order Created</p>
                                <span className="history-date">{customer?.joinDate || "Sat, 25 Jul 2020, 01:24 PM"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= RIGHT PANEL ================= */}
                <div className="right-panel">
                    {/* ORDER TABLE */}
                    <div className="order-table">
                        <div className="table-header">
                            <span>Items</span>
                            <span>Qty</span>
                            <span>Price</span>
                            <span>Total Price</span>
                            <span></span>
                        </div>

                        {[1, 2, 3].map((item) => (
                            <div className="table-row" key={item}>
                                <div className="item-info">
                                    <img src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=60&h=60&fit=crop" alt="food" />
                                    <div>
                                        <p className="item-name">Panner pizza</p>
                                        <small className="item-reviews">★★★★★ (456 review)</small>
                                    </div>
                                </div>
                                <span>5x</span>
                                <span>₹567</span>
                                <span>₹600</span>
                                <span className="delete-icon">⊖</span>
                            </div>
                        ))}
                    </div>

                    {/* MAP SECTION */}
                    <div className="map-wrapper">
                        <div className="map-box">
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019385934345!2d-122.41941568468155!3d37.77492977975911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c5f2f4f4b%3A0xabcdef!2sSan%20Francisco!5e0!3m2!1sen!2sin!4v1616580812345"
                                loading="lazy"
                            />
                        </div>

                        <div className="delivery-footer">
                            <p className="delivery-label">Delivery by</p>
                            <div className="delivery-bottom">
                                <div className="delivery-left">
                                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=55&h=55&fit=crop" alt="Kevin" />
                                    <div>
                                        <p className="driver-name">Kevin Hobs Jr.</p>
                                        <small>ID - 768990</small>
                                    </div>
                                </div>

                                <div className="delivery-right">
                                    <div className="info-box">
                                        <div className="icon-box"><BsTelephone /></div>
                                        <div>
                                            <small>Contact No</small>
                                            <p>9584778890</p>
                                        </div>
                                    </div>
                                    <div className="info-box">
                                        <div className="icon-box"><HiOutlineClock /></div>
                                        <div>
                                            <small>Delivery Time</small>
                                            <p>{estimatedTime}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= CANCEL ORDER MODAL ================= */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                        <h3>Cancel Order</h3>
                        <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="modal-form">
                            <label>Reason for cancellation *</label>
                            <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="modal-select">
                                <option value="">Select a reason</option>
                                <option value="Customer request">Customer request</option>
                                <option value="Out of stock">Out of stock</option>
                                <option value="Delivery issue">Delivery issue</option>
                                <option value="Payment failed">Payment failed</option>
                                <option value="Duplicate order">Duplicate order</option>
                                <option value="Other">Other</option>
                            </select>
                            {cancelReason === "Other" && (
                                <textarea placeholder="Please specify the reason..." value={cancelReason === "Other" ? cancelReason : ""} onChange={(e) => setCancelReason(e.target.value)} className="modal-textarea" rows="3" />
                            )}
                            <div className="modal-actions">
                                <button className="modal-cancel-btn" onClick={handleCloseModal} disabled={isCancelling}>No, Keep Order</button>
                                <button className="modal-confirm-btn" onClick={handleConfirmCancel} disabled={isCancelling || !cancelReason.trim()}>
                                    {isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELIVERY STATUS MODAL ================= */}
            {showDeliveryModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>×</button>
                        <h3>Update Delivery Status</h3>
                        <p>Update the current delivery status for this order.</p>
                        <div className="modal-form">
                            <label>Delivery Status</label>
                            <div className="delivery-status-options">
                                {["pending", "on-delivery", "delivered"].map((val) => (
                                    <label key={val} className={`status-option ${deliveryStatus === val ? "selected" : ""}`}>
                                        <input type="radio" name="deliveryStatus" value={val} checked={deliveryStatus === val} onChange={(e) => setDeliveryStatus(e.target.value)} />
                                        <span className={`status-dot ${val === "on-delivery" ? "active" : val}`}></span>
                                        <div className="status-info">
                                            <span className="status-title">{val === "on-delivery" ? "On Delivery" : val.charAt(0).toUpperCase() + val.slice(1)}</span>
                                            <span className="status-desc">
                                                {val === "pending" ? "Order is waiting to be picked up" : val === "on-delivery" ? "Order is out for delivery" : "Order has been delivered to customer"}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {deliveryStatus === "delivered" && (
                                <div className="delivery-confirmation">
                                    <label><input type="checkbox" /> Confirm customer received the order</label>
                                </div>
                            )}
                            <div className="modal-actions">
                                <button className="modal-cancel-btn" onClick={handleCloseModal} disabled={isUpdating}>Cancel</button>
                                <button className="modal-confirm-btn delivery-confirm" onClick={handleUpdateDeliveryStatus} disabled={isUpdating || !deliveryStatus || deliveryStatus === orderStatus}>
                                    {isUpdating ? "Updating..." : "Update Status"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;