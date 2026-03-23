// App.jsx (corrected route)
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages & Components
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import Navbar from './Components/Common/Navbar/Navbar';
import Footer from './Components/Common/Footer/Footer';
import Blog from './pages/Blog';
import Dominos from './pages/Dominos';
import Cart from './Components/Cart/Cart';
import AboutPage from './pages/AboutPage';
import Contact from './pages/Contact';
import Partner from './pages/Partner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PartnerOnboarding from './pages/PartnerOnboarding';
import PartnerRestaurantInfo from './pages/PartnerRestaurantInfo';
import PartnerRestaurantName from './pages/PartnerRestaurantName';
import TermsAndCondition from './pages/TermsAndCondition';
import FAQ from './pages/FAQ';
import Checkout from './Components/Checkout/Checkout';
import RecommendedRestaurants from './pages/RecommendedRestaurants';
import RestaurantDetails from './pages/RestaurantDetails';
import CategoryDetails from './pages/CategoryDetails';
import Auth from './pages/Auth';
import Signup from './pages/Signup';
import Categories from './Components/HomeComponenets/Categories';
import AllDishes from './pages/AllDishes';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/dominos" element={<Dominos />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/partner-onboarding" element={<PartnerOnboarding />} />
            <Route path="/partner-restaurant-info" element={<PartnerRestaurantInfo />} />
            <Route path="/partner-restaurant-name" element={<PartnerRestaurantName />} />
            <Route path="/recommended-restaurants" element={<RecommendedRestaurants />} />
            {/* ✅ FIX: changed :restaurantId to :id to match RestaurantDetails */}
            <Route path="/recommended-restaurants/:id" element={<RestaurantDetails />} />
            <Route path="/category-details/:categoryId" element={<CategoryDetails />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-condition" element={<TermsAndCondition />} />
            <Route path="/category/:categoryId" element={<CategoryPage />} />
            <Route path="/item/:itemId" element={<ItemDetailsPage />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/all-dishes" element={<AllDishes />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;