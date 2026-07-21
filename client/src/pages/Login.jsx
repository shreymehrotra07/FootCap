import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { userAPI } from "../utils/api";
import Toast from "../components/Toast";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import adminAuth from "../utils/adminAuth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 2500);
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const data = await userAPI.googleAuth({
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        googleId: firebaseUser.uid,
        photo: firebaseUser.photoURL,
      });

      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      showToast("Login successful with Google!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error("Google Login Error:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      showToast(
        error.response?.data?.message ||
        error.message ||
        "Google login failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please fill in both email and password.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await userAPI.login({ email, password });

      adminAuth.clearAdminAuth();

      localStorage.setItem("userId", res.user.id);
      localStorage.setItem("userName", res.user.name);
      localStorage.setItem("userEmail", res.user.email);

      showToast("Login successful!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Login failed. Please try again.",
        "error"
      );
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

        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue your journey</p>

        <form className="auth-form-blue" onSubmit={handleSubmit}>
          <div className="auth-input-box">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FiMail className="input-icon" />
          </div>

          <div className="auth-input-box auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <FiLock className="input-icon" />

            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="auth-row">
            <span></span>
            <Link className="forgot" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? (
              <span className="auth-loader"></span>
            ) : (
              <>
                Login <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-signin-btn"
        >
          {loading ? (
            <span className="auth-loader dark"></span>
          ) : (
            <>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="google-icon"
              />
              <span>Sign in with Google</span>
            </>
          )}
        </button>

        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>

        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({ show: false, message: "", type: "error" })
          }
        />
      </div>
    </div>
  );
}

export default Login;
