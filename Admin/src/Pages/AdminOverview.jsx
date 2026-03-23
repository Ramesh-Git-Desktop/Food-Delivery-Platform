import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    FaThLarge, FaShoppingBag, FaUtensils, FaListAlt, FaUsers,
    FaTruck, FaIdCard, FaUser, FaChartBar, FaCog, FaSignOutAlt,
    FaSearch, FaBell, FaChevronDown, FaBars, FaArrowUp, FaDownload,
    FaFilter, FaEllipsisH, FaHamburger, FaTimes, FaStar, FaUserShield, FaCrown,
    FaPlus, FaBicycle, FaMotorcycle, FaCar, FaEllipsisV, FaChevronLeft, FaChevronRight, FaMapMarkerAlt,
    FaCrosshairs, FaLayerGroup, FaPhone, FaTag, FaBoxOpen
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import '../CSS/AdminOverview.css';
import Inventory from '../Components/AdminOverrviewComponent/Inventory';

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

const AdminOverview = () => {
    const [activeMenu, setActiveMenu] = useState('Delivery');
    const [searchQuery, setSearchQuery] = useState('');
    // const [selectedOrder, setSelectedOrder] = useState(null); // Removed as it was unused

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [revenueTimeframe, setRevenueTimeframe] = useState('30 Days');
    const [isRevenueMenuOpen, setIsRevenueMenuOpen] = useState(false);
    const [orderFilter, setOrderFilter] = useState('All');
    const [isOrderFilterOpen, setIsOrderFilterOpen] = useState(false);
    const [isResModalOpen, setIsResModalOpen] = useState(false);
    const [managingRestaurant, setManagingRestaurant] = useState(null);
    const [hoveredData, setHoveredData] = useState(null);

    // Delivery Partners State
    const [riderTab, setRiderTab] = useState('Active Fleet');
    const [riderFilter, setRiderFilter] = useState('All');
    const [riderSearch, setRiderSearch] = useState('');
    const [riderSort, setRiderSort] = useState('Status');
    const [riderPage, setRiderPage] = useState(1);
    const [mapLayer, setMapLayer] = useState('standard');
    const [mapKey, setMapKey] = useState(() => Date.now());
    const [selectedRider, setSelectedRider] = useState(null);
    const [isAddRiderModalOpen, setIsAddRiderModalOpen] = useState(false);
    const [riderActionMenu, setRiderActionMenu] = useState(null);
    const [isAddingRider, setIsAddingRider] = useState(false);
    const [newRider, setNewRider] = useState({
        name: '',
        vehicleType: 'Bike',
        vehicle: '',
        phone: '',
        city: '',
        status: 'AVAILABLE',
        avatar: 'https://images.pexels.com/photos/4342352/pexels-photo-4342352.jpeg'
    });
    const [editingRider, setEditingRider] = useState(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatRider, setChatRider] = useState(null);
    const [chatMessage, setChatMessage] = useState('');

    const [ridersData, setRidersData] = useState([
        // Page 1
        { id: '#RK-9921', name: 'Alex Kowalski', vehicleType: 'Scooter', vehicle: 'E-Scooter', phone: '+1 (555) 012-3456', city: 'New York', status: 'ON DELIVERY', earn: 145.50, av: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: '#RK-8842', name: 'Sarah Jenkins', vehicleType: 'Bike', vehicle: 'Bicycle', phone: '+1 (555) 098-7654', city: 'Brooklyn', status: 'AVAILABLE', earn: 82.20, av: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: '#RK-7231', name: 'Michael Chen', vehicleType: 'Car', vehicle: 'Sedan', phone: '+1 (555) 111-2233', city: 'Queens', status: 'OFFLINE', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/85.jpg' },
        { id: '#RK-4412', name: 'David Ross', vehicleType: 'Bike', vehicle: 'E-Bike', phone: '+1 (555) 332-9988', city: 'Manhattan', status: 'ON DELIVERY', earn: 210.45, av: 'https://randomuser.me/api/portraits/men/52.jpg' },
        { id: '#RK-2291', name: 'Emma Wilson', vehicleType: 'Scooter', vehicle: 'Scooter', phone: '+1 (555) 774-1122', city: 'Bronx', status: 'AVAILABLE', earn: 45.00, av: 'https://randomuser.me/api/portraits/women/66.jpg' },

        // Page 2
        { id: '#RK-3345', name: 'Sophie Turner', vehicleType: 'Bike', vehicle: 'Road Bike', phone: '+1 (555) 667-8899', city: 'Manhattan', status: 'AVAILABLE', earn: 55.40, av: 'https://randomuser.me/api/portraits/women/22.jpg' },
        { id: '#RK-6678', name: 'Chris Evans', vehicleType: 'Car', vehicle: 'Hatchback', phone: '+1 (555) 554-3322', city: 'Staten Island', status: 'ON DELIVERY', earn: 190.20, av: 'https://randomuser.me/api/portraits/men/41.jpg' },
        { id: '#RK-1234', name: 'Ryan Reynolds', vehicleType: 'Scooter', vehicle: 'Vespa', phone: '+1 (555) 445-6677', city: 'Manhattan', status: 'AVAILABLE', earn: 125.00, av: 'https://randomuser.me/api/portraits/men/1.jpg' },
        { id: '#RK-5678', name: 'Gal Gadot', vehicleType: 'Car', vehicle: 'Tesla', phone: '+1 (555) 998-1122', city: 'Jersey City', status: 'ON DELIVERY', earn: 89.10, av: 'https://randomuser.me/api/portraits/women/2.jpg' },
        { id: '#RK-9012', name: 'Henry Cavill', vehicleType: 'Bike', vehicle: 'MTB', phone: '+1 (555) 221-3344', city: 'Astoria', status: 'OFFLINE', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/3.jpg' },

        // Page 3
        { id: '#RK-3456', name: 'Margot Robbie', vehicleType: 'Scooter', vehicle: 'E-Scoot', phone: '+1 (555) 556-7788', city: 'Brooklyn', status: 'AVAILABLE', earn: 67.50, av: 'https://randomuser.me/api/portraits/women/4.jpg' },
        { id: '#RK-7890', name: 'Robert Downey', vehicleType: 'Car', vehicle: 'Audi', phone: '+1 (555) 112-2233', city: 'Queens', status: 'ON DELIVERY', earn: 340.20, av: 'https://randomuser.me/api/portraits/men/5.jpg' },
        { id: '#RK-7789', name: 'Jessica Alba', vehicleType: 'Scooter', vehicle: 'Electric', phone: '+1 (555) 123-9988', city: 'Jersey City', status: 'AVAILABLE', earn: 112.50, av: 'https://randomuser.me/api/portraits/women/33.jpg' },
        { id: '#RK-4321', name: 'Chris Pratt', vehicleType: 'Bike', vehicle: 'Trek', phone: '+1 (555) 667-0099', city: 'Hoboken', status: 'AVAILABLE', earn: 45.20, av: 'https://randomuser.me/api/portraits/men/6.jpg' },
        { id: '#RK-1122', name: 'Brie Larson', vehicleType: 'Car', vehicle: 'Mini', phone: '+1 (555) 334-5566', city: 'Nolita', status: 'ON DELIVERY', earn: 198.00, av: 'https://randomuser.me/api/portraits/women/7.jpg' },

        // Queue (PENDING)
        { id: '#RK-1102', name: 'James Miller', vehicleType: 'Bike', vehicle: 'E-Bike', phone: '+1 (555) 998-3321', city: 'New York', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/12.jpg' },
        { id: '#RK-5563', name: 'Linda White', vehicleType: 'Car', vehicle: 'SUV', phone: '+1 (555) 443-2211', city: 'Queens', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/women/15.jpg' },
        { id: '#RK-8874', name: 'Robert Grey', vehicleType: 'Scooter', vehicle: 'Moped', phone: '+1 (555) 221-4455', city: 'Brooklyn', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/25.jpg' },
        { id: '#RK-8890', name: 'Paul Rudd', vehicleType: 'Bike', vehicle: 'Cruiser', phone: '+1 (555) 321-4455', city: 'Hoboken', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/62.jpg' },
        { id: '#RK-9901', name: 'Scarlett J.', vehicleType: 'Car', vehicle: 'Sedan', phone: '+1 (555) 776-5544', city: 'Newark', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/women/45.jpg' },
        { id: '#RK-1012', name: 'Tom Holland', vehicleType: 'Bike', vehicle: 'BMX', phone: '+1 (555) 998-0011', city: 'Astoria', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/men/18.jpg' },
        { id: '#RK-2023', name: 'Zendaya M.', vehicleType: 'Scooter', vehicle: 'Pro Scooter', phone: '+1 (555) 112-2233', city: 'Harlem', status: 'PENDING', earn: 0.00, av: 'https://randomuser.me/api/portraits/women/55.jpg' },
    ]);

    // Reviews State
    const [reviewFilter, setReviewFilter] = useState('All');
    const [reviewSearch, setReviewSearch] = useState('');
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewsData, setReviewsData] = useState([
        { id: '#C01234', name: 'Mohan Due', date: '22/03/2022', time: '12:00 PM', title: 'Friendly Services', rating: 4.0, comment: '"When service is delivered with sincerity and a positive attitude, it transforms ordinary moments into memorable experiences that inspire trust, loyalty, and lasting ..."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohan' },
        { id: '#C01235', name: 'John Doe', date: '23/03/2022', time: '01:30 PM', title: 'Quick Delivery', rating: 5.0, comment: '"The food was hot and delicious, and the delivery was much faster than expected. Great service overall!"', status: 'APPROVED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
        { id: '#C01236', name: 'Sarah Smith', date: '24/03/2022', time: '09:00 AM', title: 'Issues with Packaging', rating: 3.0, comment: '"The food was okay, but the packaging was leaked. I hope they improve it next time. Service was polite though."', status: 'REJECTED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: '#C01237', name: 'Robert Brown', date: '25/03/2022', time: '06:45 PM', title: 'Amazing Taste', rating: 5.0, comment: '"Best chicken biryani I have ever had! The spices were perfect. Highly recommend this place."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' },
        { id: '#C01238', name: 'Alice Wong', date: '26/03/2022', time: '11:15 AM', title: 'Late Delivery', rating: 2.0, comment: '"Food arrived cold and 45 minutes late. Not happy with the service today."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
        // Page 2 Data
        { id: '#C01239', name: 'Michael Chen', date: '27/03/2022', time: '02:00 PM', title: 'Great Portions', rating: 5.0, comment: '"The portion size was generous and the flavors were authentic. Will order again!"', status: 'APPROVED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
        { id: '#C01240', name: 'Emma Davis', date: '28/03/2022', time: '04:30 PM', title: 'Superb Quality', rating: 4.5, comment: '"Ingredients felt very fresh. The sushi was prepared with care."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
        { id: '#C01241', name: 'David Wilson', date: '29/03/2022', time: '08:15 PM', title: 'Average Experience', rating: 3.0, comment: '"Nothing special. The pasta was a bit overcooked but edible."', status: 'REJECTED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
        { id: '#C01242', name: 'Sophia Miller', date: '30/03/2022', time: '10:00 AM', title: 'Very Helpful', rating: 5.0, comment: '"The delivery person went above and beyond to find my apartment building. Excellent service!"', status: 'APPROVED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia' },
        { id: '#C01243', name: 'James Taylor', date: '31/03/2022', time: '01:20 PM', title: 'Wrong Order', rating: 1.0, comment: '"I received someone else\'s order. Very disappointed."', status: 'REJECTED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
        // Page 3 Data
        { id: '#C01244', name: 'Olivia Garcia', date: '01/04/2022', time: '03:45 PM', title: 'Tasty snacks', rating: 4.0, comment: '"The spring rolls were crispy and delicious. Perfect for a quick bite."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia' },
        { id: '#C01245', name: 'Liam Martinez', date: '02/04/2022', time: '05:55 PM', title: 'Authentic Flavor', rating: 5.0, comment: '"Reminds me of home. The curry had the perfect balance of spices."', status: 'APPROVED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
        { id: '#C01246', name: 'Charlotte Clark', date: '03/04/2022', time: '07:10 PM', title: 'A bit pricey', rating: 3.5, comment: '"Good food but definitely on the expensive side for the quantity."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte' },
        { id: '#C01247', name: 'Benjamin Lee', date: '04/04/2022', time: '09:30 PM', title: 'Late Night Savior', rating: 5.0, comment: '"Only place open at 2 AM and still serving quality food. Thank you!"', status: 'APPROVED', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin' },
        { id: '#C01248', name: 'Amelia Hall', date: '05/04/2022', time: '11:40 AM', title: 'Healthy choices', rating: 4.5, comment: '"Loved the salad options. Refreshing and filling."', status: 'PENDING', av: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amelia' }
    ]);

    const handleAddRider = (e) => {
        e.preventDefault();

        // Validation
        if (!newRider.name || !newRider.phone || !newRider.city || !newRider.vehicle) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsAddingRider(true);
        const loadingToast = toast.loading(editingRider ? "Updating rider info..." : "Enrolling new rider...");

        setTimeout(() => {
            if (editingRider) {
                setRidersData(ridersData.map(r => r.id === editingRider.id ? { ...newRider, id: r.id, earn: r.id === editingRider.id ? r.earn : 0, av: r.av } : r));
                setIsAddRiderModalOpen(false);
                setEditingRider(null);
                toast.success(`${newRider.name} updated successfully!`);
            } else {
                const riderToAdd = {
                    ...newRider,
                    id: `#RK-${Math.floor(1000 + Math.random() * 9000)}`,
                    earn: 0.00,
                    av: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newRider.name}`
                };

                setRidersData([riderToAdd, ...ridersData]);
                setIsAddRiderModalOpen(false);
                toast.success(`${newRider.name} added to the fleet!`);
            }
            setIsAddingRider(false);
            toast.dismiss(loadingToast);
            setNewRider({
                name: '',
                vehicleType: 'Bike',
                vehicle: '',
                phone: '',
                city: '',
                status: 'AVAILABLE',
                avatar: 'https://images.pexels.com/photos/4342352/pexels-photo-4342352.jpeg'
            });
        }, 1200);
    };

    const handleEditRider = (rider) => {
        setNewRider({
            name: rider.name,
            vehicleType: rider.vehicleType,
            vehicle: rider.vehicle,
            phone: rider.phone,
            city: rider.city,
            status: rider.status,
            avatar: rider.av
        });
        setEditingRider(rider);
        setIsAddRiderModalOpen(true);
        setRiderActionMenu(null);
    };

    const handleMessageRider = (rider) => {
        setChatRider(rider);
        setIsChatModalOpen(true);
        setRiderActionMenu(null);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;

        toast.success(`Message sent to ${chatRider.name}`);
        setChatMessage('');
        setIsChatModalOpen(false);
    };

    const handleDeleteRider = (id) => {
        setRidersData(ridersData.filter(r => r.id !== id));
        setRiderActionMenu(null);
        toast.success("Rider removed successfully");
    };

    const handleApproveRider = (id) => {
        setRidersData(ridersData.map(r =>
            r.id === id ? { ...r, status: 'AVAILABLE' } : r
        ));
        setRiderActionMenu(null);
        toast.success("Rider approved and added to fleet!");
    };

    const handleRejectRider = (id) => {
        setRidersData(ridersData.filter(r => r.id !== id));
        setRiderActionMenu(null);
        toast.error("Rider application rejected");
    };

    const pendingCount = useMemo(() =>
        ridersData.filter(r => r.status === 'PENDING').length,
        [ridersData]);

    const activeFleetStats = useMemo(() => {
        const stats = {
            active: 0,
            available: 0,
            offline: 0
        };
        ridersData.forEach(r => {
            if (r.status === 'ON DELIVERY') stats.active++;
            else if (r.status === 'AVAILABLE') stats.available++;
            else if (r.status === 'OFFLINE') stats.offline++;
        });
        return stats;
    }, [ridersData]);



    const handleSwitchLayer = () => {
        const layers = ['standard', 'satellite', 'dark'];
        const next = layers[(layers.indexOf(mapLayer) + 1) % layers.length];
        setMapLayer(next);
        toast.info(`Switched to ${next} view`, { icon: '🗺️' });
    };

    const handleCenterMap = () => {
        setMapKey(Date.now()); // Forces iframe reload to original center
        toast.success("Centering map on fleet hotspots...", { icon: '🎯' });
    };

    const revenueMenuRef = useRef(null);
    const orderFilterRef = useRef(null);

    // Handle responsive sidebar and resize events
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (revenueMenuRef.current && !revenueMenuRef.current.contains(event.target)) {
                setIsRevenueMenuOpen(false);
            }
            if (orderFilterRef.current && !orderFilterRef.current.contains(event.target)) {
                setIsOrderFilterOpen(false);
            }
            if (riderActionMenu !== null && !event.target.closest('.action-menu-container')) {
                setRiderActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [riderActionMenu]);

    // Lock body scroll when mobile sidebar or modal is open
    useEffect(() => {
        if ((!isSidebarCollapsed && window.innerWidth < 1024) || isResModalOpen || managingRestaurant) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isSidebarCollapsed, isResModalOpen, managingRestaurant]);

    const menuItems = [
        { name: 'Dashboard', icon: <FaThLarge /> },
        { name: 'Orders', icon: <FaShoppingBag /> },
        { name: 'Restaurants', icon: <FaUtensils /> },
        { name: 'Menu', icon: <FaListAlt /> },
        { name: 'Customers', icon: <FaUsers /> },
        { name: 'Delivery', icon: <FaTruck /> },
        { name: 'Drivers', icon: <FaIdCard /> },
        { name: 'User', icon: <FaUser /> },
        { name: 'Analytics', icon: <FaChartBar /> },
        { name: 'Inventory', icon: <FaBoxOpen /> },
        { name: 'Reviews', icon: <FaStar /> },
        { name: 'Settings', icon: <FaCog /> },
    ];

    const stats = [
        { label: 'Total Revenue', value: '$1,284,500', trend: '+12.5%', color: '#1E293B', data: [35, 25, 30, 20, 35, 10, 25] },
        { label: "Today's Orders", value: '3,450', trend: '+5.2%', color: '#3B82F6', data: [30, 20, 28, 22, 35, 15, 20] },
        { label: 'Active Users', value: '12,842', trend: '+8.1%', color: '#14B8A6', data: [35, 30, 25, 20, 15, 12, 10] },
        { label: 'Active Restaurants', value: '850', trend: '+2.4%', color: '#EE9C00', data: [30, 35, 32, 34, 28, 35, 30] },
    ];


    const chartPoints = useMemo(() => {
        const data = REVENUE_DATA[revenueTimeframe];
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



    const filteredRestaurants = useMemo(() => {
        return ALL_RESTAURANTS.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [searchQuery]);

    const filteredOrders = useMemo(() => {
        const orders = [
            { id: '#ORD-0092', customer: 'John Doe', amount: '$45.00', status: 'Delivered', time: '2 min ago', av: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { id: '#ORD-0091', customer: 'Sarah Smith', amount: '$28.50', status: 'Preparing', time: '15 min ago', av: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { id: '#ORD-0090', customer: 'Mike P.', amount: '$12.00', status: 'Cancelled', time: '1 hr ago', av: 'https://randomuser.me/api/portraits/men/85.jpg' },
            { id: '#ORD-0089', customer: 'David Lee', amount: '$67.20', status: 'On Route', time: '1.2 hr ago', av: 'https://randomuser.me/api/portraits/men/52.jpg' },
        ];
        return orders.filter(o => {
            const matchesSearch = o.customer.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery);
            const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
            return matchesSearch && matchesFilter;
        });
    }, [searchQuery, orderFilter]);

    const { paginatedRiders, totalRiderPages } = useMemo(() => {
        let result = ridersData.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(riderSearch.toLowerCase()) || r.id.includes(riderSearch);
            const matchesFilter = riderFilter === 'All' || r.vehicleType === riderFilter;
            const matchesTab = riderTab === 'Active Fleet' ? (r.status !== 'PENDING') : (r.status === 'PENDING');
            return matchesSearch && matchesFilter && matchesTab;
        });

        // Sorting
        result.sort((a, b) => {
            if (riderSort === 'Status') return a.status.localeCompare(b.status);
            if (riderSort === 'Earnings') return b.earn - a.earn;
            if (riderSort === 'Name') return a.name.localeCompare(b.name);
            return 0;
        });

        const total = Math.ceil(result.length / 5);
        const sliced = result.slice((riderPage - 1) * 5, riderPage * 5);

        return { paginatedRiders: sliced, totalRiderPages: total };
    }, [ridersData, riderSearch, riderFilter, riderSort, riderTab, riderPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalRiderPages) {
            setRiderPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleRiderFilter = (type) => {
        if (riderFilter === type) {
            setRiderFilter('All');
        } else {
            setRiderFilter(type);
            toast(`Filtering for ${type}s`);
        }
    };

    const handleSortCycle = () => {
        const options = ['Status', 'Name', 'Earnings'];
        const next = options[(options.indexOf(riderSort) + 1) % options.length];
        setRiderSort(next);
        toast(`Sorting by ${next}`);
    };

    const handleLogout = () => {
        toast.success("Logging out...");
        setTimeout(() => {
            window.location.href = "/";
        }, 1000);
    };

    const handleDownloadReport = () => {
        toast.loading("Generating order report...", { duration: 1500 });
        setTimeout(() => {
            toast.success("Order report (CSV) downloaded successfully!");
        }, 1600);
    };

    const generatePath = (data) => {
        if (!data.length) return "";
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

    const handleApproveReview = (id) => {
        setReviewsData(reviewsData.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r));
        toast.success("Review approved successfully!");
    };

    const handleRejectReview = (id) => {
        setReviewsData(reviewsData.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
        toast.error("Review archived/rejected");
    };

    const { paginatedReviews, totalReviewPages } = useMemo(() => {
        const filtered = reviewsData.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                r.id.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                r.title.toLowerCase().includes(reviewSearch.toLowerCase());
            const matchesFilter = reviewFilter === 'All' ||
                (reviewFilter === 'Approve' && r.status === 'APPROVED') ||
                (reviewFilter === 'Pending' && r.status === 'PENDING') ||
                (reviewFilter === 'Reject' && r.status === 'REJECTED');
            return matchesSearch && matchesFilter;
        });
        const total = Math.ceil(filtered.length / 5);
        const sliced = filtered.slice((reviewPage - 1) * 5, reviewPage * 5);
        return { paginatedReviews: sliced, totalReviewPages: total };
    }, [reviewsData, reviewSearch, reviewFilter, reviewPage]);

    return (
        <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>


            {/* Main Content */}
            <main className="admin-main">

                <div className="admin-content-inner" style={{ padding: activeMenu === 'Inventory' ? '0' : undefined }}>
                    {activeMenu === 'Dashboard' && (
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
                                            {REVENUE_DATA[revenueTimeframe].yLabels.map(l => (
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
                                                {hoveredData !== null && (
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
                                            {hoveredData !== null && (
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
                                                {REVENUE_DATA[revenueTimeframe].labels.map(l => (
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
                                        {[{ name: 'Order Success Rate', desc: 'Optimal performance', val: 92, color: '#f59e0b' }, { name: 'Courier Availability', desc: 'High demand in Downtown', val: 75, color: '#0ea5e9' }, { name: 'Server Load', desc: 'Stable, scaling up', val: 35, color: '#10b981' }].map((h, i) => (
                                            <div key={i} className="health-item cursor-pointer" onClick={() => toast(`${h.name}: ${h.val}%`)}>
                                                <div className="circular-progress">
                                                    <svg width="60" height="60" viewBox="0 0 60 60"><circle className="circle-bg" cx="30" cy="30" r="24" /><circle className="circle-main" cx="30" cy="30" r="24" style={{ strokeDasharray: `${2 * Math.PI * 24}`, strokeDashoffset: `${2 * Math.PI * 24 * (1 - h.val / 100)}`, stroke: h.color, transition: 'stroke-dashoffset 1s ease-in-out' }} /></svg>
                                                    <span className="circle-text">{h.val}%</span>
                                                </div>
                                                <div className="health-info"><div className="health-name">{h.name}</div><div className="health-desc" style={{ color: h.color }}>{h.desc}</div></div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </>
                    )}

                    {activeMenu === 'Delivery' && (
                        <div className="delivery-view-container">

                            {/* Tabs */}
                            <div className="delivery-tabs">
                                <button
                                    className={`delivery-tab ${riderTab === 'Active Fleet' ? 'active' : ''}`}
                                    onClick={() => setRiderTab('Active Fleet')}
                                >
                                    Active Fleet
                                </button>
                                <button
                                    className={`delivery-tab ${riderTab === 'Approval Queue' ? 'active' : ''}`}
                                    onClick={() => setRiderTab('Approval Queue')}
                                >
                                    Approval Queue <span className="tab-count">{pendingCount}</span>
                                </button>
                            </div>

                            {/* Status Overview Map/Box */}
                            <div className="fleet-status-area">
                                <iframe
                                    key={mapKey}
                                    src={mapLayer === 'satellite'
                                        ? "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d12094.57348593182!2d-74.0514!3d40.7178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                                        : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12094.57348593182!2d-74.0514!3d40.7178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c250d4d4220b33%3A0x633d7b4b1265691c!2sJersey%20City%2C%20NJ!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"}
                                    className={`fleet-map-live layer-${mapLayer}`}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Live Fleet Map"
                                ></iframe>
                                <div className="fleet-map-overlay">
                                    <div className="map-top-controls">
                                        <div className="map-control-btn" onClick={handleCenterMap}>
                                            <FaCrosshairs />
                                        </div>
                                        <div className="map-control-btn" onClick={handleSwitchLayer}>
                                            <FaLayerGroup />
                                        </div>
                                    </div>
                                    <div className="map-bottom-stats">
                                        <div className="map-stat-pill">
                                            <div className="dot active"></div>
                                            {activeFleetStats.active} Active
                                        </div>
                                        <div className="map-stat-pill">
                                            <div className="dot available"></div>
                                            {activeFleetStats.available} Available
                                        </div>
                                        <div className="map-stat-pill">
                                            <div className="dot offline"></div>
                                            {activeFleetStats.offline} Offline
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters & Sorting */}
                            <div className="delivery-controls">
                                <div className="filter-group">
                                    <button
                                        className={`all-filters-btn ${riderFilter === 'All' ? 'active' : ''}`}
                                        onClick={() => { setRiderFilter('All'); toast("Showing all riders"); }}
                                    >
                                        <FaFilter /> All Filters
                                    </button>
                                    <div className="divider"></div>
                                    <div className="vehicle-filters">
                                        <button className={`v-filter ${riderFilter === 'Bike' ? 'active' : ''}`} onClick={() => handleRiderFilter('Bike')}>
                                            <FaBicycle /> Bike
                                        </button>
                                        <button className={`v-filter ${riderFilter === 'Scooter' ? 'active' : ''}`} onClick={() => handleRiderFilter('Scooter')}>
                                            <FaMotorcycle /> Scooter
                                        </button>
                                        <button className={`v-filter ${riderFilter === 'Car' ? 'active' : ''}`} onClick={() => handleRiderFilter('Car')}>
                                            <FaCar /> Car
                                        </button>
                                    </div>
                                </div>

                                <div className="delivery-inline-search">
                                    <div className="page-search-wrapper">
                                        <FaSearch className="search-icon-color" />
                                        <input
                                            type="text"
                                            className="page-search-input"
                                            placeholder="Search riders..."
                                            value={riderSearch}
                                            onChange={(e) => {
                                                setRiderSearch(e.target.value);
                                                setRiderPage(1);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="sort-group">
                                    <span className="sort-label">Sort by:</span>
                                    <button className="sort-select" onClick={handleSortCycle}>
                                        {riderSort} <FaChevronDown size={10} />
                                    </button>
                                </div>
                            </div>

                            {/* Riders Table */}
                            <div className="riders-table-card">
                                <div className="riders-table-wrapper">
                                    <table className="riders-table">
                                        <thead>
                                            <tr>
                                                <th>RIDER</th>
                                                <th>VEHICLE</th>
                                                <th>PHONE</th>
                                                <th>CITY</th>
                                                <th>STATUS</th>
                                                <th>TODAY'S EARN</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedRiders.length > 0 ? (
                                                paginatedRiders.map((rider, idx) => (
                                                    <tr key={idx} className="cursor-pointer" onClick={() => setSelectedRider(rider)}>
                                                        <td>
                                                            <div className="rider-cell">
                                                                <img src={rider.av} alt={rider.name} className="rider-av" />
                                                                <div className="rider-info">
                                                                    <div className="rider-name">{rider.name}</div>
                                                                    <div className="rider-id">ID: {rider.id}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="vehicle-cell">
                                                                {rider.vehicleType === 'Bike' && <FaBicycle />}
                                                                {rider.vehicleType === 'Scooter' && <FaMotorcycle />}
                                                                {rider.vehicleType === 'Car' && <FaCar />}
                                                                <span>{rider.vehicle}</span>
                                                            </div>
                                                        </td>
                                                        <td className="phone-cell">{rider.phone}</td>
                                                        <td className="city-cell">{rider.city}</td>
                                                        <td>
                                                            <span className={`rider-status status-${rider.status.toLowerCase().replace(' ', '-')}`}>
                                                                <span className="dot"></span> {rider.status}
                                                            </span>
                                                        </td>
                                                        <td className="earn-cell">${rider.earn.toFixed(2)}</td>
                                                        <td className="action-menu-container">
                                                            <FaEllipsisV
                                                                className="row-more"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRiderActionMenu(riderActionMenu === rider.id ? null : rider.id);
                                                                }}
                                                            />
                                                            {riderActionMenu === rider.id && (
                                                                <div className="custom-dropdown rider-action-dropdown" onClick={(e) => e.stopPropagation()}>
                                                                    <div className="dropdown-item" onClick={() => { setSelectedRider(rider); setRiderActionMenu(null); }}>
                                                                        View Details
                                                                    </div>
                                                                    <div className="dropdown-item" onClick={() => handleEditRider(rider)}>
                                                                        Edit Profile
                                                                    </div>
                                                                    <div className="dropdown-item" onClick={() => handleMessageRider(rider)}>
                                                                        Message Rider
                                                                    </div>
                                                                    {!rider.status.includes('PENDING') && (
                                                                        <>
                                                                            <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>
                                                                            {rider.status === 'AVAILABLE' ? (
                                                                                <div className="dropdown-item" onClick={() => {
                                                                                    setRidersData(ridersData.map(r => r.id === rider.id ? { ...r, status: 'OFFLINE' } : r));
                                                                                    setRiderActionMenu(null);
                                                                                    toast.success(`${rider.name} is now OFFLINE`);
                                                                                }}>
                                                                                    Set to Offline
                                                                                </div>
                                                                            ) : rider.status === 'OFFLINE' ? (
                                                                                <div className="dropdown-item text-success" onClick={() => {
                                                                                    setRidersData(ridersData.map(r => r.id === rider.id ? { ...r, status: 'AVAILABLE' } : r));
                                                                                    setRiderActionMenu(null);
                                                                                    toast.success(`${rider.name} is now AVAILABLE`);
                                                                                }}>
                                                                                    Set to Available
                                                                                </div>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                    <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>
                                                                    {rider.status === 'PENDING' ? (
                                                                        <>
                                                                            <div className="dropdown-item text-success" onClick={() => handleApproveRider(rider.id)}>
                                                                                Approve Rider
                                                                            </div>
                                                                            <div className="dropdown-item text-danger" onClick={() => handleRejectRider(rider.id)}>
                                                                                Reject Rider
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div className="dropdown-item text-danger" onClick={() => handleDeleteRider(rider.id)}>
                                                                            Remove Rider
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7">
                                                        <div className="empty-rider-state">
                                                            <div className="empty-icon-wrap">
                                                                <FaSearch />
                                                            </div>
                                                            <h3>No Riders Found</h3>
                                                            <p>Try adjusting your filters or search terms</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="table-footer">
                                    <div className="pagination-info">
                                        Showing {(riderPage - 1) * 5 + 1}-{Math.min(riderPage * 5, (riderTab === 'Active Fleet' ? ridersData.filter(r => r.status !== 'PENDING').length : pendingCount))} of {riderTab === 'Active Fleet' ? ridersData.filter(r => r.status !== 'PENDING').length : pendingCount} riders
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="pg-btn"
                                            onClick={() => handlePageChange(riderPage - 1)}
                                            disabled={riderPage === 1}
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        {[...Array(totalRiderPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                className={`pg-num ${riderPage === i + 1 ? 'active' : ''}`}
                                                onClick={() => handlePageChange(i + 1)}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            className="pg-btn"
                                            onClick={() => handlePageChange(riderPage + 1)}
                                            disabled={riderPage === totalRiderPages}
                                        >
                                            <FaChevronRight />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'Reviews' && (
                        <div className="reviews-container">
                            <div className="reviews-header-section">
                                <div className="reviews-top-row">
                                    <div className="review-search-bar">
                                        <FaSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search reviews by name, ID or title..."
                                            value={reviewSearch}
                                            onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(1); }}
                                        />
                                    </div>
                                    <div className="review-filters">
                                        {['All', 'Approve', 'Pending', 'Reject'].map(f => (
                                            <button
                                                key={f}
                                                className={`review-filter-btn ${reviewFilter === f ? 'active' : ''}`}
                                                onClick={() => { setReviewFilter(f); setReviewPage(1); }}
                                            >
                                                {f === 'All' ? 'All Reviews' : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="reviews-list">
                                {paginatedReviews.map((rev) => (
                                    <div key={rev.id} className="review-card">
                                        <div className="review-date-time">
                                            <div className="rev-date">{rev.date}</div>
                                            <div className="rev-time">{rev.time}</div>
                                        </div>

                                        <div className="review-user-cell">
                                            <img src={rev.av} alt={rev.name} className="rev-user-av" />
                                            <div className="rev-user-meta">
                                                <div className="rev-user-id">{rev.id}</div>
                                                <div className="rev-user-name">{rev.name}</div>
                                            </div>
                                        </div>

                                        <div className="review-content">
                                            <div className="rev-header-row">
                                                <div className="rev-title">{rev.title}</div>
                                                <div className="rev-status-toggle-area">
                                                    {rev.status === 'APPROVED' ? (
                                                        <div className="badge-approved-outline-v2">Approved</div>
                                                    ) : rev.status === 'REJECTED' ? (
                                                        <div className="badge-archived-outline-v2">Archived</div>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="rev-rating-row">
                                                <span className="rev-rating-val">{rev.rating.toFixed(1)}</span>
                                                <div className="rev-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} style={{ opacity: i < Math.floor(rev.rating) ? 1 : (i === Math.floor(rev.rating) && rev.rating % 1 !== 0 ? 0.5 : 0.2) }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="rev-comment">{rev.comment}</p>
                                        </div>

                                        <div className="review-actions">
                                            {rev.status === 'PENDING' ? (
                                                <>
                                                    <button className="btn-approve-solid" onClick={() => handleApproveReview(rev.id)}>Approve</button>
                                                    <button className="btn-archive-solid" style={{ marginTop: '8px' }} onClick={() => handleRejectReview(rev.id)}>Archive</button>
                                                </>
                                            ) : rev.status === 'APPROVED' ? (
                                                <button className="btn-archive-solid" onClick={() => handleRejectReview(rev.id)}>Archive</button>
                                            ) : (
                                                <button className="btn-approve-solid" onClick={() => handleApproveReview(rev.id)}>Approve</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="reviews-pagination">
                                <div className="pagination-controls">
                                    <button
                                        className="pg-btn"
                                        onClick={() => setReviewPage(Math.max(1, reviewPage - 1))}
                                        disabled={reviewPage === 1}
                                    >
                                        <FaChevronLeft />
                                    </button>
                                    {[...Array(totalReviewPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`pg-num ${reviewPage === i + 1 ? 'active' : ''}`}
                                            onClick={() => setReviewPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        className="pg-btn"
                                        onClick={() => setReviewPage(Math.min(totalReviewPages, reviewPage + 1))}
                                        disabled={reviewPage === totalReviewPages}
                                    >
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeMenu === 'Inventory' && <Inventory />}
                </div>
            </main >

            {/* Add / Edit Rider Modal */}
            {
                isAddRiderModalOpen && (
                    <div className="modal-overlay" onClick={() => { setIsAddRiderModalOpen(false); setEditingRider(null); }}>
                        <div className="modal-content rider-form-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', padding: 0, overflow: 'hidden', background: 'white', borderRadius: '28px', border: '1px solid #1A1A1A' }}>

                            {/* ── Header: different design per mode ── */}
                            {editingRider ? (
                                /* EDIT MODE — dark gradient banner */
                                <div style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #3D2B1F 100%)', padding: '28px 32px 60px', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#EE9C00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>✎ Editing Profile</div>
                                            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: 'white' }}>{editingRider.name}</h2>
                                            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>ID: {editingRider.id}</p>
                                        </div>
                                        <button onClick={() => { setIsAddRiderModalOpen(false); setEditingRider(null); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', fontSize: 16 }}>
                                            <FaTimes />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ADD MODE — clean white + yellow accent header */
                                <div style={{ background: 'white', padding: '24px 28px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #EE9C00, #F59E0B)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', boxShadow: '0 6px 16px rgba(238,156,0,0.35)' }}>
                                            <FaPlus />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#EE9C00', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 3 }}>Fleet Enrollment</div>
                                            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#1A1A1A' }}>Add New Rider</h2>
                                            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>Enroll a new delivery partner into the system</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setIsAddRiderModalOpen(false); setEditingRider(null); }} style={{ background: '#F3F4F6', border: 'none', borderRadius: 12, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer', fontSize: 16 }}>
                                        <FaTimes />
                                    </button>
                                </div>
                            )}

                            {/* ── Avatar Strip (only for Edit mode, where we overlap the banner) ── */}
                            {editingRider && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '0 32px', marginTop: -44, marginBottom: 8 }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${newRider.name || 'default'}`}
                                            alt="Preview"
                                            style={{ width: 88, height: 88, borderRadius: 22, border: '4px solid white', background: '#FEF9C3', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
                                        />
                                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, background: '#EE9C00', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', fontSize: 11, color: 'white' }}>✎</div>
                                    </div>
                                    <div style={{ paddingBottom: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>Profile Photo</div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Auto-generated · changes with name</div>
                                    </div>
                                </div>
                            )}

                            {/* ── Add mode: compact avatar preview row inside the form area ── */}
                            {!editingRider && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 28px 0' }}>
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${newRider.name || 'new'}`}
                                        alt="Preview"
                                        style={{ width: 56, height: 56, borderRadius: 14, border: '2px solid #FDE68A', background: '#FFFBEB' }}
                                    />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A' }}>{newRider.name || 'New Rider'}</div>
                                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Avatar updates as you type the name</div>
                                    </div>
                                </div>
                            )}

                            {/* ── Form ── */}
                            <form onSubmit={handleAddRider} style={{ padding: editingRider ? '4px 32px 24px' : '12px 28px 24px' }}>

                                {/* Row 1: Full Name + Phone */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Full Name</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12 }}>
                                            <FaUser style={{ color: '#EE9C00', fontSize: 13, flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                placeholder="e.g. John Doe"
                                                value={newRider.name}
                                                onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                                                required
                                                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1A1A1A', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Phone Number</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12 }}>
                                            <FaPhone style={{ color: '#EE9C00', fontSize: 13, flexShrink: 0 }} />
                                            <input
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={newRider.phone}
                                                onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                                                required
                                                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1A1A1A', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 2: City + Vehicle Model */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>City / Region</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12 }}>
                                            <FaMapMarkerAlt style={{ color: '#EE9C00', fontSize: 13, flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Manhattan, NY"
                                                value={newRider.city}
                                                onChange={(e) => setNewRider({ ...newRider, city: e.target.value })}
                                                required
                                                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1A1A1A', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Vehicle Model / Plate</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: 12 }}>
                                            <FaTag style={{ color: '#EE9C00', fontSize: 13, flexShrink: 0 }} />
                                            <input
                                                type="text"
                                                placeholder="e.g. Yamaha R15 · NYC 4492"
                                                value={newRider.vehicle}
                                                onChange={(e) => setNewRider({ ...newRider, vehicle: e.target.value })}
                                                required
                                                style={{ border: 'none', background: 'none', outline: 'none', fontSize: 14, fontWeight: 600, color: '#1A1A1A', width: '100%' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vehicle Type Card Selectors */}
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Vehicle Type</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                                        {[{ label: 'Bike', icon: <FaBicycle /> }, { label: 'Scooter', icon: <FaMotorcycle /> }, { label: 'Car', icon: <FaCar /> }].map(({ label, icon }) => {
                                            const isActive = newRider.vehicleType === label;
                                            return (
                                                <div
                                                    key={label}
                                                    onClick={() => setNewRider({ ...newRider, vehicleType: label })}
                                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', borderRadius: 14, border: `2px solid ${isActive ? '#EE9C00' : '#E5E7EB'}`, background: isActive ? '#FFFBEB' : '#F9FAFB', cursor: 'pointer', transition: 'all 0.18s', boxShadow: isActive ? '0 4px 12px rgba(238,156,0,0.18)' : 'none' }}
                                                >
                                                    <div style={{ fontSize: 22, color: isActive ? '#EE9C00' : '#9CA3AF' }}>{icon}</div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#EE9C00' : '#6B7280' }}>{label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Status Selectors */}
                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{editingRider ? 'Rider Status' : 'Initial Status'}</label>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {[
                                            { s: 'AVAILABLE', color: '#10B981', bg: '#DCFCE7', dot: '#10B981' },
                                            { s: 'OFFLINE', color: '#6B7280', bg: '#F3F4F6', dot: '#9CA3AF' },
                                            { s: 'PENDING', color: '#F59E0B', bg: '#FEF3C7', dot: '#F59E0B' }
                                        ].map(({ s, color, bg, dot }) => {
                                            const isActive = newRider.status === s;
                                            return (
                                                <div
                                                    key={s}
                                                    onClick={() => setNewRider({ ...newRider, status: s })}
                                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 8px', borderRadius: 12, border: `2px solid ${isActive ? color : '#E5E7EB'}`, background: isActive ? bg : '#F9FAFB', cursor: 'pointer', transition: 'all 0.18s' }}
                                                >
                                                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: dot, boxShadow: isActive ? `0 0 6px ${dot}` : 'none' }}></div>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? color : '#9CA3AF' }}>{s}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #F3F4F6', paddingTop: 20 }}>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddRiderModalOpen(false); setEditingRider(null); }}
                                        style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1.5px solid #E5E7EB', background: 'white', fontWeight: 700, fontSize: 14, color: '#6B7280', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAddingRider}
                                        style={{ flex: 2, padding: '13px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #EE9C00, #F59E0B)', fontWeight: 800, fontSize: 14, color: 'white', cursor: 'pointer', boxShadow: '0 6px 20px rgba(238,156,0,0.4)', transition: 'all 0.2s' }}
                                    >
                                        {isAddingRider ? '⟳ Processing...' : editingRider ? '✓ Update Rider Info' : '+ Add Rider to Fleet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Rider Details Modal */}
            {
                selectedRider && (
                    <div className="modal-overlay" onClick={() => setSelectedRider(null)}>
                        <div className="modal-content rider-detail-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="detail-header-banner">
                                <img src={selectedRider.av} alt={selectedRider.name} className="banner-rider-av" />
                                <div className={`detail-status-pill status-${selectedRider.status.toLowerCase().replace(' ', '-')}`}>
                                    {selectedRider.status}
                                </div>
                            </div>

                            <div className="detail-body">
                                <div className="detail-name-row">
                                    <h2 className="detail-name">{selectedRider.name}</h2>
                                    <span className="detail-id">{selectedRider.id}</span>
                                </div>

                                <div className="detail-stats-grid">
                                    <div className="detail-stat-box">
                                        <div className="ds-label">Earnings</div>
                                        <div className="ds-value">${selectedRider.earn.toFixed(2)}</div>
                                    </div>
                                    <div className="detail-stat-box">
                                        <div className="ds-label">Orders</div>
                                        <div className="ds-value">2,452</div>
                                    </div>
                                    <div className="detail-stat-box">
                                        <div className="ds-label">Rating</div>
                                        <div className="ds-value text-warning"><FaStar size={14} /> 4.9</div>
                                    </div>
                                </div>

                                <div className="detail-info-list">
                                    <div className="inf-item">
                                        <div className="inf-icon"><FaTruck /></div>
                                        <div className="inf-content">
                                            <div className="inf-label">Vehicle Info</div>
                                            <div className="inf-val">{selectedRider.vehicle} ({selectedRider.vehicleType})</div>
                                        </div>
                                    </div>
                                    <div className="inf-item">
                                        <div className="inf-icon"><FaIdCard /></div>
                                        <div className="inf-content">
                                            <div className="inf-label">Phone Reference</div>
                                            <div className="inf-val">{selectedRider.phone}</div>
                                        </div>
                                    </div>
                                    <div className="inf-item">
                                        <div className="inf-icon"><FaMapMarkerAlt /></div>
                                        <div className="inf-content">
                                            <div className="inf-label">Active Region</div>
                                            <div className="inf-val">{selectedRider.city}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 pt-0">
                                <button className="modal-primary-btn w-100" onClick={() => setSelectedRider(null)}>
                                    Close Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Restaurants Modal */}
            {
                isResModalOpen && (
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
                                                <span className="manage-stat-val text-warning"><FaStar size={14} className="me-1" /> {managingRestaurant.rating}</span>
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
                                                    <button className="row-action-btn" onClick={() => {
                                                        setManagingRestaurant(res);
                                                        toast.success(`Managing ${res.name}`);
                                                    }}>Manage</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                {managingRestaurant ? (
                                    <button className="modal-primary-btn bg-dark" onClick={() => setManagingRestaurant(null)}>Back to List</button>
                                ) : (
                                    <button className="modal-primary-btn" onClick={() => setIsResModalOpen(false)}>Close</button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Chat Modal */}
            {
                isChatModalOpen && chatRider && (
                    <div className="modal-overlay" onClick={() => setIsChatModalOpen(false)}>
                        <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="modal-icon-wrap" style={{ width: '40px', height: '40px', fontSize: '16px' }}>
                                        <FaUsers />
                                    </div>
                                    <div>
                                        <h3 className="modal-title" style={{ fontSize: '16px' }}>Chat with {chatRider.name}</h3>
                                        <p className="modal-subtitle">Direct message to delivery partner</p>
                                    </div>
                                </div>
                                <button className="modal-close-btn" onClick={() => setIsChatModalOpen(false)}>
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="modal-body" style={{ padding: '20px' }}>
                                <div className="chat-window" style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px', height: '200px', marginBottom: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                    <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginBottom: '8px' }}>Today</div>
                                    <div style={{ alignSelf: 'flex-start', background: 'white', padding: '8px 12px', borderRadius: '12px 12px 12px 0', fontSize: '13px', border: '1px solid #e2e8f0', maxWidth: '80%' }}>
                                        Hello, how can I help you today?
                                    </div>
                                </div>
                                <form onSubmit={handleSendMessage} className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Type your message..."
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--admin-border)',
                                            fontSize: '14px',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        autoFocus
                                    />
                                    <button type="submit" className="modal-primary-btn" style={{ padding: '8px 16px', borderRadius: '12px' }}>
                                        Send
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: #FEFCE8;
          border: 1px solid #1A1A1A;
          border-radius: 32px;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: modalAppear 0.3s ease-out;
        }
        @keyframes modalAppear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid #D1D5DB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-icon-wrap {
          width: 48px;
          height: 48px;
          background: #EE9C00;
          color: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .modal-title { font-size: 20px; font-weight: 800; margin: 0; }
        .modal-subtitle { font-size: 13px; color: #6B7280; margin: 4px 0 0 0; }
        .modal-close-btn { background: none; border: none; font-size: 20px; color: #9CA3AF; cursor: pointer; }
        .modal-body { padding: 24px 32px; overflow-y: auto; flex: 1; }
        .res-full-list { display: flex; flex-direction: column; gap: 16px; }
        .res-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 20px;
          transition: all 0.2s;
        }
        .res-row-item:hover { transform: translateX(8px); border-color: #EE9C00; }
        .res-row-left { display: flex; align-items: center; gap: 16px; }
        .res-row-img { width: 48px; height: 48px; border-radius: 12px; object-fit: cover; }
        .res-row-name { font-weight: 700; font-size: 15px; }
        .res-row-meta { font-size: 12px; color: #6B7280; margin-top: 2px; }
        .res-row-rating { color: #EE9C00; font-weight: 700; }
        .dot-sep { margin: 0 6px; }
        .res-row-stats { text-align: right; }
        .res-row-rev { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
        .status-dot { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 50px; }
        .status-open { background: #DCFCE7; color: #166534; }
        .status-closed { background: #FEE2E2; color: #991B1B; }
        .row-action-btn {
          background: #1A1A1A;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .modal-footer { padding: 20px 32px; border-top: 1px solid #D1D5DB; display: flex; justify-content: flex-end; }
        .modal-primary-btn {
          background: #EE9C00;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .management-panel {
          animation: slideInR 0.3s ease-out;
        }
        @keyframes slideInR {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .manage-header-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        .manage-stat-box {
          background: white;
          padding: 16px;
          border-radius: 20px;
          border: 1px solid #E5E7EB;
          text-align: center;
        }
        .manage-stat-label {
          display: block;
          font-size: 11px;
          color: #6B7280;
          font-weight: 700;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .manage-stat-val { font-size: 18px; font-weight: 800; }
        .status-toggle-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .status-toggle-btn.active {
          background: #DCFCE7;
          border-color: #10B981;
          color: #166534;
        }
        .status-toggle-btn.active-closed {
          background: #FEE2E2;
          border-color: #EF4444;
          color: #991B1B;
        }
        .custom-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          background: white;
          border: 1px solid #1A1A1A;
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06);
          z-index: 9999;
          min-width: 168px;
          overflow: hidden;
          padding: 4px 0;
        }
        .dropdown-item {
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #1F2937;
          text-align: left;
        }
        .dropdown-item:hover {
          background: #FEFCE8;
          color: #EE9C00;
        }
        .dropdown-item.active {
          background: #EE9C00;
          color: white;
        }
        .position-relative {
          position: relative;
        }
        .action-menu-container {
          position: relative;
          text-align: right;
          width: 48px;
        }
        .row-more:hover {
          color: #EE9C00;
        }
      `}</style>
        </div >
    );
};

export default AdminOverview;
