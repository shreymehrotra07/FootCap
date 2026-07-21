import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../utils/api";
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiHeart, FiShoppingBag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import CustomSelect from "../components/CustomSelect";
import "./MenProducts.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrival" },
  { value: "popularity", label: "Popularity" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name", label: "Name (A-Z)" }
];

// Helper function to get image URL
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  const filename = imagePath.split("/").pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function UrbanMinimalist() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [toast, setToast] = useState(false);

  const [activeBrand, setActiveBrand] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Lifestyle");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeMinPrice, setActiveMinPrice] = useState("");
  const [activeMaxPrice, setActiveMaxPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getPaginated(currentPage, productsPerPage, { 
          sort: sortBy,
          minPrice: activeMinPrice,
          maxPrice: activeMaxPrice,
          size: selectedSize,
          color: selectedColor,
          search: activeSearchQuery,
        });
        
        let filteredProducts = data.products || [];
        
        filteredProducts = filteredProducts.filter(product => {
          const nameLower = product.name.toLowerCase();
          const descLower = (product.description || "").toLowerCase();
          const categoryLower = (product.category || "").toLowerCase();
          
          const urbanKeywords = [
            'lifestyle', 'casual', 'minimalist', 'urban', 'street', 
            'classic', 'clean', 'simple', 'everyday', 'modern', 'sleek'
          ];
          
          const hasUrbanKeyword = urbanKeywords.some(keyword => 
            nameLower.includes(keyword) || 
            descLower.includes(keyword) || 
            categoryLower.includes(keyword)
          );
          
          const isClassicStyle = product.price >= 50 && product.price <= 300;
          return hasUrbanKeyword || isClassicStyle;
        });

        if (data.products && data.pagination) {
          setProducts(filteredProducts);
          setTotalPages(data.pagination.totalPages);
          setTotalProducts(filteredProducts.length);
        } else {
          setProducts(filteredProducts);
          setTotalPages(1);
          setTotalProducts(filteredProducts.length);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, sortBy, activeMinPrice, activeMaxPrice, selectedSize, selectedColor, activeSearchQuery]);

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

  const handlePriceChange = (e, type) => {
    if (type === 'min') setMinPrice(e.target.value);
    if (type === 'max') setMaxPrice(e.target.value);
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') {
      setActiveMinPrice(minPrice);
      setActiveMaxPrice(maxPrice);
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setActiveSearchQuery(searchQuery);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  if (loading && currentPage === 1 && products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="plp">
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "8rem 2rem", width: "100%" }}>
            <div className="loader"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <div className="plp">
        <div style={{ textAlign: "center", padding: "4rem", color: "#FF2A5F" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="plp">
        {/* SIDEBAR */}
        <aside className="plp-sidebar">
          <div className="sidebar-title">
            <FiFilter />
            <h3>Filters</h3>
          </div>

          <h4>Categories</h4>
          <ul>
            {["All Lifestyle", "Casual", "Lifestyle", "Everyday", "Street Style"].map((cat) => (
              <li 
                key={cat}
                className={activeCategory === cat ? "active" : ""}
                onClick={() => {
                  setActiveCategory(cat);
                  setCurrentPage(1);
                }}
              >
                {cat}
              </li>
            ))}
          </ul>

          <h4>Brands</h4>
          <div className="tag-group">
            {["", "Nike", "Adidas", "Converse", "Vans", "New Balance", "Common Projects"].map((brand) => (
              <span
                key={brand}
                className={activeBrand === brand ? "active" : ""}
                onClick={() => {
                  setActiveBrand(brand);
                  setCurrentPage(1);
                }}
              >
                {brand || "All"}
              </span>
            ))}
          </div>

          <h4>Price Range</h4>
          <div className="price-inputs">
            <input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => handlePriceChange(e, 'min')}
              onKeyDown={handlePriceKeyDown}
            />
            <input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => handlePriceChange(e, 'max')}
              onKeyDown={handlePriceKeyDown}
            />
          </div>

          <h4>Sizes</h4>
          <div className="size-tags">
            {["", 6, 7, 8, 9, 10, 11, 12].map((size) => (
              <span
                key={size}
                className={selectedSize === size ? "active" : ""}
                onClick={() => { setSelectedSize(size); setCurrentPage(1); }}
              >
                {size || "All"}
              </span>
            ))}
          </div>

          <h4>Colors</h4>
          <div className="color-tags">
            {["", "Black", "White", "Grey", "Beige", "Brown", "Navy"].map((color) => (
              <span
                key={color}
                className={selectedColor === color ? "active" : ""}
                onClick={() => { setSelectedColor(color); setCurrentPage(1); }}
              >
                {color || "All"}
              </span>
            ))}
          </div>
        </aside>

        <section className="plp-content">
          <div className="plp-header">
            <div className="header-text">
              <h2>Urban Minimalist</h2>
              <span>Sleek lines for the modern explorer. Showing {products.length} of {totalProducts} items.</span>
            </div>

            <div className="sort-box">
              <span>Sort by:</span>
              <CustomSelect
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => {
                  setSortBy(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* GRID */}
          <div className="plp-grid">
            {products.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem",
                  color: "#A0A0AB",
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                <h3>No products found</h3>
              </div>
            ) : (
              products.map((p, index) => {
                const productId = p._id || p.id;
                const brandText = p.brand || p.category || 'Urban';
                const priceText = p.priceDisplay || `₹${p.price?.toLocaleString('en-IN')}`;

                return (
                  <div className="plp-card-wrap" key={productId}>
                    <Link
                      to={`/product/${productId}`}
                      className="plp-card"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {p.badge && <span className="badge">{p.badge}</span>}

                      <div className="img-box">
                        <img src={getImageUrl(p.image)} alt={p.name} />
                        <div className="plp-card-overlay" />
                        <button
                          className="plp-quick-add"
                          onClick={(e) => handleAddToCart(e, p)}
                        >
                          <FiShoppingBag /> Add to Cart
                        </button>
                      </div>

                      <div className="plp-card-info">
                        <p className="plp-card-brand">{brandText}</p>
                        <h5>{p.name}</h5>
                        <p>
                          {p.gender ? `${p.gender} • ` : ''}{p.category}
                        </p>
                        <span className="price">{priceText}</span>
                      </div>
                    </Link>

                    <button
                      className={`plp-wish-btn${isWishlisted(productId) ? ' active' : ''}`}
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        toggleWishlist(p); 
                      }}
                      title="Add to wishlist"
                    >
                      <FiHeart />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "disabled" : ""}
              >
                <FiChevronLeft />
              </button>
              
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={currentPage === pageNum ? "active" : ""}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={currentPage === totalPages ? "disabled" : ""}
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </section>
      </div>

      <div className={`plp-toast${toast ? ' visible' : ''}`}>✓ Added to Cart</div>
      <Footer />
    </>
  );
}

export default UrbanMinimalist;