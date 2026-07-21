import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { productAPI } from "../utils/api";
import { FiHeart, FiShoppingBag, FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./ProductDetail.css";

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split("/").pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [size, setSize] = useState(9);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Product not found");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, size);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2400);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) return <div className="pd-notfound">Loading product...</div>;
  if (error || !product) return <div className="pd-notfound">Product not found</div>;

  const productId = product._id || product.id;

  return (
    <>
      <Navbar />
      <div className="pd-wrapper">
        <div className="pd">

          {/* LEFT — IMAGE */}
          <div className="pd-image-section">
            <div className="image-main">
              <img src={getImageUrl(product.image)} alt={product.name} />
              {product.badge && <span className="pd-badge">{product.badge}</span>}
            </div>

            <div className="pd-trust-badges">
              <div className="trust-item">
                <FiTruck />
                <span>Free Delivery</span>
              </div>
              <div className="trust-item">
                <FiShield />
                <span>2 Year Warranty</span>
              </div>
              <div className="trust-item">
                <FiRefreshCw />
                <span>30 Day Returns</span>
              </div>
            </div>
          </div>

          {/* RIGHT — INFO */}
          <div className="pd-info">

            <span className="pd-brand-tag">{product.brand}</span>
            <h1>{product.name}</h1>

            <div className="pd-meta">
              <span>{product.gender} · {product.category}</span>
              <span className="pd-popularity">★ {product.popularity || "4.8"} Rating</span>
            </div>

            <div className="pd-price-box">
              <span className="current-price">{product.priceDisplay}</span>
              <span className="tax-info">Inclusive of all taxes</span>
            </div>

            <div className="pd-description">
              <h3>Description</h3>
              <p>
                {product.description ||
                  "Experience the ultimate fusion of performance and luxury. These premium sneakers feature advanced cushioning technology and sustainable materials, crafted for those who demand both style and comfort."}
              </p>
            </div>

            <div className="pd-sizes">
              <div className="section-header">
                <h4>Select Size (UK)</h4>
                <button className="size-guide">Size Guide</button>
              </div>
              <div className="size-grid">
                {(product.sizes && product.sizes.length > 0
                  ? product.sizes
                  : [6, 7, 8, 9, 10, 11, 12]
                ).map((s) => (
                  <span
                    key={s}
                    className={`size-btn${size === s ? " active" : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pd-actions">
              <button className="add-cart-btn" onClick={handleAddToCart}>
                <FiShoppingBag />
                Add to Cart
              </button>

              <button
                className={`pd-wish-icon${isWishlisted(productId) ? " active" : ""}`}
                onClick={() => toggleWishlist(product)}
                title="Add to Wishlist"
              >
                <FiHeart fill={isWishlisted(productId) ? "currentColor" : "none"} />
              </button>
            </div>

            <div className="pd-delivery-check">
              <h3>Check Delivery</h3>
              <div className="pincode-input">
                <input type="text" placeholder="Enter Pincode" maxLength={6} />
                <button>Check</button>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />

      {showNotification && (
        <div className="pd-notification">
          <div className="noti-content">
            <span className="check">✓</span>
            <div>
              <p>Added to Cart!</p>
              <small>{product.name} · Size UK {size}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductDetail;