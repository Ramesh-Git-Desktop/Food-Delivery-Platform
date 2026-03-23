import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaThLarge, FaShoppingBag, FaUtensils, FaListAlt, FaUsers,
    FaTruck, FaIdCard, FaUser, FaChartBar, FaCog, FaSignOutAlt,
    FaHamburger, FaStar, FaCrown, FaBoxOpen
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const menuItems = [
    { name: 'Dashboard', icon: <FaThLarge />, path: '/' },
    { name: 'Orders', icon: <FaShoppingBag />, path: '/orders-management' },
    { name: 'Restaurants', icon: <FaUtensils />, path: '/restaurant-management' },
    { name: 'Menu', icon: <FaListAlt />, path: '/menu' },
    { name: 'Customers', icon: <FaUsers />, path: '/customers' },
    { name: 'Delivery', icon: <FaTruck />, path: '/delivery' },
    { name: 'Drivers', icon: <FaIdCard />, path: '/admin-overview' },
    { name: 'User', icon: <FaUser />, path: '/user-management' },
    { name: 'Analytics', icon: <FaChartBar />, path: '/analytics-dashboard' },
    { name: 'Inventory', icon: <FaBoxOpen />, path: '/inventory' },
    { name: 'Reviews', icon: <FaStar />, path: '/reviews' },
    { name: 'Coupons', icon: <FaStar />, path: '/coupons-management' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
];

const AdminSidebar = ({ isCollapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        toast.success("Logging out...");
        setTimeout(() => {
            navigate("/login");
        }, 1000);
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="sidebar-logo"
                onClick={onToggle}
                style={{ cursor: 'pointer' }}
            >
                <div className="logo-icon">
                    <FaHamburger />
                </div>
                <div className="logo-details">
                    <span className="logo-text">FoodAdmin</span>
                    <div className="version-txt">v.2.4.0</div>
                </div>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <div
                        key={item.name}
                        className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => {
                            navigate(item.path);
                            toast(`Navigating to ${item.name}`, { icon: '🚀' });
                        }}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        <span>{item.name}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user-profile">
                    <div className="user-avatar-wrapper">
                        <img
                            src="https://images.pexels.com/photos/4342352/pexels-photo-4342352.jpeg"
                            alt="Admin"
                            className="footer-user-av"
                        />
                        <div className="user-status-dot"></div>
                    </div>
                    <div className="user-meta">
                        <span className="user-name-text">Umra M.</span>
                        <div className="admin-category-badge super-admin">
                            <FaCrown size={10} />
                            <span>Super Admin</span>
                        </div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt /> <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;