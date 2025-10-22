import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es requerido'],
    unique: true,
    trim: true,
    minlength: [3, 'El usuario debe tener al menos 3 caracteres'],
    maxlength: [30, 'El usuario no puede exceder 30 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un email válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: { type: String, maxlength: 500 },
    location: String,
    website: String
  },
  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    default: 'user'
  },
  sellerProfile: {
    storeName: String,
    storeDescription: String,
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    responseTime: String,
    policies: {
      shipping: String,
      returns: String
    }
  },
  social: {
    instagram: String,
    twitter: String
  },
  preferences: {
    newsletter: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true }
  },
  stats: {
    productsListed: { type: Number, default: 0 },
    productsSold: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Encriptar password antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Método para generar reset token
userSchema.methods.getResetPasswordToken = async function() {
  const crypto = await import('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  
  return resetToken;
};

export default mongoose.model('User', userSchema);