import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import {
  createUser,
  authenticateUser,
  getUserById,
  updateUserProfile,
  changePassword,
  getAllUsers
} from '../services/userService.js';

// Register user
export const register = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await createUser(req.body);
      
      // Set JWT in HTTP-only cookie
      const token = result.token;
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      
      res.cookie('token', token, cookieOptions);
      
      // Return success response without token in body
      res.status(201).json({
        message: result.message,
        user: result.user
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// Login user
export const login = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await authenticateUser(req.body.email, req.body.password);
      
      // Set JWT in HTTP-only cookie
      const token = result.token;
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };
      
      res.cookie('token', token, cookieOptions);
      
      // Return success response without token in body
      res.json({
        message: result.message,
        user: result.user
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// Get user profile
export const getProfile = async (req, res) => {
  try {
    // req.user is already populated by authenticateToken middleware
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    // req.user is already populated by authenticateToken middleware
    
    // Security check: If trying to update email, require current password verification
    if (req.body.email && req.body.email.toLowerCase() !== req.user.email.toLowerCase()) {
      const { currentPassword } = req.body;
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change email address.' });
      }
      
      const isMatch = await req.user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password verification failed. Email update rejected.' });
      }
    }

    const result = await updateUserProfile(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot Password - send email token
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    // Mitigate email enumeration by returning generic success even if user not found
    if (!user) {
      console.warn(`Forgot password requested for unregistered email: ${email}`);
      return res.status(200).json({
        message: 'If that email exists, a password reset link has been sent.'
      });
    }

    // Generate token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Construct link
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click the link below or paste it into your browser to reset your password within 15 minutes:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'FootCap Account Password Reset',
        message
      });

      console.log(`Password reset link successfully sent to: ${user.email}`);

      res.status(200).json({
        message: 'Password reset link sent to your email.'
      });
    } catch (mailError) {
      console.error('Mail transmission failed. Cleared token fields.', mailError);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        message: 'Email could not be sent. Please try again later.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset Password - verify token and update password
export const resetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  async (req, res) => {
    try {
      // Validate password checks
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      // Hash token parameter
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) {
        console.error('Password reset failure: Token is invalid or has expired');
        return res.status(400).json({
          message: 'Invalid or expired password reset token'
        });
      }

      // Set new password (pre-save hook will hash it)
      user.password = req.body.password;
      
      // Invalidate token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.log(`Password successfully reset for account ID: ${user._id}`);

      res.status(200).json({
        message: 'Password reset successful. Please login with your new password.'
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
];

// Get all users (admin only)
export const getAllUsersList = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    
    const result = await getAllUsers(page, limit, search, role);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};