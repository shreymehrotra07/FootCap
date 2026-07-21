import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Product from "./pages/MenProducts";
import WomenProducts from "./pages/WomenProducts";
import NewArrivalsPage from "./pages/NewArrivals";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import Sale from "./pages/Sale";
import PerformanceElite from "./pages/PerformanceElite";
import UrbanMinimalist from "./pages/UrbanMinimalist";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsPolicy from "./pages/ReturnsPolicy";

// Admin Components
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import AdminProducts from "./admin/AdminProducts";
import AdminAddProduct from "./admin/AdminAddProduct";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";

// User Protection Component - Prevents admins from accessing user panel
import UserProtectedRoute from "./components/UserProtectedRoute";



function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* PUBLIC PAGES - Accessible by everyone (including admins for browsing) */}
        <Route path="/" element={<Home />} />
        <Route path="/menproduct" element={<Product />} />
        <Route path="/womenproduct" element={<WomenProducts />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/menproduct/:id" element={<ProductDetail />} />
        <Route path="/womenproduct/:id" element={<ProductDetail />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/collections/performance-elite" element={<PerformanceElite />} />
        <Route path="/collections/urban-minimalist" element={<UrbanMinimalist />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/returns-policy" element={<ReturnsPolicy />} />

        {/* AUTH PAGES - Accessible by everyone */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* USER PANEL PAGES - Protected from admin access */}
        <Route path="/profile" element={
          <UserProtectedRoute>
            <Profile />
          </UserProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <UserProtectedRoute>
            <EditProfile />
          </UserProtectedRoute>
        } />
        <Route path="/cart" element={
          <UserProtectedRoute>
            <Cart />
          </UserProtectedRoute>
        } />
        <Route path="/checkout" element={
          <UserProtectedRoute>
            <Checkout />
          </UserProtectedRoute>
        } />
        <Route path="/orders" element={
          <UserProtectedRoute>
            <Orders />
          </UserProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <UserProtectedRoute>
            <Wishlist />
          </UserProtectedRoute>
        } />

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminEditProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
