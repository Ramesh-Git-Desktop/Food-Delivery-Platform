import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [addRiderCallback, setAddRiderCallback] = useState(null);
    const location = useLocation();

    // Handle responsive sidebar on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Collapse sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarCollapsed(true);
        }
    }, [location.pathname]);

    const handleToggleSidebar = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile backdrop */}
            <div
                className={`sidebar-backdrop ${!isSidebarCollapsed ? 'active' : ''}`}
                onClick={() => setIsSidebarCollapsed(true)}
            />

            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleToggleSidebar}
            />

            <main className="admin-main">
                <AdminHeader
                    onToggleSidebar={handleToggleSidebar}
                    onAddRider={addRiderCallback}
                />

                {/* Pages render here — they can register an onAddRider handler via context or props */}
                <div className="admin-content-inner">
                    {/* Outlet renders the matched child route */}
                    <Outlet context={{ setAddRiderCallback }} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;