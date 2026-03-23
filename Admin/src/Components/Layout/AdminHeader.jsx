import React from 'react';
import { useLocation } from 'react-router-dom';
import {
    FaBars, FaBell, FaChevronDown, FaPlus
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Map route paths to display labels and subtitles
const PAGE_META = {
    '/': { title: 'Overview', subtitle: null },
    '/orders': { title: 'Orders', subtitle: null },
    '/restaurants': { title: 'Restaurants', subtitle: null },
    '/menu': { title: 'Menu', subtitle: null },
    '/customers': { title: 'Customers', subtitle: null },
    '/delivery': { title: 'Delivery Partners', subtitle: 'Manage fleet status, earnings and approvals.' },
    '/drivers': { title: 'Drivers', subtitle: null },
    '/user': { title: 'User', subtitle: null },
    '/analytics': { title: 'Analytics', subtitle: null },
    '/inventory': { title: 'Inventory', subtitle: null },
    '/reviews': { title: 'Reviews', subtitle: null },
    '/settings': { title: 'Settings', subtitle: null },
};

const AdminHeader = ({ onToggleSidebar, onAddRider }) => {
    const location = useLocation();
    const meta = PAGE_META[location.pathname] || { title: 'Dashboard', subtitle: null };
    const isDelivery = location.pathname === '/delivery';

    return (
        <header className="admin-header">
            <div className="header-left">
                <FaBars
                    className="menu-toggle"
                    onClick={onToggleSidebar}
                    style={{ cursor: 'pointer' }}
                />
                <div>
                    <h1 className="page-title">{meta.title}</h1>
                    {meta.subtitle && (
                        <p className="page-subtitle-header">{meta.subtitle}</p>
                    )}
                </div>
            </div>

            <div className="header-right">
                <div
                    className="notification-btn"
                    onClick={() =>
                        toast.info(
                            isDelivery
                                ? "3 new fleet alerts"
                                : location.pathname === '/reviews'
                                    ? "2 new reviews today"
                                    : "You have 3 new notifications"
                        )
                    }
                >
                    <FaBell />
                    <span className="notif-dot"></span>
                </div>

                {isDelivery && (
                    <button className="add-rider-btn" onClick={onAddRider}>
                        <FaPlus />
                        <span className="d-none-mobile">Add Rider</span>
                    </button>
                )}

                <div
                    className="user-profile"
                    onClick={() => toast("Profile settings", { icon: '👤' })}
                >
                    <img
                        src="https://images.pexels.com/photos/4342352/pexels-photo-4342352.jpeg"
                        alt="User"
                        className="user-av"
                    />
                    <span className="user-name">Umra M.</span>
                    <FaChevronDown size={12} />
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;