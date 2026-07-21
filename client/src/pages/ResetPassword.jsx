import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import Toast from "../components/Toast";
import { userAPI } from "../utils/api";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      showToast("Reset token missing. Please use the link sent to your email.", "error");
      return;
    }
    if (!newPassword || !confirmPassword) {
      showToast("Please fill in both password fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await userAPI.resetPassword(token, newPassword);
      showToast(res.message || "Password reset successful!", "success");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      showToast(err.message || "Reset failed. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper-blue">
      <div className="auth-card-blue">
        <h1 className="auth-brand">
          Foot<span>Cap</span>
        </h1>

        <h2>New Password</h2>
        <p className="subtitle">Secure your account with a strong password</p>

        <form className="auth-form-blue" onSubmit={handleSubmit}>
          <div className="auth-input-box auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <FiLock className="input-icon" />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle New Password"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="auth-input-box auth-password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <FiLock className="input-icon" />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowConfirmPassword((s) => !s)}
              aria-label="Toggle Confirm Password"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? <span className="auth-loader"></span> : <>Reset Password <FiArrowRight /></>}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/forgot-password" title="Go back">
            <FiArrowLeft /> Change Email
          </Link>
        </p>

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "error" })}
        />
      </div>
    </div>
  );
}

export default ResetPassword;

