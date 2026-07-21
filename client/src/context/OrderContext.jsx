import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import { orderAPI } from "../utils/api";
import { isAuthenticated } from "../utils/auth";

const OrderContext = createContext();

// Helper function to extract numeric price
const extractPrice = (priceString) => {
  if (typeof priceString === "number") return priceString;
  if (!priceString) return 0;
  const numericValue = String(priceString).replace(/[₹,\s]/g, "");
  return parseInt(numericValue, 10) || 0;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ LOAD ORDERS (JWT BASED – NO userId)
  const loadOrdersFromAPI = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      
      // Format orders to ensure consistent structure
      const formattedOrders = (response.orders || []).map(order => ({
        ...order,
        orderId: order.orderId,
        createdAt: order.createdAt,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
          name: item.name,
          qty: item.quantity || item.qty,
          size: item.size,
          price: item.price,
          image: item.image
        })),
        deliveryDetails: order.deliveryDetails
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Don't clear user data on order errors - order API might fail for other reasons
      // Only clear orders list, keep user authenticated
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load orders when user is logged in
  useEffect(() => {
    // Check if user is authenticated using the utility function
    if (isAuthenticated()) {
      loadOrdersFromAPI();
    } else {
      setOrders([]); // logout par clear
    }
  }, [loadOrdersFromAPI]);

  // Generate order ID (guest only – rarely used now)
  const generateOrderId = () => {
    const prefix = "FC";
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${randomNum}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // ✅ ADD ORDER (JWT BASED – NO userId)
  const addOrder = async (orderData) => {
    // Format items for API
    const formattedItems = orderData.items.map((item) => ({
      productId: item.id || item.productId || item._id || null,
      name: item.name,
      quantity: item.quantity || item.qty || 1,
      size: item.size || 9,
      price:
        item.priceNumeric !== undefined
          ? item.priceNumeric
          : extractPrice(item.price),
      image: item.image || '',
    }));

    const orderPayload = {
      items: formattedItems,
      totalAmount: orderData.totalAmount,
      deliveryDetails: orderData.deliveryDetails,
      paymentMethod: orderData.paymentMethod || "cod",
      paymentId: orderData.paymentId || null,
      razorpayOrderId: orderData.razorpayOrderId || null,
      razorpaySignature: orderData.razorpaySignature || null,
    };

    try {
      const response = await orderAPI.createOrder(orderPayload);
      await loadOrdersFromAPI(); // reload fresh orders
      return response.orderId;
    } catch (error) {
      console.error("Error creating order:", error);

      // Optional guest fallback (safe)
      const newOrder = {
        id: generateOrderId(),
        date: formatDate(new Date()),
        status: "Pending",
        total: orderData.totalAmount,
        items: formattedItems.map((item) => ({
          name: item.name,
          qty: item.quantity,
          size: item.size,
          price: item.price,
          image: item.image,
        })),
        deliveryDetails: orderData.deliveryDetails,
        paymentMethod: orderData.paymentMethod,
      };

      setOrders((prev) => [newOrder, ...prev]);
      return newOrder.id;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        loading,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook
export const useOrder = () => useContext(OrderContext);