import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      taxPrice
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay items en el pedido'
      });
    }

    // Calculate prices
    const itemsPrice = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Check product availability and update stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Producto no encontrado: ${item.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stock insuficiente para: ${item.name}. Disponible: ${product.stock}`
        });
      }

      // Reserve stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // Populate order data
    await order.populate('user', 'username email profile');
    await order.populate('items.product', 'name images brand');

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando el pedido'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email profile')
      .populate('items.product', 'name images brand seller');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Check ownership or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para ver este pedido'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo el pedido'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Update order
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address
    };

    const updatedOrder = await order.save();

    // Update seller stats and sales
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        await User.findByIdAndUpdate(product.seller, {
          $inc: {
            'stats.productsSold': item.quantity,
            'stats.totalEarnings': item.price * item.quantity
          }
        });

        // Update product sales count
        product.stats.sales += item.quantity;
        await product.save();
      }
    }

    res.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order to paid error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando el pago del pedido'
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update order to delivered error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando la entrega del pedido'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images brand')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo tus pedidos'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product', 'name brand')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo los pedidos'
    });
  }
};

// @desc    Get orders by seller
// @route   GET /api/orders/seller/myorders
// @access  Private/Seller
export const getSellerOrders = async (req, res) => {
  try {
    // Find products by this seller
    const sellerProducts = await Product.find({ seller: req.user.id });
    const productIds = sellerProducts.map(product => product._id);

    // Find orders that contain these products
    const orders = await Order.find({
      'items.product': { $in: productIds },
      'items.seller': req.user.id
    })
      .populate('user', 'username email profile')
      .populate('items.product', 'name images brand')
      .sort('-createdAt');

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo los pedidos del vendedor'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No autorizado para cancelar este pedido'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'canceled';
    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Pedido cancelado correctamente'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelando el pedido'
    });
  }
};