import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    FaExclamationTriangle, FaBell, FaBoxOpen, FaChartLine, FaArrowUp, FaDownload,
    FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTruck, FaCalendarAlt,
    FaClipboardList, FaTools, FaCheckCircle, FaExclamationCircle, FaUserTie, FaChevronDown,
    FaTimes, FaStore, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Inventory.css';

const Inventory = () => {
    const [activeCategory, setActiveCategory] = useState('All Items');
    const [supplierFilter, setSupplierFilter] = useState('ALL SUPPLIERS');
    const [isSupplierMenuOpen, setIsSupplierMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inventoryPage, setInventoryPage] = useState(1);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const supplierMenuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (supplierMenuRef.current && !supplierMenuRef.current.contains(event.target)) {
                setIsSupplierMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock Data for Inventory (Extended for Pagination)
    const [inventoryData, setInventoryData] = useState([
        { id: 'SKU-9901', name: 'Angus Beef Patties (8oz)', category: 'Protein', current: 12, target: 200, unit: 'lbs', price: 12.40, supplier: 'Midwest Meats Co.', leadTime: '2 Days', status: 'CRITICAL', img: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-4421', name: 'Industrial Pepperoni', category: 'Protein', current: 45, target: 150, unit: 'lbs', price: 8.50, supplier: 'Cured & Co.', leadTime: '4 Days', status: 'LOW STOCK', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-1102', name: 'Romaine Lettuce', category: 'Produce', current: 82, target: 100, unit: 'Cases', price: 24.00, supplier: 'Green Earth Produce', leadTime: '1 Day', status: 'OPTIMAL', img: 'https://images.pexels.com/photos/102123/pexels-photo-102123.jpeg' },
        { id: 'SKU-2289', name: 'Mozzarella Blend', category: 'Dairy', current: 140, target: 200, unit: 'lbs', price: 4.20, supplier: 'Dairy Direct', leadTime: '3 Days', status: 'OPTIMAL', img: 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-7734', name: 'Brioche Buns', category: 'Bakery', current: 300, target: 500, unit: 'Units', price: 0.85, supplier: 'Industrial Bakery', leadTime: '1 Day', status: 'OPTIMAL', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-8821', name: 'Alfonso Mangos', category: 'Produce', current: 15, target: 100, unit: 'Cases', price: 45.00, supplier: 'Green Earth Produce', leadTime: '2 Days', status: 'CRITICAL', img: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-5542', name: 'Whole Milk', category: 'Dairy', current: 60, target: 300, unit: 'Gallons', price: 3.50, supplier: 'Dairy Direct', leadTime: '1 Day', status: 'LOW STOCK', img: 'https://images.pexels.com/photos/5946755/pexels-photo-5946755.jpeg' },
        { id: 'SKU-3321', name: 'Cherry Tomatoes', category: 'Produce', current: 90, target: 100, unit: 'Kg', price: 12.00, supplier: 'Green Earth Produce', leadTime: '1 Day', status: 'OPTIMAL', img: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg' },
        { id: 'SKU-1190', name: 'Bacon Strips', category: 'Protein', current: 200, target: 200, unit: 'lbs', price: 15.00, supplier: 'Midwest Meats Co.', leadTime: '3 Days', status: 'OPTIMAL', img: 'https://images.pexels.com/photos/4110374/pexels-photo-4110374.jpeg' },
        { id: 'SKU-2211', name: 'Greek Yogurt', category: 'Dairy', current: 40, target: 200, unit: 'Units', price: 2.20, supplier: 'Dairy Direct', leadTime: '2 Days', status: 'LOW STOCK', img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-4433', name: 'Red Onions', category: 'Produce', current: 150, target: 300, unit: 'lbs', price: 1.50, supplier: 'Green Earth Produce', leadTime: '2 Days', status: 'LOW STOCK', img: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-6677', name: 'Cheddar Cheese', category: 'Dairy', current: 180, target: 200, unit: 'lbs', price: 9.00, supplier: 'Dairy Direct', leadTime: '3 Days', status: 'OPTIMAL', img: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=100&q=80' },
        { id: 'SKU-9900', name: 'Ribeye Steak', category: 'Protein', current: 8, target: 100, unit: 'lbs', price: 28.00, supplier: 'Midwest Meats Co.', leadTime: '5 Days', status: 'CRITICAL', img: 'https://images.pexels.com/photos/6542794/pexels-photo-6542794.jpeg' },
        { id: 'SKU-0012', name: 'Spinach Leaves', category: 'Produce', current: 50, target: 100, unit: 'Bags', price: 5.00, supplier: 'Green Earth Produce', leadTime: '1 Day', status: 'LOW STOCK', img: 'https://images.pexels.com/photos/8852027/pexels-photo-8852027.jpeg' },
        { id: 'SKU-8855', name: 'Sourdough Loaf', category: 'Bakery', current: 80, target: 100, unit: 'Units', price: 4.50, supplier: 'Industrial Bakery', leadTime: '1 Day', status: 'OPTIMAL', img: 'https://images.pexels.com/photos/4881595/pexels-photo-4881595.jpeg' }
    ]);

    const [suppliersData, setSuppliersData] = useState([
        { name: 'Midwest Meats Co.', contact: 'John Doe', email: 'john@midwestmeats.com', phone: '+1 234-567-8901', address: 'Chicago, IL', performance: '98%', status: 'active' },
        { name: 'Industrial Bakery', contact: 'Sarah Miller', email: 'orders@indbakery.com', phone: '+1 234-567-8902', address: 'Detroit, MI', performance: '95%', status: 'active' },
        { name: 'Green Earth Produce', contact: 'Mike Green', email: 'mike@greenearth.com', phone: '+1 234-567-8903', address: 'Bhubaneswar, IN', performance: '92%', status: 'active' },
        { name: 'Dairy Direct', contact: 'David White', email: 'orders@dairydirect.com', phone: '+1 234-567-8904', address: 'Madison, WI', performance: '99%', status: 'active' },
        { name: 'Cured & Co.', contact: 'Emma Wilson', email: 'emma@curedco.com', phone: '+1 234-567-8905', address: 'Austin, TX', performance: '88%', status: 'warning' }
    ]);

    const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
    const [editSupplierForm, setEditSupplierForm] = useState({
        name: '', contact: '', email: '', phone: '', address: '', performance: '', status: 'active'
    });

    const [newEntry, setNewEntry] = useState({
        name: '',
        category: 'Protein',
        current: '',
        target: '',
        unit: 'lbs',
        price: '',
        supplier: 'Midwest Meats Co.',
        leadTime: '1 Day',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'
    });

    const stats = [
        { label: 'TOTAL SKU ITEMS', value: inventoryData.length.toString(), sub: 'Items active', color: '#1F2937' },
        { label: 'LOW STOCK ALERTS', value: inventoryData.filter(i => i.status === 'LOW STOCK').length.toString(), sub: 'Requires attention', color: '#F97316' },
        { label: 'CRITICAL OUTAGE', value: inventoryData.filter(i => i.status === 'CRITICAL').length.toString(), sub: 'Out of stock', color: '#EF4444' },
        { label: 'MONTHLY SPEND', value: '$12.4k', sub: '↑ 4%', color: '#10B981' }
    ];

    const alerts = [
        { title: 'Angus Beef Outage', desc: 'Stock level reached 6%. Estimated outage: 4 hours. Automated reorder pending.', icon: <FaExclamationCircle />, type: 'critical' },
        { title: 'Low Pepperoni Stock', desc: 'Current supply 30% below par. Recommended reorder: 100 lbs.', icon: <FaExclamationTriangle />, type: 'warning' }
    ];

    const supplierFeed = [
        { name: 'Midwest Meats Co.', status: 'confirmed', text: '"Scheduled delivery for tomorrow 08:00 AM confirmed."', time: '10 mins ago', type: 'Shipping Update', dot: '#10B981' },
        { name: 'Industrial Bakery', status: 'billing', text: 'Invoice #8812 processed. Paid via Automated Clearing House.', time: '2 hours ago', type: 'Billing', dot: '#6366F1' },
        { name: 'Green Earth Produce', status: 'alert', text: '"Heads up: Shortage on Avocado expected next week due to season end."', time: '5 hours ago', type: 'Market Alert', dot: '#F97316' }
    ];

    const categories = ['All Items', 'Proteins', 'Produce', 'Dairy', 'Bakery'];

    const filteredInventory = useMemo(() => {
        return inventoryData.filter(item => {
            const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory.replace('s', '').replace('y', 'ie'); // Simple singular handling
            const matchesSupplier = supplierFilter === 'ALL SUPPLIERS' || item.supplier === supplierFilter;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSupplier && matchesSearch;
        });
    }, [activeCategory, supplierFilter, searchQuery, inventoryData]);

    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
    const paginatedInventory = filteredInventory.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE);

    const handleSaveEntry = (e) => {
        e.preventDefault();
        const stockRatio = parseInt(newEntry.current) / parseInt(newEntry.target);
        let status = 'OPTIMAL';
        if (stockRatio < 0.1) status = 'CRITICAL';
        else if (stockRatio < 0.4) status = 'LOW STOCK';

        const entryToAdd = {
            ...newEntry,
            id: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            current: parseInt(newEntry.current),
            target: parseInt(newEntry.target),
            price: parseFloat(newEntry.price),
            status: status
        };

        setInventoryData([entryToAdd, ...inventoryData]);
        toast.success(`Success! ${newEntry.name} added to inventory.`);
        setIsEntryModalOpen(false);
        setNewEntry({
            name: '', category: 'Protein', current: '', target: '', unit: 'lbs', price: '', supplier: 'Midwest Meats Co.', leadTime: '1 Day',
            img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'
        });
    };

    const handleExport = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 1500)),
            { loading: 'Generating Report...', success: 'Inventory Report Exported!', error: 'Export failed.' }
        );
    };

    const handleEditSupplier = (supplier) => {
        setEditSupplierForm({ ...supplier });
        setIsEditSupplierOpen(true);
    };

    const handleUpdateSupplier = (e) => {
        e.preventDefault();
        // Update both the suppliers list and any items in inventory using this supplier
        setSuppliersData(prev => prev.map(s => s.name === editSupplierForm.name ? editSupplierForm : s));

        // If the name changed (not recommended for simple demo but handling for completeness)
        // we would need to update inventoryData too, but here name is treated as unique ID

        toast.success(`Updated ${editSupplierForm.name} successfully!`);
        setIsEditSupplierOpen(false);
    };

    return (
        <div className="inventory-page-container">
            {/* Sidebar Section */}
            <aside className="inventory-sidebar">
                <div className="sidebar-section">
                    <div className="sidebar-header">
                        <span className="sidebar-title">PRIORITY ALERTS</span>
                        <span className="badge-action-needed">Action Needed</span>
                    </div>
                    <div className="alerts-list">
                        {alerts.map((alert, idx) => (
                            <div key={idx} className={`alert-card alert-${alert.type}`}>
                                <div className="alert-icon">{alert.icon}</div>
                                <div className="alert-info">
                                    <div className="alert-title">{alert.title}</div>
                                    <div className="alert-desc">{alert.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section mt-5">
                    <div className="sidebar-header">
                        <span className="sidebar-title">SUPPLIER FEED</span>
                    </div>
                    <div className="supplier-feed-list">
                        {supplierFeed.map((feed, idx) => (
                            <div key={idx} className="feed-card">
                                <div className="feed-header">
                                    <span className="feed-name">{feed.name}</span>
                                    <div className="status-dot" style={{ background: feed.dot }}></div>
                                </div>
                                <div className="feed-text">{feed.text}</div>
                                <div className="feed-footer">
                                    <span className="feed-time">{feed.time}</span>
                                    <span className="feed-dot-separator">•</span>
                                    <span className="feed-type">{feed.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-manage-suppliers" onClick={() => setIsSupplierModalOpen(true)}>
                    MANAGE SUPPLIERS
                </button>
            </aside>

            {/* Main Content Section */}
            <main className="inventory-main">
                <header className="inventory-header">
                    <div className="header-left">
                        <h1 className="main-title">INVENTORY & STOCK LEVELS</h1>
                        <p className="sub-title">Manage raw ingredients and supply chain for The Industrial Grill</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-export" onClick={handleExport}>
                            <FaDownload /> Export CSV
                        </button>
                        <button className="btn-new-entry" onClick={() => setIsEntryModalOpen(true)}>
                            <FaPlus /> New Entry
                        </button>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="stats-row">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="stat-card">
                            <span className="stat-label">{stat.label}</span>
                            <div className="stat-value-group">
                                <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
                                <span className="stat-sub">{stat.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Inventory Table Card */}
                <div className="inventory-card">
                    <div className="inventory-controls">
                        <div className="category-tabs">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
                                    onClick={() => { setActiveCategory(cat); setInventoryPage(1); }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="filter-supplier-group">
                            <span className="filter-label">Filter by Supplier:</span>
                            <div className="supplier-select-wrapper" ref={supplierMenuRef} onClick={() => setIsSupplierMenuOpen(!isSupplierMenuOpen)}>
                                <span className="selected-supplier">{supplierFilter}</span>
                                <FaChevronDown />
                                {isSupplierMenuOpen && (
                                    <div className="supplier-dropdown">
                                        {['ALL SUPPLIERS', ...suppliersData.map(s => s.name)].map(s => (
                                            <div
                                                key={s}
                                                className="dropdown-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSupplierFilter(s);
                                                    setInventoryPage(1);
                                                    setIsSupplierMenuOpen(false);
                                                }}
                                            >
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>INGREDIENT NAME</th>
                                    <th>CATEGORY</th>
                                    <th>STOCK LEVEL</th>
                                    <th>UNIT PRICE</th>
                                    <th>SUPPLIER INFO</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedInventory.map((item, idx) => (
                                    <tr key={item.id} className="inventory-row-v5">
                                        <td>
                                            <div className="ingredient-cell">
                                                <img src={item.img} alt={item.name} className="ingredient-img" />
                                                <div className="ingredient-info">
                                                    <div className="ingredient-name">{item.name}</div>
                                                    <div className="ingredient-sku">ID: {item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="category-txt">{item.category}</td>
                                        <td>
                                            <div className="stock-level-cell">
                                                <div className="stock-count">
                                                    <span className="current-stock">{item.current}</span> / <span className="target-stock">{item.target} {item.unit}</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div
                                                        className="progress-bar-fill"
                                                        style={{
                                                            width: `${Math.min(100, (item.current / item.target) * 100)}%`,
                                                            backgroundColor: item.status === 'CRITICAL' ? '#EF4444' : (item.status === 'LOW STOCK' ? '#F97316' : '#10B981')
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="price-cell">
                                                <div className="price-val">${item.price.toFixed(2)}</div>
                                                <div className="price-unit">/{item.unit.toLowerCase().replace('s', '').replace('units', 'u')}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="supplier-cell">
                                                <div className="supplier-name">{item.supplier}</div>
                                                <div className="lead-time">Lead: {item.leadTime}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge-v3 status-${item.status.replace(' ', '-').toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="inventory-footer">
                        <span className="showing-text">
                            SHOWING {(inventoryPage - 1) * ITEMS_PER_PAGE + 1} TO {Math.min(inventoryPage * ITEMS_PER_PAGE, filteredInventory.length)} OF {filteredInventory.length} ITEMS
                        </span>
                        <div className="pagination-v3">
                            <button
                                className="page-nav-btn"
                                onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                                disabled={inventoryPage === 1}
                            >
                                <FaChevronLeft />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`page-num ${inventoryPage === i + 1 ? 'active' : ''}`}
                                    onClick={() => setInventoryPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="page-nav-btn"
                                onClick={() => setInventoryPage(p => Math.min(totalPages, p + 1))}
                                disabled={inventoryPage === totalPages}
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* New Entry Modal */}
            {isEntryModalOpen && (
                <div className="premium-modal-overlay" onClick={() => setIsEntryModalOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-v5">
                            <div className="header-title-group">
                                <div className="modal-icon-wrap"><FaBoxOpen /></div>
                                <div>
                                    <h3>New Inventory Entry</h3>
                                    <p>Add fresh stock to the platform</p>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setIsEntryModalOpen(false)}><FaTimes /></button>
                        </div>
                        <form className="modal-form-v5" onSubmit={handleSaveEntry}>
                            <div className="form-grid-v5">
                                <div className="form-field">
                                    <label>Ingredient Name</label>
                                    <input type="text" placeholder="e.g. Blueberries" required value={newEntry.name} onChange={e => setNewEntry({ ...newEntry, name: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Category</label>
                                    <select value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })}>
                                        <option>Protein</option>
                                        <option>Produce</option>
                                        <option>Dairy</option>
                                        <option>Bakery</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Current Stock</label>
                                    <input type="number" placeholder="0" required value={newEntry.current} onChange={e => setNewEntry({ ...newEntry, current: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Target Level</label>
                                    <input type="number" placeholder="200" required value={newEntry.target} onChange={e => setNewEntry({ ...newEntry, target: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Unit Price ($)</label>
                                    <input type="number" step="0.01" placeholder="9.99" required value={newEntry.price} onChange={e => setNewEntry({ ...newEntry, price: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Measurement Unit</label>
                                    <select value={newEntry.unit} onChange={e => setNewEntry({ ...newEntry, unit: e.target.value })}>
                                        <option>lbs</option>
                                        <option>Cases</option>
                                        <option>Gallons</option>
                                        <option>Units</option>
                                        <option>Kg</option>
                                    </select>
                                </div>
                                <div className="form-field full-width">
                                    <label>Assigned Supplier</label>
                                    <select value={newEntry.supplier} onChange={e => setNewEntry({ ...newEntry, supplier: e.target.value })}>
                                        {suppliersData.map(s => <option key={s.name}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions-v5">
                                <button type="button" className="btn-cancel" onClick={() => setIsEntryModalOpen(false)}>Discard</button>
                                <button type="submit" className="btn-save-v5">Confirm Entry</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier Management Modal */}
            {isSupplierModalOpen && (
                <div className="premium-modal-overlay" onClick={() => setIsSupplierModalOpen(false)}>
                    <div className="premium-modal-content wide-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-v5">
                            <div className="header-title-group">
                                <div className="modal-icon-wrap" style={{ background: '#EEF2FF', color: '#6366F1' }}><FaStore /></div>
                                <div>
                                    <h3>Supplier Directory</h3>
                                    <p>Manage your ingredient supply chain partners</p>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setIsSupplierModalOpen(false)}><FaTimes /></button>
                        </div>
                        <div className="supplier-modal-body">
                            <div className="supplier-grid-v5">
                                {suppliersData.map((supplier, idx) => (
                                    <div key={idx} className="supplier-manage-card">
                                        <div className="sup-card-header">
                                            <div className="sup-name-group">
                                                <h4>{supplier.name}</h4>
                                                <span className={`sup-perf-badge perf-${supplier.performance.replace('%', '') > 90 ? 'good' : 'avg'}`}>
                                                    {supplier.performance} Reliability
                                                </span>
                                            </div>
                                            <div className={`sup-status-pill status-${supplier.status}`}>{supplier.status}</div>
                                        </div>
                                        <div className="sup-card-details">
                                            <div className="sup-detail-item"><FaUserTie /> {supplier.contact}</div>
                                            <div className="sup-detail-item"><FaEnvelope /> {supplier.email}</div>
                                            <div className="sup-detail-item"><FaPhone /> {supplier.phone}</div>
                                            <div className="sup-detail-item"><FaMapMarkerAlt /> {supplier.address}</div>
                                        </div>
                                        <div className="sup-card-actions">
                                            <button className="btn-msg-sup" onClick={() => toast(`Message to ${supplier.contact}...`)}>Message</button>
                                            <button className="btn-edit-sup" onClick={() => handleEditSupplier(supplier)}>Edit</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Supplier Modal */}
            {isEditSupplierOpen && (
                <div className="premium-modal-overlay" onClick={() => setIsEditSupplierOpen(false)}>
                    <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-v5">
                            <div className="header-title-group">
                                <div className="modal-icon-wrap" style={{ background: '#F0FDF4', color: '#16A34A' }}><FaTools /></div>
                                <div>
                                    <h3>Edit Supplier Details</h3>
                                    <p>Updating profile for {editSupplierForm.name}</p>
                                </div>
                            </div>
                            <button className="close-modal-btn" onClick={() => setIsEditSupplierOpen(false)}><FaTimes /></button>
                        </div>
                        <form className="modal-form-v5" onSubmit={handleUpdateSupplier}>
                            <div className="form-grid-v5">
                                <div className="form-field">
                                    <label>Contact Person</label>
                                    <input type="text" required value={editSupplierForm.contact} onChange={e => setEditSupplierForm({ ...editSupplierForm, contact: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Status</label>
                                    <select value={editSupplierForm.status} onChange={e => setEditSupplierForm({ ...editSupplierForm, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="warning">Warning</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label>Email Address</label>
                                    <input type="email" required value={editSupplierForm.email} onChange={e => setEditSupplierForm({ ...editSupplierForm, email: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Phone Number</label>
                                    <input type="text" required value={editSupplierForm.phone} onChange={e => setEditSupplierForm({ ...editSupplierForm, phone: e.target.value })} />
                                </div>
                                <div className="form-field full-width">
                                    <label>Warehouse Address</label>
                                    <input type="text" required value={editSupplierForm.address} onChange={e => setEditSupplierForm({ ...editSupplierForm, address: e.target.value })} />
                                </div>
                                <div className="form-field">
                                    <label>Reliability (%)</label>
                                    <input type="text" required value={editSupplierForm.performance} onChange={e => setEditSupplierForm({ ...editSupplierForm, performance: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-actions-v5">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditSupplierOpen(false)}>Discard</button>
                                <button type="submit" className="btn-save-v5" style={{ background: '#16A34A' }}>Update Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
