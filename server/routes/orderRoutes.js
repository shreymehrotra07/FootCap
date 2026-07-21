import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { createNotification } from './notificationRoutes.js';
import { authenticateToken } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Lazy initialization of Razorpay SDK
let razorpayInstance = null;
const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn('⚠️ Razorpay keys are not configured in orderRoutes.js');
    return null;
  }
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  return razorpayInstance;
};

// Transaction utility with fallback for standalone local MongoDB instances
const runInTransaction = async (operation) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (error) {
    const isUnsupported = error.message.includes('replica set') || 
                           error.message.includes('Transaction numbers') || 
                           error.message.includes('supports transactions');
    if (isUnsupported) {
      console.warn('⚠️  MongoDB deployment does not support transactions. Falling back to non-transactional execution.');
      return await operation(null);
    }
    throw error;
  } finally {
    session.endSession();
  }
};

// Generate order ID
const generateOrderId = () => {
  const prefix = 'FC';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${randomNum}`;
};

// Get user's orders
// router.get('/:userId', async (req, res) => {
//   try {
//     const userId = new mongoose.Types.ObjectId(req.params.userId);
//     const orders = await Order.find({ userId })
//       .populate('items.productId')
//       .sort({ createdAt: -1 });

//     // Format orders for frontend - filter out any deleted products
//     const formattedOrders = orders.map(order => {
//       // Filter out any items with deleted products
//       const validItems = order.items.filter(item => item.productId !== null && item.productId !== undefined);

//       return {
//         id: order.orderId,
//         date: new Intl.DateTimeFormat('en-IN', {
//           day: 'numeric',
//           month: 'short',
//           year: 'numeric'
//         }).format(order.createdAt),
//         status: order.status,
//         total: order.totalAmount,
//         items: validItems.map(item => ({
//           name: item.name,
//           qty: item.quantity,
//           size: item.size,
//           price: item.price,
//           image: item.image
//         })),
//         deliveryDetails: order.deliveryDetails,
//         paymentMethod: order.paymentMethod
//       };
//     });

//     res.json({ orders: formattedOrders });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Get logged-in user's orders (SECURE)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id; // ✅ JWT se aaya

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create new order
router.post('/create', authenticateToken, async (req, res) => {  // ✅ ADD AUTHENTICATION HERE
  try {
    const { items, totalAmount, deliveryDetails, paymentMethod, paymentId, razorpayOrderId, razorpaySignature } = req.body;
    const userId = req.user._id; // ✅ GET USER ID FROM TOKEN, NOT FROM REQUEST BODY

    console.log('📦 Order Creation Request:', {
      itemsCount: items?.length,
      totalAmount,
      paymentMethod,
      paymentId,
      razorpayOrderId,
      razorpaySignature,
      firstItem: items?.[0]
    });

    if (!items || !totalAmount || !deliveryDetails) {
      return res.status(400).json({ message: 'All order details are required' });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const orderId = generateOrderId();

    // Determine order status based on payment method
    let orderStatus = 'Pending';
    let paymentStatus = 'pending';
    
    if (paymentMethod === 'razorpay') {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        console.warn('⚠️ Razorpay keys not found. In development, bypassing payment verification.');
        // Allow in development fallback, but only if NODE_ENV !== 'production'
        if (process.env.NODE_ENV === 'production') {
          return res.status(500).json({ message: 'Payment gateway not configured. Please contact support.' });
        }
      } else {
        if (!paymentId || !razorpayOrderId || !razorpaySignature) {
          return res.status(400).json({ message: 'Razorpay payment verification details are missing' });
        }
        
        // 1. Verify Payment Signature
        const body = razorpayOrderId + '|' + paymentId;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
          .update(body.toString())
          .digest('hex');

        if (expectedSignature !== razorpaySignature) {
          return res.status(400).json({ message: 'Payment verification failed: Signature mismatch' });
        }

        // 2. Fetch payment info from Razorpay
        const paymentInfo = await razorpay.payments.fetch(paymentId);
        
        if (paymentInfo.status !== 'captured' && paymentInfo.status !== 'authorized') {
          return res.status(400).json({ message: 'Payment is not successfully completed' });
        }
        
        if (paymentInfo.order_id !== razorpayOrderId) {
          return res.status(400).json({ message: 'Payment verification failed: Order ID mismatch' });
        }

        // 3. Verify amount (allow 100 paise tolerance for rounding)
        const extractPrice = (priceString) => {
          if (typeof priceString === 'number') return priceString;
          if (!priceString) return 0;
          const numericValue = String(priceString).replace(/[₹,\s]/g, '');
          return parseInt(numericValue, 10) || 0;
        };
        const expectedPaiseAmount = Math.round(extractPrice(totalAmount) * 100);
        if (Math.abs(paymentInfo.amount - expectedPaiseAmount) > 100) {
          return res.status(400).json({ message: 'Payment verification failed: Amount mismatch' });
        }
      }

      orderStatus = 'Paid';
      paymentStatus = 'paid';
    } else if (paymentMethod === 'cod') {
      // COD is always pending initially
      orderStatus = 'Pending';
      paymentStatus = 'pending';
    }

    // Execute order creation and cart clearing atomically inside a transaction
    const order = await runInTransaction(async (session) => {
      const sessionOptions = session ? { session } : {};

      const newOrder = new Order({
        userId: userObjectId,
        orderId,
        items,
        totalAmount,
        deliveryDetails,
        paymentMethod: paymentMethod || 'cod',
        status: orderStatus,
        paymentId: paymentId || null,
        razorpayOrderId: razorpayOrderId || null,
        paymentStatus: paymentStatus
      });

      // 1. Save the new order
      await newOrder.save(sessionOptions);

      // 2. Clear user's cart
      const cart = await Cart.findOne({ userId: userObjectId }).session(session || null);
      if (cart) {
        cart.items = [];
        await cart.save(sessionOptions);
      }

      return newOrder;
    });

    console.log('✅ Order saved successfully:', {
      orderId: order.orderId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      itemsCount: order.items.length
    });

    // Create notification for new order
    await createNotification(
      'order',
      'New Order Placed',
      `New order #${order.orderId} has been placed by a customer`,
      order._id,
      'Order',
      'high'
    );

    res.status(201).json({
      message: 'Order placed successfully',
      orderId: order.orderId,
      order
    });
  } catch (error) {
    console.error('❌ Order Creation Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/single/:orderId', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow user to access their own order
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }

    const formattedOrder = {
      ...order.toObject(),
      items: (order.items || []).map(item => ({
        name: item.name,
        qty: item.quantity,
        size: item.size,
        price: item.price,
        image: item.image
      }))
    };

    res.json(formattedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




export default router;