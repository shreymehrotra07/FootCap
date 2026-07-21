import React, { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiRefreshCw } from "react-icons/fi";
import { getAdminProfile, updateAdminProfile } from "../utils/adminAPI";

function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [admin, setAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  // Load admin profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await getAdminProfile();
        setAdmin({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          pincode: profile.pincode || ""
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!admin.name.trim()) {
      setError("Name is required");
      return false;
    }

    if (!admin.email.trim()) {
      setError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(admin.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateAdminProfile(admin);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="admin-page-header">
          <h1>Admin Settings</h1>
        </div>
        <div className="admin-loading">
          <FiRefreshCw className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <h1>Admin Settings</h1>
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

      <form className="admin-form" onSubmit={handleSave}>
        <div className="form-grid">
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={admin.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={admin.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={admin.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          </div>

          <div className="form-column">
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <div className="input-with-icon">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={admin.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <div className="input-with-icon">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={admin.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">PIN Code</label>
              <div className="input-with-icon">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={admin.pincode}
                  onChange={handleChange}
                  placeholder="Enter PIN code"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <FiSave /> Saving...
              </>
            ) : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminSettings;