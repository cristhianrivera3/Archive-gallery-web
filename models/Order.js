import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    size: {
      type: String,
      required: true
    },
    condition: {
      type: String,
      required: true
    }
  }],
  shippingAddress: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Colombia'
    },
    phone: {
      type: String
    },
    instructions: {
      type: String,
      maxlength: 500
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'paypal', 'nequi', 'daviplata', 'cash', 'transfer'],
    default: 'card'
  },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
    payer_id: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  trackingNumber: {
    type: String
  },
  carrier: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ trackingNumber: 1 });

// Virtual para días desde la creación
orderSchema.virtual('daysSinceCreation').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Método para calcular totales
orderSchema.methods.calculateTotals = function() {
  this.itemsPrice = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Impuesto del 19% para Colombia
  this.taxPrice = Number((this.itemsPrice * 0.19).toFixed(2));
  
  // Envío gratis sobre $100.000, sino $10.000
  this.shippingPrice = this.itemsPrice > 100000 ? 0 : 10000;
  
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

// Middleware para calcular totales antes de guardar
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isNew) {
    this.calculateTotals();
  }
  next();
});

// Método estático para obtener órdenes por vendedor
orderSchema.statics.getOrdersBySeller = function(sellerId, status = null) {
  const matchStage = { 'items.seller': sellerId };
  if (status) matchStage.status = status;

  return this.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: '$_id',
        user: { $first: '$user' },
        items: { $push: '$items' },
        totalPrice: { $first: '$totalPrice' },
        status: { $first: '$status' },
        createdAt: { $first: '$createdAt' }
      }
    },
    { $sort: { createdAt: -1 } }
  ]);
};

// Método para obtener estadísticas de ventas
orderSchema.statics.getSalesStats = function(sellerId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        'items.seller': sellerId,
        status: 'delivered',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        averageOrderValue: { $avg: '$totalPrice' },
        orderCount: { $sum: 1 }
      }
    }
  ]);
};

export default mongoose.model('Order', orderSchema);