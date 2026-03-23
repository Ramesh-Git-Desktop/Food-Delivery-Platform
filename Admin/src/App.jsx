// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './Components/Layout/AdminLayout';
import AdminOverview from './Pages/AdminOverview';
import Inventory from './Components/AdminOverrviewComponent/Inventory';
import OrdersManagement from './Pages/OrdersManagement';
import RestaurantManagement from './Pages/RestaurantManagement';
import GeneralCustomer from './Pages/GeneralCustomer';
import MenuEditor from './Pages/MenuEditor';
import Dashboard from './Pages/Dashboard';
import UserManagement from './Pages/UserManagement';
import AnalyticsDashboard from './Pages/AnalyticsDashboard';
import Delivery from './Pages/Delivery';
import CustomerDetails from './Pages/CustomerDetails';
import CouponsManagement from './Pages/CouponsManagement';
import Setting from './Pages/Setting';
import Reviews from './Pages/Reviews';
import Login from './Pages/Login';

// Component to protect routes – redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes – wrapped with AdminLayout and ProtectedRoute */}
      <Route element={<AdminLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-overview"
          element={
            <ProtectedRoute>
              <AdminOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders-management"
          element={
            <ProtectedRoute>
              <OrdersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-management"
          element={
            <ProtectedRoute>
              <RestaurantManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics-dashboard"
          element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <GeneralCustomer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <MenuEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <Delivery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons-management"
          element={
            <ProtectedRoute>
              <CouponsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback: redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;