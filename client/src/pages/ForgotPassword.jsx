import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import Toast from "../components/Toast";
import { userAPI } from "../utils/api";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "error" }), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await userAPI.forgotPassword(email);
      showToast(res.message || "Password reset link sent to your email.", "success");
      setEmail("");
    } catch (error) {
      console.warn("Forgot password request handled:", error.message);
      // Generic response to avoid email enumeration
      showToast("If that email exists, a password reset link has been sent.", "success");
      setEmail("");
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

        <h2>Forgot Password</h2>
        <p className="subtitle">We'll help you get back into your account</p>

        <form className="auth-form-blue" onSubmit={handleSubmit}>
          <div className="auth-input-box">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FiMail className="input-icon" />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? <span className="auth-loader"></span> : <>Continue <FiArrowRight /></>}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
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

export default ForgotPassword;

