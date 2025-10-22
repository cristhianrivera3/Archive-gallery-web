import { body } from 'express-validator';
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Custom validation for unique email
export const uniqueEmail = async (email) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }
  return true;
};

// @desc    Custom validation for unique username
export const uniqueUsername = async (username) => {
  const existingUser = await User.findOne({ username: username.toLowerCase() });
  if (existingUser) {
    throw new Error('El nombre de usuario ya existe');
  }
  return true;
};

// @desc    Custom validation for product existence
export const productExists = async (productId) => {
  const product = await Product.findById(productId);
  if (!product || !product.active) {
    throw new Error('Producto no encontrado');
  }
  return true;
};

// @desc    Custom validation for sufficient stock
export const sufficientStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Producto no encontrado');
  }
  if (product.stock < quantity) {
    throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
  }
  return true;
};

// @desc    Custom validation for valid category
export const validCategory = (category) => {
  const validCategories = ['Camisetas', 'Pantalones', 'Chaquetas', 'Zapatos', 'Accesorios', 'Sudaderas'];
  if (!validCategories.includes(category)) {
    throw new Error('Categoría no válida');
  }
  return true;
};

// @desc    Custom validation for valid size
export const validSize = (size) => {
  const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'];
  if (!validSizes.includes(size)) {
    throw new Error('Talla no válida');
  }
  return true;
};

// @desc    Custom validation for valid condition
export const validCondition = (condition) => {
  const validConditions = ['Nuevo', 'Como nuevo', 'Buen estado', 'Desgastado'];
  if (!validConditions.includes(condition)) {
    throw new Error('Condición no válida');
  }
  return true;
};

// @desc    Custom validation for Colombian phone number
export const validColombianPhone = (phone) => {
  const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
  const cleanedPhone = phone.replace(/\s/g, '');
  
  if (!phoneRegex.test(cleanedPhone)) {
    throw new Error('Número de teléfono colombiano inválido');
  }
  return true;
};

// @desc    Custom validation for price range
export const validPriceRange = (minPrice, maxPrice) => {
  if (minPrice && maxPrice && minPrice > maxPrice) {
    throw new Error('El precio mínimo no puede ser mayor al precio máximo');
  }
  return true;
};

// @desc    Custom validation for future date
export const isFutureDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  
  if (inputDate <= today) {
    throw new Error('La fecha debe ser futura');
  }
  return true;
};

// @desc    Custom validation for past date
export const isPastDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  
  if (inputDate >= today) {
    throw new Error('La fecha debe ser pasada');
  }
  return true;
};

// @desc    Custom validation for valid rating
export const validRating = (rating) => {
  if (rating < 1 || rating > 5) {
    throw new Error('El rating debe estar entre 1 y 5');
  }
  return true;
};

// @desc    Custom validation for valid quantity
export const validQuantity = (quantity) => {
  if (quantity < 1) {
    throw new Error('La cantidad debe ser al menos 1');
  }
  if (quantity > 100) {
    throw new Error('La cantidad no puede exceder 100');
  }
  return true;
};

// @desc    Custom validation for valid discount
export const validDiscount = (originalPrice, discountPrice) => {
  if (discountPrice >= originalPrice) {
    throw new Error('El precio de descuento debe ser menor al precio original');
  }
  return true;
};

// @desc    Custom validation for valid image URL
export const validImageUrl = (url) => {
  const imageRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  if (!imageRegex.test(url)) {
    throw new Error('URL de imagen no válida');
  }
  return true;
};

// @desc    Custom validation for strong password
export const strongPassword = (password) => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!strongRegex.test(password)) {
    throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
  }
  return true;
};

// @desc    Custom validation for matching passwords
export const matchingPasswords = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }
  return true;
};

// @desc    Custom validation for valid Colombian address
export const validColombianAddress = (address) => {
  if (address.length < 10) {
    throw new Error('La dirección debe tener al menos 10 caracteres');
  }
  return true;
};

// @desc    Custom validation for valid Colombian postal code
export const validColombianPostalCode = (postalCode) => {
  const postalRegex = /^\d{6}$/;
  if (!postalRegex.test(postalCode)) {
    throw new Error('Código postal colombiano inválido (debe tener 6 dígitos)');
  }
  return true;
};

// @desc    Export all validators as an object for easy access
export default {
  uniqueEmail,
  uniqueUsername,
  productExists,
  sufficientStock,
  validCategory,
  validSize,
  validCondition,
  validColombianPhone,
  validPriceRange,
  isFutureDate,
  isPastDate,
  validRating,
  validQuantity,
  validDiscount,
  validImageUrl,
  strongPassword,
  matchingPasswords,
  validColombianAddress,
  validColombianPostalCode
};