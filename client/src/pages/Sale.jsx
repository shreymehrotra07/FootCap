import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FiHeart, FiShoppingBag, FiPercent, FiZap } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Sale.css";

// Helper function to get image URL
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split("/").pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function Sale() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const brands = ["", "Nike", "Adidas", "Jordan", "Puma", "Reebok"];
  const categories = ["", "Running", "Basketball", "Lifestyle", "Training"];

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        setLoading(true);
        // Fetch products with filters - showing all brands and categories
        const data = await productAPI.getPaginated(1, 50, {
          brand: selectedBrand,
          category: selectedCategory,
          sort: 'price-low'
        });

        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching sale products:", err);
        setError("Failed to load sale products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, [selectedBrand, selectedCategory]);

  // Calculate fake discount for display (15-30% off)
  const calculateDiscount = (price) => {
    const discountPercent = 15 + Math.floor(Math.random() * 16); // 15-30%
    const originalPrice = Math.floor(price * (1 + discountPercent / 100));
    return { originalPrice, discountPercent };
  };

  if (loading) {
    return (
      <div className="sale-page">
        <div style={{ textAlign: "center", padding: "2rem", color: "#fff" }}>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sale-page">
        <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="sale-page-wrapper">
        <Navbar />
      <div className="sale-container">
        {/* SALE HERO SECTION */}
        <section className="sale-hero-premium">
          <div className="sale-hero-content">
            <div className="sale-tag">
              <FiZap />
              <span>Limited Time Offer</span>
            </div>
            <h1>The Mega Sale</h1>
            <p>Unbeatable deals on world-class performance footwear. Up to 50% Off.</p>
            <div className="countdown-timer">
              <div className="time-box"><span>02</span><small>Days</small></div>
              <div className="time-box"><span>14</span><small>Hours</small></div>
              <div className="time-box"><span>45</span><small>Mins</small></div>
            </div>
          </div>
        </section>

        {/* FILTER BAR SECTION */}
        <div className="sale-filters-premium">
          <div className="filter-group">
            <h3>Filter By Brand</h3>
            <div className="filter-scroll">
              {brands.map((brand) => (
                <button
                  key={brand}
                  className={selectedBrand === brand ? "active" : ""}
                  onClick={() => setSelectedBrand(brand)}
                >
                  {brand || "All Brands"}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3>Filter By Category</h3>
            <div className="filter-scroll">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? "active" : ""}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat || "All Categories"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SALE GRID SECTION */}
        <div className="sale-grid-premium">
          {products.length === 0 ? (
            <div className="no-sale-products">
              <FiPercent className="no-icon" />
              <p>No sale products found in this category.</p>
            </div>
          ) : (
            products.map((product) => {
              const productId = product._id || product.id;
              const { originalPrice, discountPercent } = calculateDiscount(product.price);

              return (
                <div key={productId} className="sale-item-card">
                  <div className="sale-item-badge">-{discountPercent}% OFF</div>
                  
                  <Link to={`/product/${productId}`} className="sale-item-img">
                    <img src={getImageUrl(product.image)} alt={product.name} />
                  </Link>

                  <div className="sale-item-info">
                    <span className="sale-item-brand">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <p>{product.category} • {product.gender}</p>

                    <div className="sale-item-pricing">
                      <span className="sale-current-price">{product.priceDisplay}</span>
                      <span className="sale-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="sale-item-actions">
                      <button
                        className="sale-item-add"
                        onClick={() => addToCart(product, 9)}
                      >
                        <FiShoppingBag /> Add to Cart
                      </button>

                      <button
                        className={`sale-item-wish ${isWishlisted(productId) ? "active" : ""}`}
                        onClick={() => toggleWishlist(product)}
                      >
                        <FiHeart fill={isWishlisted(productId) ? "currentColor" : "none"} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
      </div>
    </>
  );
}

export default Sale;
