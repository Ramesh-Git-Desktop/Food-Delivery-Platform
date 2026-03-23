import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
    // Initial collapsed state based on screen width
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
        () => window.innerWidth < 1024
    );
    // Callback to be passed to the header's "Add Rider" button, set by child pages
    const [addRiderCallback, setAddRiderCallback] = useState(null);
    const location = useLocation();

    // Memoized toggle function to avoid re-renders
    const handleToggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    // Handle window resize – update collapsed state
    useEffect(() => {
        const handleResize = () => {
            setIsSidebarCollapsed(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Collapse sidebar on route change when on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarCollapsed(true);
        }
    }, [location.pathname]);

    // Context passed to child pages (via useOutletContext)
    const outletContext = useMemo(
        () => ({ setAddRiderCallback }),
        [setAddRiderCallback]
    );

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Mobile backdrop – closes sidebar when clicked */}
            <div
                className={`sidebar-backdrop ${!isSidebarCollapsed ? 'active' : ''}`}
                onClick={() => setIsSidebarCollapsed(true)}
                role="button"
                aria-label="Close sidebar"
            />

            <AdminSidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={handleToggleSidebar}
            />

            <main className="admin-main">
                <AdminHeader
                    onToggleSidebar={handleToggleSidebar}
                    onAddRider={addRiderCallback} // This function is set by child pages via outlet context
                />

                <div className="admin-content-inner">
                    {/* Child routes receive the context */}
                    <Outlet context={outletContext} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;