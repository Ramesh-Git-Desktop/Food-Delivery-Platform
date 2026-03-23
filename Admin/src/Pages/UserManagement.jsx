import React, { useState, useEffect } from "react";
import "../CSS/UserManagement.css";
import {
    FiSearch,
    FiChevronDown,
    FiCalendar,
    FiChevronUp,
    FiTrash2,
    FiEdit2,
    FiSlash
} from "react-icons/fi";
import { HiOutlineUpload } from "react-icons/hi";
import { MdOutlineAdd } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const initialUsers = [
    { name: "John Smith", email: "john.smith@gmail.com", username: "jonny77", status: "Active", role: "Admin", joined: "March 12, 2023", last: "1 minute ago", avatar: "https://randomuser.me/api/portraits/men/1.jpg" },
    { name: "Olivia Bennett", email: "ollyben@gmail.com", username: "olly659", status: "Inactive", role: "User", joined: "June 27, 2022", last: "1 month ago", avatar: "https://randomuser.me/api/portraits/women/2.jpg" },
    { name: "Daniel Warren", email: "dwarren3@gmail.com", username: "dwarren3", status: "Banned", role: "User", joined: "January 8, 2024", last: "4 days ago", avatar: "https://randomuser.me/api/portraits/men/3.jpg" },
    { name: "Chloe Hayes", email: "chloehye@gmail.com", username: "chloehh", status: "Pending", role: "Guest", joined: "October 5, 2021", last: "10 days ago", avatar: "https://randomuser.me/api/portraits/women/4.jpg" },
    { name: "Marcus Reed", email: "reeds777@gmail.com", username: "reeds7", status: "Suspended", role: "User", joined: "February 19, 2023", last: "3 months ago", avatar: "https://randomuser.me/api/portraits/men/5.jpg" },
    { name: "Isabelle Clark", email: "belleclark@gmail.com", username: "bellecl", status: "Active", role: "Moderator", joined: "August 30, 2022", last: "1 week ago", avatar: "https://randomuser.me/api/portraits/women/6.jpg" },
    { name: "Lucas Mitchel", email: "lucamich@gmail.com", username: "lucamich", status: "Active", role: "Guest", joined: "April 23, 2024", last: "4 hours ago", avatar: "https://randomuser.me/api/portraits/men/7.jpg" },
    { name: "Mark Wilburg", email: "markwill32@gmail.com", username: "markwill32", status: "Banned", role: "User", joined: "November 14, 2020", last: "2 months ago", avatar: "https://randomuser.me/api/portraits/men/8.jpg" },
    { name: "Nicholas Ager", email: "nicolass009@gmail.com", username: "nicolass009", status: "Suspended", role: "User", joined: "July 6, 2023", last: "3 hours ago", avatar: "https://randomuser.me/api/portraits/men/9.jpg" },
    { name: "Mia Nadinn", email: "mianaddiin@gmail.com", username: "mianaddiin", status: "Inactive", role: "Guest", joined: "December 31, 2021", last: "4 months ago", avatar: "https://randomuser.me/api/portraits/women/10.jpg" },
    { name: "Noemi Villan", email: "noemivill99@gmail.com", username: "noemi", status: "Active", role: "Admin", joined: "August 10, 2024", last: "15 minutes ago", avatar: "https://randomuser.me/api/portraits/women/11.jpg" },
];

const getStatusClass = (status) => {
    switch (status) {
        case "Active": return "um-status um-status-active";
        case "Inactive": return "um-status um-status-inactive";
        case "Banned": return "um-status um-status-banned";
        case "Pending": return "um-status um-status-pending";
        case "Suspended": return "um-status um-status-suspended";
        default: return "um-status";
    }
};

