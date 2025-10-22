import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo el perfil'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando el perfil'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Get user's active products
    const products = await Product.find({
      seller: user._id,
      active: true,
      stock: { $gt: 0 }
    }).sort('-createdAt').limit(12);

    // Get user stats
    const totalProducts = await Product.countDocuments({
      seller: user._id,
      active: true
    });

    const totalSales = await Order.countDocuments({
      'items.seller': user._id,
      status: 'delivered'
    });

    res.json({
      success: true,
      data: {
        user,
        store: {
          products,
          stats: {
            totalProducts,
            totalSales,
            rating: user.sellerProfile?.rating || 0
          }
        }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo el usuario'
    });
  }
};

// @desc    Become a seller
// @route   POST /api/users/become-seller
// @access  Private
export const becomeSeller = async (req, res) => {
  try {
    const { storeName, storeDescription, policies } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: 'seller',
        sellerProfile: {
          storeName,
          storeDescription,
          policies: policies || {}
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      data: user,
      message: '¡Felicidades! Ahora eres un vendedor'
    });

  } catch (error) {
    console.error('Become seller error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando a vendedor'
    });
  }
};

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
export const getUserFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      match: { active: true, stock: { $gt: 0 } },
      populate: {
        path: 'seller',
        select: 'username profile sellerProfile.rating'
      }
    });

    res.json({
      success: true,
      count: user.favorites.length,
      data: user.favorites
    });

  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo favoritos'
    });
  }
};

// @desc    Toggle favorite
// @route   POST /api/users/favorites/:productId
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    const isFavorite = user.favorites.includes(req.params.productId);

    if (isFavorite) {
      // Remove from favorites
      user.favorites.pull(req.params.productId);
      product.stats.favorites = Math.max(0, product.stats.favorites - 1);
    } else {
      // Add to favorites
      user.favorites.push(req.params.productId);
      product.stats.favorites += 1;
    }

    await user.save();
    await product.save();

    res.json({
      success: true,
      isFavorite: !isFavorite,
      favoritesCount: product.stats.favorites,
      message: isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos'
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando favoritos'
    });
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/users/seller/dashboard
// @access  Private/Seller
export const getSellerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get various stats
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      totalEarnings,
      recentOrders
    ] = await Promise.all([
      // Product counts
      Product.countDocuments({ seller: userId }),
      Product.countDocuments({ seller: userId, active: true, stock: { $gt: 0 } }),
      Product.countDocuments({ seller: userId, active: true, stock: 0 }),
      
      // Order counts
      Order.countDocuments({ 'items.seller': userId }),
      Order.countDocuments({ 'items.seller': userId, status: 'pending' }),
      
      // Earnings
      Order.aggregate([
        { $match: { 'items.seller': userId, status: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.seller': userId } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
      ]),
      
      // Recent orders
      Order.find({ 'items.seller': userId })
        .populate('user', 'username profile')
        .populate('items.product', 'name images')
        .sort('-createdAt')
        .limit(5)
    ]);

    const earnings = totalEarnings.length > 0 ? totalEarnings[0].total : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          outOfStockProducts,
          totalOrders,
          pendingOrders,
          totalEarnings: earnings
        },
        recentOrders,
        performance: {
          conversionRate: totalProducts > 0 ? (totalOrders / totalProducts * 100).toFixed(1) : 0,
          averageOrderValue: totalOrders > 0 ? (earnings / totalOrders).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get seller dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo el dashboard'
    });
  }
};