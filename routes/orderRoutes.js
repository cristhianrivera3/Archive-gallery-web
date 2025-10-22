import express from 'express';
import {
  createOrder,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  getSellerOrders,
  cancelOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateOrder, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, validateOrder, createOrder);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, validateObjectId, getOrder);

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, validateObjectId, updateOrderToPaid);

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, authorize('admin'), validateObjectId, updateOrderToDelivered);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, validateObjectId, cancelOrder);

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @desc    Get seller orders
// @route   GET /api/orders/seller/myorders
// @access  Private/Seller
router.get('/seller/myorders', protect, authorize('seller', 'admin'), getSellerOrders);

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getOrders);

export default router;