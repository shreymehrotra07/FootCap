import React, { useState, useEffect } from "react";
import { getAdminOrders, updateOrderStatus, getOrderById, deleteOrder } from "../utils/adminAPI";
import {
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCreditCard,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiX
} from "react-icons/fi";

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split('/').pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all"
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAdminOrders(currentPage, 20, filters.status);
      setOrders(response.orders || []);
      setTotalPages(response.totalPages || 1);
      setTotalOrders(response.totalOrders || 0);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const handleFilterChange = (status) => {
    setFilters({ status });
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to update order status to ${newStatus}?`)) {
      try {
        await updateOrderStatus(orderId, newStatus);
        fetchOrders();
      } catch (err) {
        alert(`Error updating order status: ${err.message}`);
      }
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const order = await getOrderById(orderId);
      setSelectedOrder(order);
      setShowDetails(true);
    } catch (err) {
      alert(`Error fetching order details: ${err.message}`);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (err) {
        alert(`Error deleting order: ${err.message}`);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Paid':
        return 'status-paid';
      case 'Shipped':
        return 'status-shipped';
      case 'Delivered':
        return 'status-delivered';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedOrder(null);
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const orderId = (order.orderId || "").toLowerCase();
    const name = (order.userId?.name || order.deliveryDetails?.name || "").toLowerCase();
    const email = (order.userId?.email || "").toLowerCase();
    return orderId.includes(q) || name.includes(q) || email.includes(q);
  });

  return (
    <div className="admin-orders">
      <div className="admin-page-header">
        <div>
          <h1>Order Management</h1>
          <p className="subtitle">Track customer orders, manage shipments, and update payment statuses</p>
        </div>
        <button className="btn btn-outline refresh-btn" onClick={fetchOrders}>
          <FiRefreshCw className={loading ? "spinner" : ""} /> Refresh
        </button>
      </div>


      {/* FILTER & SEARCH BAR */}
      <div className="admin-filters-bar">
        <div className="search-input-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills-group">
          {['all', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              className={`filter-pill-btn ${filters.status === st ? 'active' : ''}`}
              onClick={() => handleFilterChange(st)}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="admin-loading">
          <FiRefreshCw className="spinner" />
          <p>Loading orders...</p>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>Error: {error}</p>
          <button className="btn btn-secondary" onClick={fetchOrders}>
            Retry
          </button>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const customerName = order.userId?.name || order.deliveryDetails?.name || 'Customer';
                    const customerEmail = order.userId?.email || 'N/A';
                    const initials = customerName.substring(0, 2).toUpperCase();

                    return (
                      <tr key={order.orderId || order._id}>
                        <td className="order-id-cell">
                          <span className="order-id-tag">#{order.orderId}</span>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="user-avatar-initials">{initials}</div>
                            <div className="user-details">
                              <span className="user-name">{customerName}</span>
                              <span className="user-email">{customerEmail}</span>
                            </div>
                          </div>
                        </td>
                        <td className="order-total-cell">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td>
                          <span className={`payment-pill ${order.paymentMethod}`}>
                            <FiCreditCard />
                            {order.paymentMethod === 'razorpay' ? 'Razorpay' : 
                             order.paymentMethod === 'cod' ? 'COD' : 'Card'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(order.createdAt)}</td>
                        <td className="actions-cell">
                          <button
                            className="action-icon-btn view"
                            onClick={() => viewOrderDetails(order.orderId)}
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          
                          <div className="status-dropdown-wrapper">
                            <button
                              className="action-icon-btn edit"
                              title="Change Status"
                            >
                              <FiEdit2 />
                            </button>
                            <div className="status-dropdown-menu">
                              <div className="dropdown-header-title">Change Status</div>
                              {['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled']
                                .filter((s) => s !== order.status)
                                .map((s) => (
                                  <button
                                    key={s}
                                    className="status-dropdown-item"
                                    onClick={() => handleStatusUpdate(order.orderId, s)}
                                  >
                                    <span className={`status-dot ${s.toLowerCase()}`}></span>
                                    Set to {s}
                                  </button>
                                ))}
                            </div>
                          </div>

                          <button
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(order.orderId)}
                            title="Delete Order"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Previous
              </button>
              
              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({totalOrders} total)
              </span>
              
              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Order Details</h2>
                <p>Order ID: <strong>#{selectedOrder.orderId || selectedOrder._id}</strong> • Placed on {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button className="modal-close" onClick={closeDetails}>
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <div className="admin-modal-grid">
                {/* CUSTOMER & DELIVERY CARD */}
                <div className="admin-info-card">
                  <div className="card-header-sm">
                    <FiMapPin />
                    <h3>Delivery & Customer Details</h3>
                  </div>
                  <p className="card-primary-title">
                    <FiUser /> {selectedOrder.userId?.name || selectedOrder.deliveryDetails?.name || 'N/A'}
                  </p>
                  <p className="card-sub-text">{selectedOrder.userId?.email || 'No email provided'}</p>
                  <p className="card-sub-text"><FiPhone /> {selectedOrder.deliveryDetails?.phone || selectedOrder.userId?.phone || 'N/A'}</p>
                  <div className="address-box">
                    <span>{selectedOrder.deliveryDetails?.address || 'N/A'}, {selectedOrder.deliveryDetails?.city || 'N/A'} - {selectedOrder.deliveryDetails?.pincode || 'N/A'}</span>
                  </div>
                </div>

                {/* PAYMENT & STATUS CARD */}
                <div className="admin-info-card">
                  <div className="card-header-sm">
                    <FiCreditCard />
                    <h3>Payment & Fulfillment</h3>
                  </div>
                  <div className="detail-row">
                    <span>Order Status:</span>
                    <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Payment Method:</span>
                    <span className="pay-tag">{selectedOrder.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}</span>
                  </div>
                  {selectedOrder.paymentMethod === 'razorpay' && (
                    <>
                      <div className="detail-row">
                        <span>Payment Status:</span>
                        <span className="status-highlight">{selectedOrder.paymentStatus?.toUpperCase() || 'PAID'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Payment ID:</span>
                        <span className="code-text">{selectedOrder.paymentId || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span>Razorpay Order ID:</span>
                        <span className="code-text">{selectedOrder.razorpayOrderId || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ORDER ITEMS LIST */}
              <div className="admin-modal-items">
                <h3>Ordered Items</h3>
                <div className="modal-items-table">
                  {selectedOrder.items?.map((item, index) => {
                    const itemName = item.name || item.productId?.name || 'Footwear Product';
                    const itemImage = item.image || item.productId?.image;

                    return (
                      <div key={index} className="modal-product-row">
                        <div className="modal-prod-img">
                          <img src={getImageUrl(itemImage)} alt={itemName} />
                        </div>
                        <div className="modal-prod-info">
                          <h4>{itemName}</h4>
                          <div className="modal-tags">
                            <span>Size: UK {item.size}</span>
                            <span>Qty: {item.quantity || item.qty}</span>
                          </div>
                        </div>
                        <div className="modal-prod-price">
                          {formatCurrency(item.price * (item.quantity || item.qty || 1))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOTAL COST SUMMARY */}
              <div className="admin-modal-summary">
                <div className="summary-line">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;