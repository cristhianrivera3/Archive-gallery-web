import express from 'express';
import {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getReviewStats
} from '../controllers/reviewController.js';
import { protect, checkOwnership } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';
import Review from '../models/Review.js';

const router = express.Router();

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', validateObjectId, getProductReviews);

// @desc    Get review stats for a product
// @route   GET /api/reviews/product/:productId/stats
// @access  Public
router.get('/product/:productId/stats', validateObjectId, getReviewStats);

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
router.get('/:id', validateObjectId, getReview);

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, createReview);

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put('/:id', protect, validateObjectId, checkOwnership(Review), updateReview);

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protect, validateObjectId, checkOwnership(Review), deleteReview);

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
router.post('/:id/helpful', protect, validateObjectId, markReviewHelpful);

export default router;