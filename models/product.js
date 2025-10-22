import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  originalPrice: {
    type: Number,
    min: [0, 'El precio original no puede ser negativo']
  },
  category: {
    type: String,
    required: true,
    enum: ['Camisetas', 'Pantalones', 'Chaquetas', 'Zapatos', 'Accesorios', 'Sudaderas'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'],
    index: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['Nuevo', 'Como nuevo', 'Buen estado', 'Desgastado'],
    default: 'Buen estado'
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number
  },
  weight: Number,
  shipping: {
    free: { type: Boolean, default: false },
    cost: { type: Number, default: 0 }
  },
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para búsqueda
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ featured: -1, createdAt: -1 });
productSchema.index({ seller: 1, createdAt: -1 });

// Virtual para calcular descuento
productSchema.virtual('discountPercentage').get(function() {
  if (!this.originalPrice || this.originalPrice <= this.price) return 0;
  return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
});

// Virtual para reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// Método para verificar disponibilidad
productSchema.methods.isAvailable = function() {
  return this.stock > 0 && this.active;
};

// Método estático para productos destacados
productSchema.statics.getFeatured = function(limit = 8) {
  return this.find({ featured: true, active: true, stock: { $gt: 0 } })
    .limit(limit)
    .populate('seller', 'username rating')
    .sort({ createdAt: -1 });
};

// Middleware para generar SKU
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await this.constructor.countDocuments();
    this.sku = `CP${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model('Product', productSchema);