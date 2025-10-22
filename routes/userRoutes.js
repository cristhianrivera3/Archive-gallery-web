import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  becomeSeller,
  getUserFavorites,
  toggleFavorite,
  getSellerDashboard
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateUserUpdate, validateObjectId } from '../middleware/validation.js';
import { uploadSingle, handleUploadError, processUploadedFiles } from '../middleware/upload.js';

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  protect,
  uploadSingle('avatar'),
  handleUploadError,
  processUploadedFiles,
  validateUserUpdate,
  updateUserProfile
);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
router.get('/:id', validateObjectId, getUserById);

// @desc    Become a seller
// @route   POST /api/users/become-seller
// @access  Private
router.post('/become-seller', protect, becomeSeller);

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', protect, getUserFavorites);

// @desc    Toggle favorite
// @route   POST /api/users/favorites/:productId
// @access  Private
router.post('/favorites/:productId', protect, validateObjectId, toggleFavorite);

// @desc    Get seller dashboard
// @route   GET /api/users/seller/dashboard
// @access  Private/Seller
router.get('/seller/dashboard', protect, authorize('seller', 'admin'), getSellerDashboard);

export default router;