import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiPlusCircle
} from "react-icons/fi";
import "./AdminLayout.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <h2>Foot<span>Cap</span></h2>
        <p>Admin Workspace</p>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <FiHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/products" end className={({ isActive }) => isActive ? "active" : ""}>
          <FiPackage />
          <span>Products</span>
        </NavLink>

        <NavLink to="/admin/products/add" className={({ isActive }) => isActive ? "active" : ""}>
          <FiPlusCircle />
          <span>Add Product</span>
        </NavLink>

        <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "active" : ""}>
          <FiShoppingCart />
          <span>Orders</span>
        </NavLink>

        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "active" : ""}>
          <FiUsers />
          <span>Users</span>
        </NavLink>

        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? "active" : ""}>
          <FiSettings />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;