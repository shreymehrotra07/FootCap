import dotenv from "dotenv";
dotenv.config(); // Load environment variables FIRST

// Ensure critical environment variables are set
if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL ERROR: JWT_SECRET environment variable is missing!");
  process.exit(1);
}

// Warn if SMTP settings are missing
if (process.env.NODE_ENV === 'production') {
  const requiredSmtpEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'];
  const missing = requiredSmtpEnv.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.warn(`⚠️ WARNING: Missing SMTP configurations for production: ${missing.join(', ')}. Email features will be disabled until configured.`);
  }
}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import cookieParser from "cookie-parser";
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import { loggingMiddleware } from "./middleware/logging.js";
import {
  errorHandler,
  handleValidationError,
  handleCastError,
  handleDuplicateKeyError,
  handleJWTError,
} from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy for Render / reverse proxies (required for secure cookies & rate-limiting)
app.set('trust proxy', 1);

// 🔹 SECURITY MIDDLEWARE
// Helmet for security headers
app.use(helmet());

// Global Rate Limiting (relaxed for product browsing)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per IP per windowMs
  message: { message: 'Too many requests from this IP, please try again later.' }
});
app.use(globalLimiter);

// Strict Authentication Rate Limiting (20 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many login or authentication attempts from this IP, please try again later.' }
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Parse cookies
app.use(cookieParser());

// 🔹 GLOBAL MIDDLEWARE
app.use(loggingMiddleware);

// CORS configuration with credentials support for Netlify and local dev
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
    if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('netlify.app')) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 DATABASE
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce")
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");
    
    // Check if products exist, if not, seed the database
    try {
      const Product = (await import('./models/Product.js')).default;
      const productCount = await Product.countDocuments();
      
      if (productCount === 0) {
        console.log("⚠️ No products found in database. Seeding with sample products...");
        console.log("💡 Run 'npm run seed' to populate the database with sample products");
      } else {
        console.log(`📊 Found ${productCount} products in database`);
      }
    } catch (dbError) {
      console.error("❌ Error checking products in database:", dbError);
    }
  })
  .catch((error) =>
    console.error("❌ MongoDB Connection Error:", error)
  );

// 🔹 ROUTES (CLEAN ORDER)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/forgot-password", authLimiter);
app.use("/api/users/reset-password", authLimiter);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api/payments", paymentRoutes);

// 🔹 HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// 🔹 ROOT
app.get("/", (req, res) => {
  res.send("✅ FootCap Backend is Running...");
});

// 🔹 ERROR HANDLING (ALWAYS LAST)
app.use(handleValidationError);
app.use(handleCastError);
app.use(handleDuplicateKeyError);
app.use(handleJWTError);
app.use(errorHandler);

// 🔹 START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
