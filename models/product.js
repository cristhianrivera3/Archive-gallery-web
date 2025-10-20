import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['Streetwear', 'Techwear', 'Oversize', 'Vintage', 'Accesorios', 'Calzado', 'Exclusivos'],
    default: 'Streetwear'
  },
  talla: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imagen: {
    type: String,
    default: '/img/placeholder.jpg'
  },
  destacado: {
    type: Boolean,
    default: false
  },
  estilo: {
    type: String,
    enum: ['Urbano', 'Futurista', 'Vintage', 'Oversize', 'Limited Edition'],
    default: 'Urbano'
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

// Método para verificar disponibilidad
productSchema.methods.estaDisponible = function() {
  return this.stock > 0;
};

// Método estático para productos destacados
productSchema.statics.obtenerDestacados = function() {
  return this.find({ destacado: true, stock: { $gt: 0 } });
};

// Método estático para productos por estilo
productSchema.statics.obtenerPorEstilo = function(estilo) {
  return this.find({ estilo: estilo, stock: { $gt: 0 } });
};

const Product = mongoose.model('Product', productSchema);

export default Product;
