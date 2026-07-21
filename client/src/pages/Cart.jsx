import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Cart.css";


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

function Cart() {
    const navigate = useNavigate();

    const {
        cartItems,
        increaseQty,
        decreaseQty,
        removeFromCart,
        totalAmount,
    } = useCart();

    return (
        <>
            <Navbar />
            <div className="cart-container">
                <div className="cart-header-section">
                    <h1>Shopping Bag</h1>
                    <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your bag</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <FiShoppingBag className="empty-icon" />
                        <h2>Your bag is empty</h2>
                        <p>Looking for inspiration? Check out our latest drops.</p>
                        <button className="shop-now" onClick={() => navigate("/")}>
                            Explore Products <FiArrowRight />
                        </button>
                    </div>
                ) : (
                    <div className="cart-content">
                        {/* ITEMS LIST */}
                        <div className="cart-items-list">
                            {cartItems.map((item) => (
                                <div className="cart-card" key={`${item.id}-${item.size}`}>
                                    <div className="cart-card-img">
                                        <img src={getImageUrl(item.image)} alt={item.name} />
                                    </div>

                                    <div className="cart-card-info">
                                        <div className="info-top">
                                            <h3>{item.name}</h3>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.id, item.size)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                        
                                        <p className="item-meta">
                                            Size: <span>UK {item.size}</span>
                                        </p>

                                        <div className="info-bottom">
                                            <div className="qty-picker">
                                                <button onClick={() => decreaseQty(item.id, item.size)}>
                                                    <FiMinus />
                                                </button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => increaseQty(item.id, item.size)}>
                                                    <FiPlus />
                                                </button>
                                            </div>

                                            <div className="price-display">
                                                <span className="per-item">
                                                    {formatPrice(item.priceNumeric !== undefined ? item.priceNumeric : extractPrice(item.price))}
                                                </span>
                                                <span className="item-total">
                                                    {formatPrice((item.priceNumeric !== undefined ? item.priceNumeric : extractPrice(item.price)) * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ORDER SUMMARY */}
                        <aside className="cart-summary-card">
                            <h3>Order Summary</h3>
                            
                            <div className="summary-details">
                                <div className="summary-line">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(totalAmount)}</span>
                                </div>
                                <div className="summary-line">
                                    <span>Estimated Shipping</span>
                                    <span className="free">FREE</span>
                                </div>
                                <div className="summary-line">
                                    <span>Tax</span>
                                    <span>Included</span>
                                </div>
                            </div>

                            <div className="summary-total-line">
                                <span>Total Amount</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>

                            <button className="checkout-btn" onClick={() => navigate("/checkout")}>
                                Proceed to Checkout
                                <FiArrowRight />
                            </button>

                            <div className="payment-trust">
                                <p>Secure Payment Guaranteed</p>
                                <div className="trust-icons">
                                    {/* Mock icons */}
                                    <span>VISA</span>
                                    <span>MC</span>
                                    <span>UPI</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Cart;
