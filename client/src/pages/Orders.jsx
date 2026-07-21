import React, { useState, useEffect } from "react";
import { useOrder } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiX,
  FiArrowRight,
  FiCreditCard,
  FiUser,
  FiCalendar,
  FiRotateCcw
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Orders.css";

/* ================= HELPERS ================= */

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split('/').pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

const getItemQty = (item) => item.quantity || item.qty || 1;

const calculateOrderTotal = (items = [], orderTotal) => {
  if (orderTotal) return orderTotal;
  return items.reduce(
    (sum, item) => sum + (item.price || 0) * getItemQty(item),
    0
  );
};

const getOrderId = (order) => {
  return order?.orderId || order?.id || order?._id || "UNKNOWN";
};

const getPaymentLabel = (method) => {
  if (!method) return "Cash on Delivery";
  if (method === "razorpay" || method === "card") return "Online Payment (Razorpay)";
  return "Cash on Delivery";
};

function Orders() {
  const navigate = useNavigate();
  const { orders, loading } = useOrder();
  const [trackingOrder, setTrackingOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getStatusDetails = (status) => {
    const statusMap = {
      Pending: { color: "#fbbf24", text: "Order Placed", bg: "rgba(251, 191, 36, 0.12)" },
      Paid: { color: "#fbbf24", text: "Order Placed", bg: "rgba(251, 191, 36, 0.12)" },
      Shipped: { color: "#a855f7", text: "Shipped", bg: "rgba(168, 85, 247, 0.12)" },
      Delivered: { color: "#10b981", text: "Delivered", bg: "rgba(16, 185, 129, 0.12)" },
      Cancelled: { color: "#FF2A5F", text: "Cancelled", bg: "rgba(255, 42, 95, 0.12)" },
    };
    return statusMap[status] || statusMap.Pending;
  };

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <div className="orders-header-section">
          <h1>My Orders</h1>
          <p>Track your purchases, manage deliveries, and view itemized order invoices</p>
        </div>

        {loading ? (
          <div className="orders-loading-state">
            <div className="orders-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-state">
            <FiPackage className="empty-icon" />
            <h2>No orders found</h2>
            <p>You haven't placed any orders yet. Explore our luxury footwear collection!</p>
            <button
              className="shop-now-btn"
              onClick={() => navigate("/")}
            >
              Explore Products <FiArrowRight />
            </button>
          </div>
        ) : (
          <div className="orders-grid-layout">
            {orders.map((order) => {
              const currentStatus = getStatusDetails(order.status);
              const orderIdStr = getOrderId(order);
              const totalVal = calculateOrderTotal(order.items, order.totalAmount);
              const recipientName = order.deliveryDetails?.name || "Customer";
              const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div className="order-premium-card" key={orderIdStr}>
                  {/* ================= HEADER BAR ================= */}
                  <div className="order-card-header">
                    <div className="header-meta-group">
                      <div className="meta-item">
                        <span className="meta-label">ORDER PLACED</span>
                        <span className="meta-value"><FiCalendar /> {formattedDate}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">TOTAL</span>
                        <span className="meta-value highlight">{formatPrice(totalVal)}</span>
                      </div>
                      <div className="meta-item recipient-item">
                        <span className="meta-label">SHIP TO</span>
                        <span className="meta-value"><FiUser /> {recipientName}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">PAYMENT</span>
                        <span className="meta-value payment-badge">
                          <FiCreditCard /> {getPaymentLabel(order.paymentMethod)}
                        </span>
                      </div>
                    </div>

                    <div className="header-right-group">
                      <span className="order-id-code">ORDER # {orderIdStr}</span>
                    </div>
                  </div>

                  {/* ================= PRODUCT ITEMS ================= */}
                  <div className="order-items-list">
                    {order.items.map((item, index) => {
                      const qty = getItemQty(item);
                      const itemTotal = (item.price || 0) * qty;

                      return (
                        <div className="order-product-row" key={index}>
                          <div className="product-image-box">
                            <img src={getImageUrl(item.image)} alt={item.name} />
                          </div>

                          <div className="product-info-col">
                            <h4 className="product-title">{item.name}</h4>
                            <div className="product-tags">
                              <span className="attr-tag">Size: UK {item.size}</span>
                              <span className="attr-tag">Qty: {qty}</span>
                            </div>
                            <div className="item-status-message">
                              {order.status === "Delivered" ? (
                                <span className="status-note success">
                                  <FiCheckCircle /> Delivered on {formattedDate}
                                </span>
                              ) : order.status === "Cancelled" ? (
                                <span className="status-note error">
                                  Order Cancelled
                                </span>
                              ) : (
                                <span className="status-note pending">
                                  <FiTruck /> Arriving soon • Expected in 3-5 business days
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="product-price-col">
                            <span className="price-label">{formatPrice(itemTotal)}</span>
                            {qty > 1 && (
                              <span className="unit-price-sub">({formatPrice(item.price)} each)</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ================= FOOTER SUMMARY & ACTIONS ================= */}
                  <div className="order-card-footer">
                    <div className="delivery-address-snippet">
                      <FiMapPin className="pin-icon" />
                      <span>
                        <strong>{recipientName}</strong> • {order.deliveryDetails?.address}, {order.deliveryDetails?.city} - {order.deliveryDetails?.pincode}
                      </span>
                    </div>

                    <div className="footer-actions-group">
                      <div
                        className="status-pill-badge"
                        style={{
                          backgroundColor: currentStatus.bg,
                          color: currentStatus.color,
                          borderColor: `${currentStatus.color}40`,
                        }}
                      >
                        {order.status === "Delivered" ? (
                          <FiCheckCircle />
                        ) : (
                          <FiClock />
                        )}
                        {currentStatus.text}
                      </div>

                      <button
                        className="track-order-btn"
                        onClick={() => setTrackingOrder(order)}
                      >
                        Track Shipment & Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= ENHANCED TRACKING & INVOICE MODAL ================= */}
        {trackingOrder && (
          <div
            className="modal-overlay"
            onClick={() => setTrackingOrder(null)}
          >
            <div
              className="tracking-premium-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h3>Order Details & Tracking</h3>
                  <p>
                    Order ID: <strong>{getOrderId(trackingOrder)}</strong> • Placed on {new Date(trackingOrder.createdAt || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setTrackingOrder(null)}
                >
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                {/* RECIPIENT & PAYMENT GRID */}
                <div className="info-cards-grid">
                  <div className="info-card">
                    <div className="card-title-row">
                      <FiMapPin />
                      <h4>Delivery Details</h4>
                    </div>
                    <p className="recipient-name">{trackingOrder.deliveryDetails?.name}</p>
                    <p className="address-text">
                      {trackingOrder.deliveryDetails?.address}, {trackingOrder.deliveryDetails?.city} - {trackingOrder.deliveryDetails?.pincode}
                    </p>
                    <p className="contact-text"><FiPhone /> {trackingOrder.deliveryDetails?.phone}</p>
                  </div>

                  <div className="info-card">
                    <div className="card-title-row">
                      <FiCreditCard />
                      <h4>Payment Information</h4>
                    </div>
                    <p className="payment-method-title">
                      {getPaymentLabel(trackingOrder.paymentMethod)}
                    </p>
                    {trackingOrder.paymentId && (
                      <p className="payment-id-tag">Transaction ID: {trackingOrder.paymentId}</p>
                    )}
                    <p className="payment-status-tag">
                      Status: <span className="status-highlight">{trackingOrder.paymentStatus || "Completed"}</span>
                    </p>
                  </div>
                </div>

                {/* TIMELINE STEPPER */}
                {trackingOrder.status !== "Cancelled" && (
                  <div className="tracking-stepper-box">
                    <h4>Shipment Progress</h4>
                    <div className="tracking-stepper">
                      {[
                        { status: "Pending", label: "Order Placed", desc: "Received and confirmed" },
                        { status: "Shipped", label: "Shipped", desc: "Package handed to courier" },
                        { status: "Delivered", label: "Delivered", desc: "Package delivered to recipient" },
                      ].map((step, stepIndex) => {
                        const getStepLevel = (status) => {
                          if (status === "Pending" || status === "Paid") return 0;
                          if (status === "Shipped") return 1;
                          if (status === "Delivered") return 2;
                          return 0;
                        };
                        const currentLevel = getStepLevel(trackingOrder.status);
                        const isCompleted = stepIndex <= currentLevel;

                        return (
                          <div
                            className={`stepper-item ${isCompleted ? "completed" : "pending"}`}
                            key={step.status}
                          >
                            <div className="stepper-dot">
                              {isCompleted ? <FiCheckCircle /> : <FiClock />}
                            </div>
                            <div className="stepper-content">
                              <h4>{step.label}</h4>
                              <p>{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ITEMIZED PRODUCTS BREAKDOWN */}
                <div className="modal-items-breakdown">
                  <h4>Ordered Items</h4>
                  <div className="modal-items-list">
                    {trackingOrder.items.map((item, idx) => {
                      const qty = getItemQty(item);
                      return (
                        <div className="modal-item-row" key={idx}>
                          <img src={getImageUrl(item.image)} alt={item.name} />
                          <div className="modal-item-info">
                            <h5>{item.name}</h5>
                            <p>Size UK {item.size} • Qty {qty}</p>
                          </div>
                          <span className="modal-item-price">
                            {formatPrice((item.price || 0) * qty)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COST SUMMARY FOOTER */}
                <div className="modal-footer-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateOrderTotal(trackingOrder.items, trackingOrder.totalAmount))}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className="free-badge">FREE</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Total Amount Paid</span>
                    <strong>{formatPrice(calculateOrderTotal(trackingOrder.items, trackingOrder.totalAmount))}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Orders;
