import express from 'express';
import { register, login, getProfile, updateProfile, forgotPassword, resetPassword, getAllUsersList } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Password recovery routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Get user profile - requires authentication
router.get('/profile', authenticateToken, getProfile);

// Update user profile - requires authentication
router.put('/profile', authenticateToken, updateProfile);

export default router;