export default function UserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [showExportDropdown, setShowExportDropdown] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [userList, setUserList] = useState(initialUsers);
    const [openActionId, setOpenActionId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    // New user form state
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        username: "",
        status: "Active",
        role: "User",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg"
    });

    // Sorting state
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const roles = ["All", "Admin", "User", "Moderator", "Guest"];
    const statuses = ["All", "Active", "Inactive", "Banned", "Pending", "Suspended"];

    // Filter users based on search and filters
    const filteredUsers = userList.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "" || roleFilter === "All" || user.role === roleFilter;
        const matchesStatus = statusFilter === "" || statusFilter === "All" || user.status === statusFilter;
        const matchesDate = dateFilter === "" || user.joined.includes(dateFilter);

        return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });

    // Sorting function
    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'joined' || sortConfig.key === 'last') {
            return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return 0;
    });

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter, dateFilter, sortConfig]);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

    // Pagination functions
    const goToPage = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }

        return pageNumbers;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return <FiChevronDown className="um-sort-icon um-sort-icon-inactive" />;
        }
        return sortConfig.direction === 'asc'
            ? <FiChevronUp className="um-sort-icon um-sort-icon-active" />
            : <FiChevronDown className="um-sort-icon um-sort-icon-active" />;
    };

    const handleRoleSelect = (role) => {
        setRoleFilter(role);
        setShowRoleDropdown(false);
    };

    const handleStatusSelect = (status) => {
        setStatusFilter(status);
        setShowStatusDropdown(false);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setDateFilter(date);
        setShowDatePicker(false);
    };

    // Export functionality
    const handleExport = (format) => {
        setShowExportDropdown(false);

        // Prepare data for export
        const exportData = sortedUsers.map(user => ({
            'Full Name': user.name,
            'Email': user.email,
            'Username': user.username,
            'Status': user.status,
            'Role': user.role,
            'Joined Date': user.joined,
            'Last Active': user.last
        }));

        if (format === 'csv') {
            exportToCSV(exportData);
        } else if (format === 'excel') {
            exportToExcel(exportData);
        } else if (format === 'pdf') {
            exportToPDF(exportData);
        }

        setSuccessMessage(`Data exported as ${format.toUpperCase()} successfully`);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    const exportToCSV = (data) => {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToExcel = (data) => {
        exportToCSV(data);
    };

    const exportToPDF = (data) => {
        const textContent = data.map(row => Object.values(row).join(' | ')).join('\n');
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `users_export_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    // Add User functionality
    const handleAddUser = () => {
        setShowAddUserModal(true);
    };

    const handleCloseModal = () => {
        setShowAddUserModal(false);
        setNewUser({
            name: "",
            email: "",
            username: "",
            status: "Active",
            role: "User",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg"
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitUser = () => {
        if (!newUser.name || !newUser.email || !newUser.username) {
            alert("Please fill in all required fields");
            return;
        }

        const newUserWithDefaults = {
            ...newUser,
            joined: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            last: 'Just now'
        };

        console.log("New user added:", newUserWithDefaults);

        setShowAddUserModal(false);
        setSuccessMessage("User added successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        setNewUser({
            name: "",
            email: "",
            username: "",
            status: "Active",
            role: "User",
            avatar: "https://randomuser.me/api/portraits/men/1.jpg"
        });
    };

    // DELETE USER
    const handleDeleteUser = (username) => {
        const updatedUsers = userList.filter(
            (user) => user.username !== username
        );

        setUserList(updatedUsers);
        setOpenActionId(null);

        setSuccessMessage("User deleted successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    // BLOCK USER
    const handleBlockUser = (username) => {
        const updatedUsers = userList.map((user) =>
            user.username === username
                ? { ...user, status: "Banned" }
                : user
        );

        setUserList(updatedUsers);
        setOpenActionId(null);

        setSuccessMessage("User blocked successfully");
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    return (
        <div className="um-user-wrapper">
            <h1 className="um-title">User Management</h1>
            <p className="um-subtitle">
                Manage all users in one place. Control access, assign roles, and monitor activity across your platform.
            </p>

            {/* Success Message Toast */}
            {showSuccessMessage && (
                <div className="um-success-toast">
                    {successMessage}
                </div>
            )}

            {/* Filters */}
            <div className="um-top-controls">
                <div className="um-left-controls">
                    <div className="um-search-box">
                        <FiSearch className="um-search-icon" />
                        <input
                            placeholder="Search by name, email or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="um-dropdown">
                        <button className="um-filter-btn" onClick={() => setShowRoleDropdown(!showRoleDropdown)}>
                            {roleFilter || "Role"} <FiChevronDown />
                        </button>
                        {showRoleDropdown && (
                            <div className="um-dropdown-menu">
                                {roles.map((role) => (
                                    <div key={role} className="um-dropdown-item" onClick={() => handleRoleSelect(role)}>
                                        {role}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="um-dropdown">
                        <button className="um-filter-btn" onClick={() => setShowStatusDropdown(!showStatusDropdown)}>
                            {statusFilter || "Status"} <FiChevronDown />
                        </button>
                        {showStatusDropdown && (
                            <div className="um-dropdown-menu">
                                {statuses.map((status) => (
                                    <div key={status} className="um-dropdown-item" onClick={() => handleStatusSelect(status)}>
                                        {status}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="um-dropdown">
                        <button className="um-filter-btn" onClick={() => setShowDatePicker(!showDatePicker)}>
                            {selectedDate || "Date"} <FiCalendar />
                        </button>
                        {showDatePicker && (
                            <div className="um-date-picker-menu">
                                <div className="um-date-header">Select Month</div>
                                <div className="um-date-grid">
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                                        <div key={month} className="um-date-item" onClick={() => handleDateSelect(month)}>
                                            {month}
                                        </div>
                                    ))}
                                </div>
                                <div className="um-date-header">Select Year</div>
                                <div className="um-date-grid">
                                    {["2020", "2021", "2022", "2023", "2024"].map((year) => (
                                        <div key={year} className="um-date-item" onClick={() => handleDateSelect(year)}>
                                            {year}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="um-right-controls">
                    <div className="um-dropdown">
                        <button className="um-outline-btn" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                            <HiOutlineUpload /> Export <FiChevronDown />
                        </button>
                        {showExportDropdown && (
                            <div className="um-dropdown-menu um-export-menu">
                                <div className="um-dropdown-item" onClick={() => handleExport('csv')}>
                                    Export as CSV
                                </div>
                                <div className="um-dropdown-item" onClick={() => handleExport('excel')}>
                                    Export as Excel
                                </div>
                                <div className="um-dropdown-item" onClick={() => handleExport('pdf')}>
                                    Export as PDF
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="um-primary-btn" onClick={handleAddUser}>
                        <MdOutlineAdd /> Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="um-table-wrapper">
                <table className="um-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th onClick={() => requestSort('name')} className="um-sortable-header">
                                Full Name {getSortIcon('name')}
                            </th>
                            <th onClick={() => requestSort('email')} className="um-sortable-header">
                                Email {getSortIcon('email')}
                            </th>
                            <th onClick={() => requestSort('username')} className="um-sortable-header">
                                Username {getSortIcon('username')}
                            </th>
                            <th onClick={() => requestSort('status')} className="um-sortable-header">
                                Status {getSortIcon('status')}
                            </th>
                            <th onClick={() => requestSort('role')} className="um-sortable-header">
                                Role {getSortIcon('role')}
                            </th>
                            <th onClick={() => requestSort('joined')} className="um-sortable-header">
                                Joined Date {getSortIcon('joined')}
                            </th>
                            <th onClick={() => requestSort('last')} className="um-sortable-header">
                                Last Active {getSortIcon('last')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.map((u, i) => (
                            <tr key={i}>
                                <td><input type="checkbox" /></td>
                                <td>
                                    <div className="um-user-cell">
                                        <img src={u.avatar} alt={u.name} className="um-user-avatar" />
                                        {u.name}
                                    </div>
                                </td>
                                <td>{u.email}</td>
                                <td>{u.username}</td>
                                <td><span className={getStatusClass(u.status)}>{u.status}</span></td>
                                <td>{u.role}</td>
                                <td>{u.joined}</td>
                                <td>{u.last}</td>
                                <td className="um-actions">
                                    <div className="um-action-dropdown">
                                        <BsThreeDotsVertical
                                            className="um-action-icon"
                                            onClick={() =>
                                                setOpenActionId(openActionId === u.username ? null : u.username)
                                            }
                                        />

                                        {openActionId === u.username && (
                                            <div className="um-action-menu">
                                                <div
                                                    className="um-action-menu-item um-action-delete"
                                                    onClick={() => handleDeleteUser(u.username)}
                                                >
                                                    <FiTrash2 className="um-menu-icon" />
                                                    Delete
                                                </div>

                                                <div
                                                    className="um-action-menu-item um-action-block"
                                                    onClick={() => handleBlockUser(u.username)}
                                                >
                                                    <FiSlash className="um-menu-icon" />
                                                    Block
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="um-pagination">
                <button
                    className={`um-page um-page-arrow ${currentPage === 1 ? 'um-disabled' : ''}`}
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    title="Previous Page"
                >
                    <IoIosArrowBack />
                </button>

                {getPageNumbers().map(number => (
                    <button
                        key={number}
                        className={`um-page ${currentPage === number ? 'um-active' : ''}`}
                        onClick={() => goToPage(number)}
                    >
                        {number}
                    </button>
                ))}

                <button
                    className={`um-page um-page-arrow ${currentPage === totalPages ? 'um-disabled' : ''}`}
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    title="Next Page"
                >
                    <IoIosArrowForward />
                </button>
            </div>

            {/* Showing X of Y results */}
            {totalPages > 0 && (
                <div className="um-pagination-info">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} users
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="um-modal-overlay" onClick={handleCloseModal}>
                    <div className="um-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="um-modal-title">Add New User</h2>
                        <button className="um-modal-close" onClick={handleCloseModal}>×</button>

                        <div className="um-modal-form">
                            <div className="um-form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newUser.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="um-form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newUser.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                />
                            </div>

                            <div className="um-form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={newUser.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter username"
                                />
                            </div>

                            <div className="um-form-row">
                                <div className="um-form-group">
                                    <label>Status</label>
                                    <select name="status" value={newUser.status} onChange={handleInputChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>

                                <div className="um-form-group">
                                    <label>Role</label>
                                    <select name="role" value={newUser.role} onChange={handleInputChange}>
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                        <option value="Moderator">Moderator</option>
                                        <option value="Guest">Guest</option>
                                    </select>
                                </div>
                            </div>

                            <div className="um-modal-actions">
                                <button className="um-modal-cancel-btn" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button className="um-modal-submit-btn" onClick={handleSubmitUser}>
                                    Add User
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}