import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   POST /api/auth/google
 * @desc    Google login / register
 * @access  Public
 */
router.post("/google", async (req, res) => {
  try {
    console.log("Google Auth Request Body:", req.body);
    
    const { name, email, googleId, photo } = req.body;

    // 1️⃣ Basic validation
    if (!email || !googleId) {
      console.log("Invalid Google data - email:", email, "googleId:", googleId);
      return res.status(400).json({
        success: false,
        message: "Invalid Google data",
      });
    }

    // 2️⃣ Check if user already exists
    let user = await User.findOne({ email });
    console.log("User lookup result:", user);

    // 3️⃣ If user does NOT exist → create new
    if (!user) {
      console.log("Creating new user for Google login");
      user = await User.create({
        name,
        email,
        googleId,
        photo,
        password: null, // important for Google users
      });
      console.log("New user created:", user);
    }

    // 4️⃣ If user exists but googleId missing (email signup before)
    if (user && !user.googleId) {
      console.log("Updating existing user with Google ID");
      user.googleId = googleId;
      user.photo = photo || user.photo;
      await user.save();
      console.log("User updated with Google ID:", user);
    }

    // 5️⃣ Blocked user check
    if (user.isBlocked) {
      console.log("User is blocked:", user);
      return res.status(403).json({
        success: false,
        message: "Account is blocked. Contact support.",
      });
    }

    // 6️⃣ Generate JWT
    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("JWT token generated for user:", user._id);

    // 7️⃣ Set JWT in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('token', token, cookieOptions);
    
    // 8️⃣ Send response without token in body
    const response = {
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
    
    console.log("Google Auth Response:", response);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
});

/**
 * @route   POST /api/auth/google-login
 * @desc    Google login for existing users only
 * @access  Public
 */
router.post("/google-login", async (req, res) => {
  try {
    console.log("Google Login Request Body:", req.body);
    
    const { name, email, googleId, photo } = req.body;

    // 1️⃣ Basic validation
    if (!email || !googleId) {
      console.log("Invalid Google data - email:", email, "googleId:", googleId);
      return res.status(400).json({
        success: false,
        message: "Invalid Google data",
      });
    }

    // 2️⃣ Check if user already exists (this is login only, no auto-create)
    let user = await User.findOne({ email });
    console.log("User lookup result:", user);

    // 3️⃣ If user does NOT exist → return error (don't create new user)
    if (!user) {
      console.log("User does not exist for Google login");
      return res.status(404).json({
        success: false,
        message: "Account not registered. Please register first.",
      });
    }

    // 4️⃣ If user exists but needs to be linked to Google
    if (user && !user.googleId) {
      console.log("Linking existing user to Google account");
      user.googleId = googleId;
      user.photo = photo || user.photo;
      await user.save();
      console.log("User linked to Google account:", user);
    }

    // 5️⃣ Blocked user check
    if (user.isBlocked) {
      console.log("User is blocked:", user);
      return res.status(403).json({
        success: false,
        message: "Account is blocked. Contact support.",
      });
    }

    // 6️⃣ Generate JWT
    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log("JWT token generated for user:", user._id);

    // 7️⃣ Set JWT in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };
    
    res.cookie('token', token, cookieOptions);
    
    // 8️⃣ Send response without token in body
    const response = {
      success: true,
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
    
    console.log("Google Login Response:", response);
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
});

export default router;
