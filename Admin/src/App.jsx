import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLayout from "./Components/Layout/AdminLayout";
import AdminOverview from "./Pages/AdminOverview";
import Inventory from "./Components/AdminOverrviewComponent/Inventory";
import OrdersManagement from "./Pages/OrdersManagement";
import RestaurantManagement from "./Pages/RestaurantManagement";
import GeneralCustomer from "./Pages/GeneralCustomer";
import MenuEditor from "./Pages/MenuEditor";
import Dashboard from "./Pages/Dashboard";
import UserManagement from "./Pages/UserManagement";
import AnalyticsDashboard from "./Pages/AnalyticsDashboard";
import Delivery from "./Pages/Delivery";
import CustomerDetails from "./Pages/CustomerDetails";
import CouponsManagement from "./Pages/CouponsManagement";
import Setting from "./Pages/Setting";
import Reviews from "./Pages/Reviews";




function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin-overview" element={<AdminOverview />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders-management" element={<OrdersManagement />} />
          <Route path="/restaurant-management" element={<RestaurantManagement />} />
          <Route path="/analytics-dashboard" element={<AnalyticsDashboard />} />
          <Route path="/customers" element={<GeneralCustomer />} />
          <Route path="/customers/:id" element={<CustomerDetails />} />
          <Route path="/menu" element={<MenuEditor />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/coupons-management" element={<CouponsManagement />} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/reviews" element={<Reviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;