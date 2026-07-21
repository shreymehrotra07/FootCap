import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminProducts, deleteProduct } from "../utils/adminAPI";
import {
  FiPlus,
  FiSearch,
  FiX,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
  FiFilter,
  FiGrid,
  FiList
} from "react-icons/fi";

// Helper function to get proper image URL
function getImageUrl(imagePath) {
  if (!imagePath) return '/src/assets/images/default-product.jpg';
  const filename = imagePath.split('/').pop();
  try {
    return new URL(`../assets/images/${filename}`, import.meta.url).href;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    return '/src/assets/images/default-product.jpg';
  }
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    brand: "",
    category: "",
    gender: ""
  });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genders, setGenders] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts(currentPage, 20, filters);
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalProducts(response.totalProducts);

      // Extract unique values for filters
      const uniqueBrands = [...new Set(response.products.map(p => p.brand))];
      const uniqueCategories = [...new Set(response.products.map(p => p.category))];
      const uniqueGenders = [...new Set(response.products.map(p => p.gender))];

      setBrands(uniqueBrands);
      setCategories(uniqueCategories);
      setGenders(uniqueGenders);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or filters change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      brand: "",
      category: "",
      gender: ""
    });
    setCurrentPage(1);
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        // Refresh the product list
        fetchProducts();
      } catch (err) {
        alert(`Error deleting product: ${err.message}`);
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-products">
      <div className="admin-page-header">
        <div className="page-title">
          <h1>Product Management</h1>
          <p>Manage your product catalog and inventory</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="search-row">
          <div className="filter-item full-width">
            <label htmlFor="search">SEARCH PRODUCTS</label>
            <div className="filter-input-group">
              <input
                id="search"
                type="text"
                placeholder="Search by name, brand, or category..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              {filters.search && (
                <button
                  className="clear-filter-btn"
                  onClick={() => handleFilterChange('search', '')}
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="filter-selects-row">
          <div className="filter-item">
            <label htmlFor="brand">BRAND</label>
            <select
              id="brand"
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="category">CATEGORY</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="gender">GENDER</label>
            <select
              id="gender"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">All Genders</option>
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="admin-loading">
          <FiRefreshCw className="spinner" />
          <p>Loading products...</p>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>Error: {error}</p>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && !error && (
        <>
          <div className="view-controls">
            <div className="view-mode-selector">
              <button
                className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
            <div className="results-count">
              Showing {Math.min((currentPage - 1) * 20 + 1, totalProducts)}-{Math.min(currentPage * 20, totalProducts)} of {totalProducts} products
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="products-grid">
              {products.length === 0 ? (
                <div className="no-data-card">
                  <FiSearch size={48} />
                  <h3>No products found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                products.map(product => (
                  <div key={product._id} className="product-card">
                    <div className="product-image">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/src/assets/images/default-product.jpg';
                        }}
                        className="product-thumb"
                      />
                      {product.badge && (
                        <span className={`badge ${product.badge.toLowerCase()}`}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p className="product-brand">{product.brand}</p>
                      <p className="product-category">{product.category}</p>
                      <div className="product-meta">
                        <span className="product-price">{formatCurrency(product.price)}</span>
                        <div className={`stock-status ${product.stock <= 10 ? 'low' : ''}`}>
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                    <div className="product-actions">
                      <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="btn btn-sm btn-outline"
                        title="Edit Product"
                      >
                        <FiEdit2 />
                      </Link>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(product._id)}
                        title="Delete Product"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Gender</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product._id}>
                        <td className="product-image-cell">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = '/src/assets/images/default-product.jpg';
                            }}
                            className="product-thumb"
                          />
                        </td>
                        <td className="product-name">
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            {product.badge && (
                              <span className={`badge ${product.badge.toLowerCase()}`}>
                                {product.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{product.brand}</td>
                        <td>{product.category}</td>
                        <td>{formatCurrency(product.price)}</td>
                        <td>
                          <span className={`stock-status ${product.stock <= 10 ? 'low' : ''}`}>
                            {product.stock}
                          </span>
                        </td>
                        <td>{product.gender}</td>
                        <td>{formatDate(product.createdAt)}</td>
                        <td className="actions-cell">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="btn btn-sm btn-outline"
                            title="Edit Product"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(product._id)}
                            title="Delete Product"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft /> Previous
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages} ({totalProducts} total)
              </span>

              <button
                className="btn btn-outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminProducts;