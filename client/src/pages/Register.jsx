import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { userAPI } from "../utils/api";
import Toast from "../components/Toast";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  // Password validation function
  const validatePassword = (pwd) => {
    const errors = [];
    
    if (pwd.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/\d/.test(pwd)) {
      errors.push("Password must contain at least one number");
    }
    
    return errors;
  };

  // Google Registration Handler
  const handleGoogleRegister = async () => {
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

      showToast("Registration successful with Google!", "success");
      setTimeout(() => {
        navigate("/");
      }, 1200);

    } catch (error) {
      console.error("Google Registration Error:", error);
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      showToast(
        error.response?.data?.message ||
        error.message ||
        "Google registration failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      showToast(passwordErrors.join(". "), "error");
      return;
    }

    try {
      setLoading(true);

      const res = await userAPI.register({ name, email, password });

      localStorage.setItem("userId", res.user.id);
      localStorage.setItem("userName", res.user.name);
      localStorage.setItem("userEmail", res.user.email);

      showToast("Account created successfully!", "success");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.",
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

        <h2>Create Account</h2>
        <p className="subtitle">Join FootCap and step into the future</p>

        <form className="auth-form-blue" onSubmit={handleSubmit}>
          <div className="auth-input-box">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <FiUser className="input-icon" />
          </div>

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
              autoComplete="new-password"
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

          {/* Password Requirements Panel */}
          {password && (
            <div className="password-requirements">
              <p className="password-requirements-title">Password Requirements:</p>
              <ul className="password-requirements-list">
                <li className={`password-requirements-item ${password.length >= 6 ? 'valid' : 'invalid'}`}>
                  <span>{password.length >= 6 ? '✓' : '✕'}</span> At least 6 characters
                </li>
                <li className={`password-requirements-item ${/[A-Z]/.test(password) ? 'valid' : 'invalid'}`}>
                  <span>{/[A-Z]/.test(password) ? '✓' : '✕'}</span> One uppercase letter
                </li>
                <li className={`password-requirements-item ${/[a-z]/.test(password) ? 'valid' : 'invalid'}`}>
                  <span>{/[a-z]/.test(password) ? '✓' : '✕'}</span> One lowercase letter
                </li>
                <li className={`password-requirements-item ${/\d/.test(password) ? 'valid' : 'invalid'}`}>
                  <span>{/\d/.test(password) ? '✓' : '✕'}</span> One number
                </li>
              </ul>
            </div>
          )}

          <div className="auth-input-box auth-password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <FiLock className="input-icon" />

            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowConfirmPassword((s) => !s)}
              aria-label="Toggle Confirm Password Visibility"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? <span className="auth-loader"></span> : <>Create Account <FiArrowRight /></>}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
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
              <span>Sign up with Google</span>
            </>
          )}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
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

export default Register;
