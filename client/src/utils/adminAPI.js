const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_API_URL}/admin`;

// Import admin auth utility
import adminAuth from './adminAuth';
import { adminApiCall } from './api';

// Get admin token from localStorage
const getAuthHeader = () => {
  const token = adminAuth.getAdminToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Dashboard Stats
export const getDashboardStats = async () => {
  return await adminApiCall('/admin/stats');
};

// Product Management
export const getAdminProducts = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return await adminApiCall(`/admin/products?${params}`);
};

export const getProductById = async (id) => {
  return await adminApiCall(`/admin/products/${id}`);
};

export const createProduct = async (productData) => {
  return await adminApiCall('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
};

export const updateProduct = async (id, productData) => {
  return await adminApiCall(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
};

export const deleteProduct = async (id) => {
  return await adminApiCall(`/admin/products/${id}`, {
    method: 'DELETE'
  });
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  // Don't set Content-Type header for FormData - browser sets it automatically with boundary
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    credentials: 'include', // Include cookies for authentication
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }
  return response.json();
};

// Order Management
export const getAdminOrders = async (page = 1, limit = 20, status = 'all') => {
  const params = new URLSearchParams({ page, limit, status });
  return await adminApiCall(`/admin/orders?${params}`);
};

export const getOrderById = async (id) => {
  return await adminApiCall(`/admin/orders/${id}`);
};

export const updateOrderStatus = async (id, status) => {
  return await adminApiCall(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
};

// ⭐ STEP 5 YAHI HAI
export const deleteOrder = async (orderId) => {
  console.log('Attempting to delete order:', orderId);
  const result = await adminApiCall(`/admin/orders/${orderId}`, {
    method: 'DELETE',
  });
  console.log('Delete order result:', result);
  return result;
};

// User Management
export const getAdminUsers = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return await adminApiCall(`/admin/users?${params}`);
};

export const updateUserRole = async (id, role) => {
  return await adminApiCall(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
};

export const toggleUserBlock = async (id, isBlocked) => {
  return await adminApiCall(`/admin/users/${id}/block`, {
    method: 'PATCH',
    body: JSON.stringify({ isBlocked })
  });
};

export const deleteUser = async (id) => {
  return await adminApiCall(`/admin/users/${id}`, {
    method: 'DELETE'
  });
};

// Admin Profile
export const getAdminProfile = async () => {
  return await adminApiCall('/admin/profile');
};

export const updateAdminProfile = async (profileData) => {
  return await adminApiCall('/admin/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};

// Notification APIs
export const getAdminNotifications = async (page = 1, limit = 20, filters = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  return await adminApiCall(`/notifications?${params}`);
};

export const getUnreadNotificationCount = async () => {
  return await adminApiCall('/notifications/unread-count');
};

export const markNotificationAsRead = async (id) => {
  return await adminApiCall(`/notifications/${id}/read`, {
    method: 'PATCH'
  });
};

export const markAllNotificationsAsRead = async () => {
  return await adminApiCall('/notifications/read-all', {
    method: 'PATCH'
  });
};

export const deleteNotification = async (id) => {
  return await adminApiCall(`/notifications/${id}`, {
    method: 'DELETE'
  });
};
