const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for public API calls (no authentication required)
export const publicApiCall = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`Public API Call to ${endpoint} - Headers:`, headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Still include cookies for potential session tracking
    });

    console.log(`Public API Call to ${endpoint} - Response status:`, response.status);
    console.log(`Public API Call to ${endpoint} - Response headers:`, Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Something went wrong';
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log(`Public API Call to ${endpoint} - Response data:`, data);

    return data;
  } catch (error) {
    console.error('Public API Error:', error);
    throw error;
  }
};

// Helper function for user API calls
export const userApiCall = async (endpoint, options = {}) => {
  try {
    const userId = localStorage.getItem('userId');

    console.log(`API Call to ${endpoint} - UserId:`, userId);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Don't include token in header since it's in HTTP-only cookie
    // Token will be sent automatically with credentials: 'include'

    if (userId) {
      headers['x-user-id'] = userId;
    }

    console.log(`API Call to ${endpoint} - Headers:`, headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Include cookies in requests
    });

    console.log(`API Call to ${endpoint} - Response status:`, response.status);
    console.log(`API Call to ${endpoint} - Response headers:`, Object.fromEntries(response.headers));

    // Check if response is ok before parsing JSON to handle authentication errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Something went wrong';
      
      // Don't clear user data here - let the calling component handle auth errors
      // This prevents unintended logouts on temporary API failures
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log(`API Call to ${endpoint} - Response data:`, data);

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function for admin API calls
export const adminApiCall = async (endpoint, options = {}) => {
  try {
    const userId = localStorage.getItem('admin_userId');
    
    console.log('Admin API Call - Endpoint:', endpoint);
    console.log('Admin API Call - User ID:', userId);
    console.log('Admin API Call - Request body:', options.body);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Don't include token in header since it's in HTTP-only cookie
    // Token will be sent automatically with credentials: 'include'

    if (userId) {
      headers['x-user-id'] = userId;
    }
    
    console.log('Admin API Call - Headers:', headers);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // Include cookies in requests
    });
    
    console.log('Admin API Call - Response status:', response.status);
    console.log('Admin API Call - Response headers:', Object.fromEntries(response.headers));

    // Check if response is ok before parsing JSON to handle authentication errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Something went wrong';
      
      // If it's an authentication error, redirect to login
      if (response.status === 401 || response.status === 403) {
        // Clear admin data and redirect to login
        localStorage.removeItem('admin_userId');
        localStorage.removeItem('admin_userName');
        localStorage.removeItem('admin_userEmail');
        localStorage.removeItem('admin_role');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    console.log('Admin API Call - Response data:', data);

    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
};

// User APIs
export const userAPI = {
  register: (userData) => userApiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (credentials) => userApiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  googleAuth: (googleData) => publicApiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify(googleData),
  }),
  forgotPassword: (email) => userApiCall('/users/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  resetPassword: (token, password) => userApiCall(`/users/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  }),
  getProfile: () => {
    console.log('Making profile API call');
    return userApiCall('/users/profile');
  },
  updateProfile: (userId, data) => userApiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Product APIs
export const productAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    const queryString = params.toString() ? `?${params}` : '';
    return publicApiCall(`/products${queryString}`);
  },
  getById: (id) => publicApiCall(`/products/${id}`),
  // Get products with pagination
  getPaginated: (page = 1, limit = 50, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    // Add filter params
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    return publicApiCall(`/products?${params}`);
  },
};

// Cart APIs
export const cartAPI = {
  getCart: (userId) => userApiCall('/cart/my-cart'),
  addToCart: (userId, productId, size = 9) => userApiCall('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, size }),
  }),
  updateQuantity: (userId, productId, size, quantity) => userApiCall('/cart/update', {
    method: 'PUT',
    body: JSON.stringify({ productId, size, quantity }),
  }),
  removeFromCart: (userId, productId, size) => userApiCall('/cart/remove', {
    method: 'DELETE',
    body: JSON.stringify({ productId, size }),
  }),
  clearCart: (userId) => userApiCall('/cart/clear', {
    method: 'DELETE',
  }),
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: (userId) => userApiCall('/wishlist/my-wishlist'), // userId not needed anymore
  toggleWishlist: (userId, productId) => userApiCall('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  }),
  checkWishlisted: (userId, productId) => userApiCall(`/wishlist/check/${productId}`),
};

// Order APIs (JWT BASED - SECURE)
export const orderAPI = {
  // ✅ Get logged-in user's orders (NO userId)
  getMyOrders: () =>
    userApiCall('/orders/my-orders'),

  // ✅ Create order (JWT se user lega backend)
  createOrder: (orderData) =>
    userApiCall('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  // Single order (safe)
  getOrder: (orderId) =>
    userApiCall(`/orders/single/${orderId}`),
};

// Payment APIs
export const paymentAPI = {
  createOrder: (orderData) => userApiCall('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  verifyPayment: (paymentData) => userApiCall('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  getPaymentDetails: (paymentId) => userApiCall(`/payments/details/${paymentId}`),
};