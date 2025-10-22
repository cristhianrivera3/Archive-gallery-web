import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// @desc    Generate JWT Token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Verify JWT Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

// @desc    Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// @desc    Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// @desc    Format price in Colombian pesos
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
};

// @desc    Generate random SKU
export const generateSKU = (prefix = 'CP') => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
};

// @desc    Generate order number
export const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `ORD${timestamp}${random}`;
};

// @desc    Sanitize input against XSS
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
  return input;
};

// @desc    Calculate average rating
export const calculateAverageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0;
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

// @desc    Calculate discount percentage
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// @desc    Format date to readable string
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('es-CO', defaultOptions);
};

// @desc    Calculate days between dates
export const daysBetween = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Generate random string
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Validate Colombian phone number
export const isValidColombianPhone = (phone) => {
  const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// @desc    Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// @desc    Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// @desc    Calculate shipping cost
export const calculateShipping = (totalAmount, itemsCount) => {
  // Envío gratis sobre $100.000, sino $10.000
  if (totalAmount > 100000) return 0;
  
  // Envío base + $2.000 por item adicional después del primero
  const baseShipping = 10000;
  const additionalShipping = Math.max(0, itemsCount - 1) * 2000;
  
  return baseShipping + additionalShipping;
};

// @desc    Calculate tax (19% IVA Colombia)
export const calculateTax = (amount) => {
  return Number((amount * 0.19).toFixed(0));
};

// @desc    Paginate array
export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: array.length,
      pages: Math.ceil(array.length / limit)
    }
  };
};

// @desc    Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// @desc    Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// @desc    Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// @desc    Generate unique ID
export const generateId = () => {
  return uuidv4();
};

// @desc    Get file extension
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// @desc    Validate file type
export const isValidFileType = (filename, allowedTypes) => {
  const extension = getFileExtension(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

// @desc    Get user initials
export const getUserInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// @desc    Capitalize first letter
export const capitalize = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// @desc    Generate color from string (for avatars)
export const stringToColor = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
};