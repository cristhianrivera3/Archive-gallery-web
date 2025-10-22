import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get all products with filtering, pagination and search
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      size,
      condition,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 12,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { active: true, stock: { $gt: 0 } };

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (size) query.size = size;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const products = await Product.find(query)
      .populate('seller', 'username profile sellerProfile.rating stats.totalSales')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total for pagination
    const total = await Product.countDocuments(query);

    // Get aggregations for filters
    const brands = await Product.distinct('brand', query);
    const categories = await Product.distinct('category', query);
    const sizes = await Product.distinct('size', query);
    const conditions = await Product.distinct('condition', query);

    res.json({
      success: true,
      count: products.length,
      total,
      pagination: {
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit)
      },
      filters: {
        brands: brands.filter(b => b).sort(),
        categories: categories.filter(c => c).sort(),
        sizes: sizes.filter(s => s).sort(),
        conditions: conditions.filter(c => c).sort(),
        priceRange: {
          min: await Product.findOne(query).sort('price').select('price'),
          max: await Product.findOne(query).sort('-price').select('price')
        }
      },
      data: products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los productos'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'username profile avatar sellerProfile stats verification')
      .populate('reviews');

    if (!product || !product.active) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Increment views
    product.stats.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el producto'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req, res) => {
  try {
    // Add seller to request body
    req.body.seller = req.user.id;

    const product = await Product.create(req.body);

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.productsListed': 1 }
    });

    // Populate seller info
    await product.populate('seller', 'username profile');

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear el producto'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Owner/Admin)
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para actualizar este producto'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'username profile');

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el producto'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Owner/Admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Check ownership
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para eliminar este producto'
      });
    }

    // Soft delete (mark as inactive)
    product.active = false;
    await product.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.productsListed': -1 }
    });

    res.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el producto'
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.getFeatured(8);
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos destacados'
    });
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Public
export const getProductsBySeller = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      active: true,
      stock: { $gt: 0 }
    })
    .populate('seller', 'username profile sellerProfile')
    .sort('-createdAt');

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos del vendedor'
    });
  }
};

// @desc    Add to favorites
// @route   POST /api/products/:id/favorite
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Increment favorites count
    product.stats.favorites += 1;
    await product.save();

    // Add to user favorites (you'll need to implement this in User model)
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { favorites: product._id }
    });

    res.json({
      success: true,
      message: 'Producto agregado a favoritos',
      favoritesCount: product.stats.favorites
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Error al agregar a favoritos'
    });
  }
};