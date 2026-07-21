import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { productAPI } from "../utils/api";
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiHeart, FiShoppingBag } from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import CustomSelect from "../components/CustomSelect";
import "./MenProducts.css"; // Reuse the same premium styles

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
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const filename = imagePath.split("/").pop();
  return new URL(`../assets/images/${filename}`, import.meta.url).href;
}

function NewArrivalsPage() {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [toast, setToast] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";

  const [activeBrand, setActiveBrand] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Footwear");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activeMinPrice, setActiveMinPrice] = useState("");
  const [activeMaxPrice, setActiveMaxPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialSearch);
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
          brand: activeBrand,
          category: activeCategory === "All Footwear" ? "" : activeCategory,
          sort: sortBy,
          minPrice: activeMinPrice,
          maxPrice: activeMaxPrice,
          size: selectedSize,
          color: selectedColor,
          search: activeSearchQuery
        });
        
        setProducts(data.products || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalProducts(data.pagination.totalProducts);
        } else {
          setTotalPages(1);
          setTotalProducts(data.products?.length || 0);
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
  }, [currentPage, activeBrand, activeCategory, sortBy, activeMinPrice, activeMaxPrice, selectedSize, selectedColor, activeSearchQuery]);

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

  const handleBrandChange = (brand) => {
    setActiveBrand(brand);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
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
            {["All Footwear", "Running", "Basketball", "Lifestyle"].map((cat) => (
              <li 
                key={cat}
                className={activeCategory === cat ? "active" : ""}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>

          <h4>Brands</h4>
          <div className="tag-group">
            {["", "Nike", "Adidas", "Jordan", "Puma", "Reebok"].map((brand) => (
              <span
                key={brand}
                className={activeBrand === brand ? "active" : ""}
                onClick={() => handleBrandChange(brand)}
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
            {["", "Black", "White", "Blue", "Red", "Grey"].map((color) => (
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
              <h2>New Arrivals</h2>
              <span>Showing {products.length} of {totalProducts} latest items</span>
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
            {loading ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "#A0A0AB" }}>
                Loading latest drops...
              </div>
            ) : products.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem", color: "#A0A0AB" }}>
                No products found matching your filters.
              </div>
            ) : (
              products.map((p, index) => {
                const productId = p._id || p.id;
                const brandText = p.brand || p.category || 'Premium';
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

export default NewArrivalsPage;
