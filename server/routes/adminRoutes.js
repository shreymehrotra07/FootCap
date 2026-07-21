import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { createNotification } from './notificationRoutes.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { storage as cloudinaryStorage } from '../config/cloudinary.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer storage with local fallback for development
let activeStorage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  console.log('☁️  Using Cloudinary for product image storage');
  activeStorage = cloudinaryStorage;
} else {
  console.warn('⚠️  Cloudinary env variables not found. Falling back to local disk storage.');
  activeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, '../../client/src/assets/images');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const upload = multer({
  storage: activeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// ===== DASHBOARD STATS =====
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Calculate total revenue
    const orders = await Order.find({ status: { $nin: ['Cancelled'] } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== PRODUCT MANAGEMENT =====

// Get all products (with search, filter, pagination)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, brand, category, gender } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (brand) query.brand = brand;
    if (category) query.category = category;
    if (gender) query.gender = gender;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post('/products', adminAuth, async (req, res) => {
  try {
    console.log('📦 Creating new product...');
    console.log('Product data:', req.body);
    
    const product = new Product(req.body);
    await product.save();
    
    console.log('✅ Product created:', product._id);
    
    // Create notification for new product
    await createNotification(
      'product',
      'New Product Added',
      `New product "${product.name}" has been added to the catalog`,
      product._id,
      'Product',
      'medium'
    );
    
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update product
router.put('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload product image
router.post('/upload', adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Cloudinary stores URL in req.file.path. Local storage stores filename in req.file.filename.
    const isCloudUrl = req.file.path && req.file.path.startsWith('http');
    const imagePath = isCloudUrl ? req.file.path : `/src/assets/images/${req.file.filename}`;
    
    res.json({ 
      message: isCloudUrl ? 'Image uploaded successfully to Cloudinary' : 'Image uploaded successfully to local storage', 
      imagePath,
      filename: req.file.filename || req.file.public_id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== ORDER MANAGEMENT =====

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Order.countDocuments(query);

    // Ensure consistent order structure
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      orderId: order.orderId,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      razorpayOrderId: order.razorpayOrderId,
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
        image: item.image
      })),
      deliveryDetails: order.deliveryDetails
    }));

    res.json({
      orders: formattedOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if the ID looks like a MongoDB ObjectId (24-character hex string)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let order;
    if (isMongoId) {
      // If it looks like a MongoDB ID, try direct lookup first
      order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('userId', 'name email');
    } else {
      // If it doesn't look like a MongoDB ID, try orderId field first
      order = await Order.findOneAndUpdate(
        { orderId: req.params.id },
        { status },
        { new: true }
      ).populate('userId', 'name email');
    }
    
    // If not found by primary method, try the other method as fallback
    if (!order) {
      if (isMongoId) {
        // If we tried _id first, now try orderId
        order = await Order.findOneAndUpdate(
          { orderId: req.params.id },
          { status },
          { new: true }
        ).populate('userId', 'name email');
      } else {
        // If we tried orderId first, now try _id
        order = await Order.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        ).populate('userId', 'name email');
      }
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Create notification for order status update
    await createNotification(
      'order',
      `Order Status Updated`,
      `Order #${order.orderId} status updated to ${status}`,
      order._id,
      'Order',
      'medium'
    );

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order details
router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    // Check if the ID looks like a MongoDB ObjectId (24-character hex string)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let order;
    if (isMongoId) {
      // If it looks like a MongoDB ID, try direct lookup first
      order = await Order.findById(req.params.id)
        .populate('userId', 'name email phone address city pincode');
    } else {
      // If it doesn't look like a MongoDB ID, try orderId field first
      order = await Order.findOne({ orderId: req.params.id })
        .populate('userId', 'name email phone address city pincode');
    }
    
    // If not found by primary method, try the other method as fallback
    if (!order) {
      if (isMongoId) {
        // If we tried _id first, now try orderId
        order = await Order.findOne({ orderId: req.params.id })
          .populate('userId', 'name email phone address city pincode');
      } else {
        // If we tried orderId first, now try _id
        order = await Order.findById(req.params.id)
          .populate('userId', 'name email phone address city pincode');
      }
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order
router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    // Additional validation
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    // Check if the ID looks like a MongoDB ObjectId (24-character hex string)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let order;
    if (isMongoId) {
      // If it looks like a MongoDB ID, try direct lookup first
      order = await Order.findByIdAndDelete(req.params.id);
    } else {
      // If it doesn't look like a MongoDB ID, try orderId field first
      order = await Order.findOneAndDelete({ orderId: req.params.id });
    }
    
    // If not found by primary method, try the other method as fallback
    if (!order) {
      if (isMongoId) {
        // If we tried _id first, now try orderId
        order = await Order.findOneAndDelete({ orderId: req.params.id });
      } else {
        // If we tried orderId first, now try _id
        order = await Order.findByIdAndDelete(req.params.id);
      }
    }
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error in delete order:', error);
    // Check if it's a cast error
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }
    res.status(500).json({ message: error.message });
  }
});

// ===== USER MANAGEMENT =====

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.patch('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block/Unblock user
router.patch('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    // Prevent admin from blocking themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user and associated orders
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    // First find the user to get their ID
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all orders associated with this user
    const deletedOrders = await Order.deleteMany({ userId: user._id });
    
    // Create notification for user deletion
    await createNotification(
      'user',
      'User Account Deleted',
      `User account for ${user.name} has been deleted along with ${deletedOrders.deletedCount} orders`,
      user._id,
      'User',
      'medium'
    );
    
    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'User and associated orders deleted successfully',
      deletedOrders: deletedOrders.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ===== ADMIN PROFILE =====
router.get('/profile', adminAuth, async (req, res) => {
  try {
    // Return the authenticated admin's profile
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      photo: req.user.photo || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/profile', adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, city, pincode } = req.body;
    
    const admin = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, address, city, pincode },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', admin });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
