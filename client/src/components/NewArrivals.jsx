import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NewArrivals.css";
import { productAPI } from "../utils/api";
import { useCart } from "../context/CartContext";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";

function getImageUrl(imagePath) {
  if (!imagePath) return '';
  const filename = imagePath.split('/').pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function NewArrivals() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [toast, setToast] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products from API...');
        const data = await productAPI.getAll();
        console.log('Products API response:', data);
        setProducts(data.products || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product, 9);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <section className="fc-arrivals">
        <div className="fc-arrivals-container">
          <div className="fc-arrivals-header">
            <div className="fc-arrivals-header-left">
              <p className="fc-section-eyebrow">New In</p>
              <h2 className="fc-arrivals-title">Latest <em>Arrivals</em></h2>
            </div>
          </div>
          <div style={{
            textAlign: 'center', 
            padding: '5rem',
            color: '#A0A0AB',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            letterSpacing: '3px',
            textTransform: 'uppercase'
          }}>
            Loading Collection...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="fc-arrivals">
        <div className="fc-arrivals-container">
          <div style={{ textAlign: 'center', padding: '4rem', color: '#FF2A5F' }}>{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="fc-arrivals">
      <div className="fc-arrivals-container">

        <div className="fc-arrivals-header">
          <div className="fc-arrivals-header-left">
            <p className="fc-section-eyebrow">New In</p>
            <h2 className="fc-arrivals-title">Latest <em>Arrivals</em></h2>
          </div>
          <div className="fc-arrivals-header-right">
            <button className="fc-view-all-btn" onClick={() => navigate('/new-arrivals')}>
              View All Styles
            </button>
          </div>
        </div>

        <div className="fc-product-grid">
          {products.slice(0, 8).map((item, index) => {
            const productId = item._id || item.id;
            const badgeText = item.badge || (index < 3 ? 'New' : null);
            const brandText = item.brand || item.category || 'Premium';
            const priceText = item.priceDisplay || `₹${item.price?.toLocaleString('en-IN')}`;

            return (
              <div className="fc-card-wrap" key={productId}>
                <Link to={`/product/${productId}`} className="fc-product-card">
                  <div className="fc-card-img">
                    <img src={getImageUrl(item.image)} alt={item.name} />
                    <div className="fc-card-overlay" />
                    {badgeText && <span className="fc-card-badge">{badgeText}</span>}
                    <button
                      className="fc-quick-add"
                      onClick={(e) => handleAddToCart(e, item)}
                    >
                      <FiShoppingBag /> Add to Cart
                    </button>
                  </div>
                  <div className="fc-card-info">
                    <p className="fc-card-brand">{brandText}</p>
                    <h3 className="fc-card-name">{item.name}</h3>
                    <div className="fc-card-bottom">
                      <p className="fc-card-price">{priceText}</p>
                    </div>
                  </div>
                </Link>
                <button
                  className={`fc-wish-btn${isWishlisted(productId) ? ' active' : ''}`}
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    toggleWishlist(item); 
                  }}
                  title="Add to wishlist"
                >
                  <FiHeart />
                </button>
              </div>
            );
          })}
        </div>

      </div>

      <div className={`fc-add-toast${toast ? ' visible' : ''}`}>✓ Added to Cart</div>
    </section>
  );
}

export default NewArrivals;