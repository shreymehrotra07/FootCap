import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify if user is admin - reads from cookies
export const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookie (first priority) or header (fallback)
    const token = req.cookies.admin_token || req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database - use userId or id fallback to match token structure
    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked.' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
