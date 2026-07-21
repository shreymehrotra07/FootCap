import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiPhone, FiUser, FiCreditCard, FiShield, FiTruck, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { isAuthenticated } from "../utils/auth";
import { paymentAPI } from "../utils/api";
import "./Checkout.css";

// Helper function to get image URL
function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split('/').pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

// Helper function to format price
function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to extract numeric price
function extractPrice(priceString) {
  if (typeof priceString === 'number') return priceString;
  if (!priceString) return 0;
  const numericValue = String(priceString).replace(/[₹,\s]/g, '');
  return parseInt(numericValue, 10) || 0;
}

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { addOrder } = useOrder();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    payment: "cod",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated()) {
      alert("Please login to place an order!");
      navigate("/login");
      return;
    }

    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      alert("Please fill all delivery details!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const orderData = {
      items: cartItems,
      totalAmount: totalAmount,
      deliveryDetails: {
        name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        pincode: form.pincode,
      },
      paymentMethod: form.payment,
    };

    // Case 1: Razorpay Payment
    if (form.payment === 'razorpay') {
      try {
        setLoading(true);

        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          alert('Failed to load payment gateway. Please check your internet connection.');
          setLoading(false);
          return;
        }

        // Create order on backend
        const orderResponse = await paymentAPI.createOrder({
          amount: totalAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderResponse.amount,
          currency: orderResponse.currency,
          name: 'FootCap',
          description: 'Premium Footwear Purchase',
          order_id: orderResponse.orderId,
          handler: async function (response) {
            try {
              const verificationResponse = await paymentAPI.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verificationResponse.success) {
                const orderId = await addOrder({
                  ...orderData,
                  paymentMethod: 'razorpay',
                  paymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpaySignature: response.razorpay_signature
                });

                await clearCart();
                alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${orderId}`);
                navigate('/orders');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              alert('Payment verification failed. Please contact support.');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: form.name,
            contact: form.phone
          },
          theme: {
            color: '#FF2A5F'
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();

      } catch (error) {
        console.error('Payment initiation error:', error);
        alert('Failed to initiate payment. Please try again.');
        setLoading(false);
      }
      return;
    }

    // Case 2: Cash on Delivery
    try {
      setLoading(true);
      const orderId = await addOrder(orderData);

      await clearCart();
      alert(`✅ Order Placed Successfully!\nOrder ID: ${orderId}`);
      navigate("/orders");
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="checkout-container">
        <div className="checkout-header-section">
          <h1>Secure Checkout</h1>
          <p>Complete your purchase with premium security</p>
        </div>

        <div className="checkout-content">
          {/* LEFT: FORM SECTION */}
          <div className="checkout-main">
            <form onSubmit={placeOrder}>
              {/* DELIVERY SECTION */}
              <div className="checkout-card">
                <div className="card-header">
                  <FiTruck />
                  <h3>Delivery Information</h3>
                </div>

                <div className="form-grid">
                  <div className="input-group full">
                    <label><FiUser /> Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label><FiPhone /> Contact Number</label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="+91 00000 00000"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label><FiMapPin /> Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="400001"
                      value={form.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="input-group full">
                    <label><FiMapPin /> Shipping Address</label>
                    <textarea
                      name="address"
                      placeholder="Street address, Apartment, Suite, etc."
                      value={form.address}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="input-group full">
                    <label><FiMapPin /> City / District</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT SECTION */}
              <div className="checkout-card mt-40">
                <div className="card-header">
                  <FiCreditCard />
                  <h3>Payment Preference</h3>
                </div>

                <div className="payment-options">
                  <label className={`pay-option ${form.payment === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={form.payment === "cod"}
                      onChange={handleChange}
                    />
                    <div className="pay-content">
                      <span className="pay-title">Cash on Delivery</span>
                      <span className="pay-desc">Pay when your package arrives</span>
                    </div>
                  </label>

                  <label className={`pay-option ${form.payment === 'razorpay' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={form.payment === "razorpay"}
                      onChange={handleChange}
                    />
                    <div className="pay-content">
                      <span className="pay-title">Online Payment (Razorpay)</span>
                      <span className="pay-desc">Pay securely via UPI, Card, NetBanking</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* FOOTER - SINGLE ACTION BUTTON */}
              <div className="checkout-footer-actions">
                <div className="security-trust">
                  <FiShield />
                  <span>256-bit SSL Secure Payment</span>
                </div>

                <button type="submit" disabled={loading} className="place-order-btn">
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      {form.payment === 'razorpay' ? "Pay & Place Order" : "Complete Purchase"} <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: SUMMARY SECTION */}
          <aside className="checkout-summary-card">
            <h3>Order Review</h3>

            <div className="summary-items-list">
              {cartItems.map((item) => {
                const itemPrice = item.priceNumeric !== undefined
                  ? item.priceNumeric
                  : extractPrice(item.price);
                const itemTotal = itemPrice * item.quantity;

                return (
                  <div className="review-item" key={`${item.id}-${item.size}`}>
                    <div className="review-img">
                      <img src={getImageUrl(item.image)} alt={item.name} />
                      <span className="qty-badge">{item.quantity}</span>
                    </div>

                    <div className="review-text">
                      <h4>{item.name}</h4>
                      <p>Size UK {item.size}</p>
                    </div>

                    <span className="review-price">
                      {formatPrice(itemTotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-calculations">
              <div className="calc-line">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="calc-line">
                <span>Delivery Fee</span>
                <span className="free-tag">FREE</span>
              </div>
            </div>

            <div className="summary-total-final">
              <span>Payable Total</span>
              <strong>{formatPrice(totalAmount)}</strong>
            </div>

            <div className="trust-badges-checkout">
              <div className="trust-badge">
                <FiTruck />
                <span>Express Delivery</span>
              </div>
              <div className="trust-badge">
                <FiShield />
                <span>Quality Check</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Checkout;
