import Review from '../models/Review.js';
import Order from '../models/Order.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { product, order, rating, title, comment, images } = req.body;

    // Verify user purchased the product
    const purchasedOrder = await Order.findOne({
      _id: order,
      user: req.user.id,
      'items.product': product,
      status: 'delivered'
    });

    if (!purchasedOrder) {
      return res.status(400).json({
        success: false,
        error: 'Solo puedes review productos que hayas comprado y recibido'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      product,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'Ya has review este producto'
      });
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      order,
      rating,
      title,
      comment,
      images: images || [],
      verifiedPurchase: true
    });

    await review.populate('user', 'username profile.avatar profile.firstName');

    res.status(201).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando la review'
    });
  }
};

// @desc    Get reviews for product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.getProductReviews(req.params.productId, req.query);

    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo reviews del producto'
    });
  }
};

// @desc    Get review stats
// @route   GET /api/reviews/product/:productId/stats
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const stats = await Review.getRatingStats(req.params.productId);
    
    res.json({
      success: true,
      data: stats.length > 0 ? stats[0] : { total: 0, average: 0, distribution: {} }
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas de reviews'
    });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username profile.avatar profile.firstName')
      .populate('response.respondedBy', 'username');

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review no encontrada'
      });
    }

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo la review'
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review no encontrada'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('user', 'username profile.avatar profile.firstName');

    res.json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando la review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review no encontrada'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Review eliminada correctamente'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando la review'
    });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markReviewHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review no encontrada'
      });
    }

    await review.markHelpful(req.user.id);

    res.json({
      success: true,
      message: 'Review marcada como útil',
      helpfulCount: review.helpful.length
    });

  } catch (error) {
    console.error('Mark review helpful error:', error);
    res.status(500).json({
      success: false,
      error: 'Error marcando la review como útil'
    });
  }
};