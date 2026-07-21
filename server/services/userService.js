import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Validate password strength
const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Optional: Add more password strength checks
  // - At least one uppercase letter
  // - At least one lowercase letter
  // - At least one number
  // - At least one special character
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    // Validate password strength
    validatePasswordStrength(userData.password);

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    throw error;
  }
};

// Authenticate user
export const authenticateUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (user.isBlocked) {
      throw new Error('Your account has been blocked');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    console.log('getUserById called with userId:', userId);
    
    const user = await User.findById(userId).select('-password');
    
    console.log('User found in database:', user);
    
    if (!user) {
      console.log('User not found in database');
      throw new Error('User not found.');
    }

    if (user.isBlocked) {
      console.log('User is blocked');
      throw new Error('Your account has been blocked.');
    }

    return user;
  } catch (error) {
    console.error('getUserById error:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isBlocked) {
      throw new Error('Your account has been blocked.');
    }

    return {
      message: 'Profile updated successfully',
      user
    };
  } catch (error) {
    throw error;
  }
};

// Change user password
export const changePassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found with this email');
    }

    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully. Please login with your new password.' };
  } catch (error) {
    throw error;
  }
};

// Block/unblock user
export const toggleUserBlockStatus = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return {
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get all users with pagination
export const getAllUsers = async (page = 1, limit = 20, search = '', role = '') => {
  try {
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
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    return {
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalUsers: total
    };
  } catch (error) {
    throw error;
  }
};