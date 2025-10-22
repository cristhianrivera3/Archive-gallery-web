import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordUpdate
} from '../middleware/validation.js';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegister, register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, login);

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getMe);

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
router.put('/updatedetails', protect, updateDetails);

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
router.put('/updatepassword', protect, validatePasswordUpdate, updatePassword);

export default router;