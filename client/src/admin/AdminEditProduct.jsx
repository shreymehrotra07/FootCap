import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct, uploadProductImage } from "../utils/adminAPI";
import { FiArrowLeft, FiUpload, FiSave, FiX, FiPlus, FiMinus, FiRefreshCw } from "react-icons/fi";

function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    gender: "Men",
    price: "",
    description: "",
    sizes: [],
    colors: [],
    stock: 100,
    badge: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const product = await getProductById(id);
        
        setFormData({
          name: product.name || "",
          brand: product.brand || "",
          category: product.category || "",
          gender: product.gender || "Men",
          price: product.price || "",
          description: product.description || "",
          sizes: product.sizes || [],
          colors: product.colors || [],
          stock: product.stock || 100,
          badge: product.badge || ""
        });
        
        setCurrentImageUrl(product.image || "");
        setPreviewUrl(product.image || "");
      } catch (err) {
        setError(err.message || "Failed to load product");
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle array inputs (sizes and colors)
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], field === 'colors' ? "" : "9"]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!formData.brand.trim()) {
      setError("Brand is required");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Category is required");
      return false;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    if (formData.sizes.some(size => !size.trim())) {
      setError("All sizes must be filled");
      return false;
    }

    if (formData.colors.some(color => !color.trim())) {
      setError("All colors must be filled");
      return false;
    }

    if (formData.stock < 0) {
      setError("Stock cannot be negative");
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      let imageUrl = currentImageUrl; // Use existing image if no new image uploaded
      
      // Upload new image if provided
      if (imageFile) {
        const imageResponse = await uploadProductImage(imageFile);
        imageUrl = imageResponse.imagePath;
      }

      // Prepare product data
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        sizes: formData.sizes.filter(size => size.trim() !== ""),
        colors: formData.colors.filter(color => color.trim() !== ""),
        image: imageUrl
      };

      // Update product
      await updateProduct(id, productData);
      setSuccess("Product updated successfully!");
      
      // Refresh the product data after successful update
      setTimeout(() => {
        navigate("/admin/products");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update product");
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-edit-product">
        <div className="admin-page-header">
          <button 
            className="btn btn-back"
            onClick={() => navigate("/admin/products")}
          >
            <FiArrowLeft /> Back to Products
          </button>
          <h1>Edit Product</h1>
        </div>
        <div className="admin-loading">
          <FiRefreshCw className="spinner" />
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-edit-product">
      <div className="admin-page-header form-header">
        <div className="page-title">
          <h1>Edit Product</h1>
          <p>Update product specifications, pricing, and image assets</p>
        </div>
        <button 
          type="button"
          className="btn btn-outline btn-back"
          onClick={() => navigate("/admin/products")}
        >
          <FiArrowLeft /> Back to Products
        </button>
      </div>

      {error && (
        <div className="admin-error">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="admin-success">
          <p>{success}</p>
        </div>
      )}

      <div className="admin-glass-form-card">
        <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Enter category"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock Quantity *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="100"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="badge">Badge (Optional)</label>
              <select
                id="badge"
                name="badge"
                value={formData.badge}
                onChange={handleChange}
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Limited Edition">Limited Edition</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="6"
                required
              />
            </div>

            {/* Sizes */}
            <div className="form-group">
              <label>Sizes *</label>
              <div className="array-inputs">
                {formData.sizes.map((size, index) => (
                  <div key={index} className="array-input-item">
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
                      placeholder="Size (e.g., 8, 9, 10)"
                    />
                    {formData.sizes.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeArrayItem('sizes', index)}
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => addArrayItem('sizes')}
                >
                  <FiPlus /> Add Size
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="form-group">
              <label>Colors *</label>
              <div className="array-inputs">
                {formData.colors.map((color, index) => (
                  <div key={index} className="array-input-item">
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => handleArrayChange('colors', index, e.target.value)}
                      placeholder="Color (e.g., Red, Blue)"
                    />
                    {formData.colors.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => removeArrayItem('colors', index)}
                      >
                        <FiMinus />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => addArrayItem('colors')}
                >
                  <FiPlus /> Add Color
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="form-group">
              <label>Product Image</label>
              <div className="image-upload-area">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-input"
                />
                <label htmlFor="image" className="upload-label">
                  <FiUpload />
                  <span>Click to upload new image</span>
                  <p className="upload-hint">PNG, JPG, WEBP (Max 5MB)</p>
                </label>
                
                {(previewUrl || currentImageUrl) && (
                  <div className="image-preview">
                    <img 
                      src={previewUrl || currentImageUrl} 
                      alt="Product" 
                      onError={(e) => {
                        e.target.src = '/src/assets/images/default-product.jpg';
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        setImageFile(null);
                        setPreviewUrl("");
                      }}
                    >
                      <FiX /> Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/products")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <FiSave /> Saving...
              </>
            ) : (
              <>
                <FiSave /> Update Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}

export default AdminEditProduct;