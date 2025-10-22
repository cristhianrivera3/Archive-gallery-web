// Application Constants
export const APP = {
  NAME: 'ČOMMØN PL4CE STOR3!',
  VERSION: '1.0.0',
  DESCRIPTION: 'Tienda de ropa urbana de segunda mano',
  SUPPORT_EMAIL: 'support@commonplacestore.com',
  SUPPORT_PHONE: '+57 1 234 5678'
};

// Product Constants
export const PRODUCT = {
  CATEGORIES: [
    'Camisetas',
    'Pantalones', 
    'Chaquetas',
    'Zapatos',
    'Accesorios',
    'Sudaderas'
  ],
  
  SIZES: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'],
  
  CONDITIONS: [
    { value: 'Nuevo', label: 'Nuevo con etiquetas' },
    { value: 'Como nuevo', label: 'Como nuevo - uso mínimo' },
    { value: 'Buen estado', label: 'Buen estado - uso normal' },
    { value: 'Desgastado', label: 'Desgastado - uso intensivo' }
  ],
  
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SOLD: 'sold',
    RESERVED: 'reserved'
  },
  
  SORT_OPTIONS: [
    { value: '-createdAt', label: 'Más recientes' },
    { value: 'createdAt', label: 'Más antiguos' },
    { value: 'price', label: 'Precio: menor a mayor' },
    { value: '-price', label: 'Precio: mayor a menor' },
    { value: 'name', label: 'Nombre: A-Z' },
    { value: '-name', label: 'Nombre: Z-A' },
    { value: '-stats.views', label: 'Más vistos' },
    { value: '-stats.favorites', label: 'Más favoritos' }
  ]
};

// User Constants
export const USER = {
  ROLES: {
    USER: 'user',
    SELLER: 'seller',
    ADMIN: 'admin'
  },
  
  VERIFICATION: {
    EMAIL: 'email',
    PHONE: 'phone', 
    IDENTITY: 'identity'
  },
  
  PREFERENCES: {
    NEWSLETTER: 'newsletter',
    NOTIFICATIONS: 'notifications',
    MARKETING: 'marketing'
  }
};

// Order Constants
export const ORDER = {
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },
  
  PAYMENT_METHODS: {
    CARD: 'card',
    PAYPAL: 'paypal',
    NEQUI: 'nequi',
    DAVIPLATA: 'daviplata',
    CASH: 'cash',
    TRANSFER: 'transfer'
  },
  
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  
  SHIPPING_METHODS: {
    STANDARD: 'standard',
    EXPRESS: 'express',
    PICKUP: 'pickup'
  }
};

// Review Constants
export const REVIEW = {
  STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
  },
  
  RATING_LABELS: {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  }
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
};

// File Upload Constants
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_DOC_TYPES: ['pdf', 'doc', 'docx'],
  MAX_FILES: 5
};

// Validation Constants
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30
  },
  PASSWORD: {
    MIN_LENGTH: 6
  },
  PRODUCT: {
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    BIO_MAX_LENGTH: 500
  },
  ORDER: {
    NOTES_MAX_LENGTH: 1000
  }
};

// Shipping Constants (Colombia)
export const SHIPPING = {
  FREE_SHIPPING_MIN: 100000,
  STANDARD_COST: 10000,
  ADDITIONAL_ITEM_COST: 2000,
  ESTIMATED_DAYS: {
    STANDARD: '3-5 días hábiles',
    EXPRESS: '1-2 días hábiles'
  },
  CARRIERS: [
    'Servientrega',
    'Interrapidisimo', 
    'Coordinadora',
    'Envía',
    'DHL',
    'FedEx'
  ]
};

// Tax Constants (Colombia)
export const TAX = {
  IVA: 0.19, // 19%
  RETEFUENTE: 0.015 // 1.5% (para algunos casos)
};

// Date & Time Constants
export const DATETIME = {
  FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    DATABASE: 'YYYY-MM-DD',
    FULL: 'DD/MM/YYYY HH:mm:ss'
  },
  TIMEZONE: 'America/Bogota'
};

// API Constants
export const API = {
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  CACHE: {
    TTL: 300, // 5 minutes
    CHECK_PERIOD: 600 // 10 minutes
  },
  VERSION: 'v1'
};

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'No autorizado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  
  // Validation
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  WEAK_PASSWORD: 'La contraseña es muy débil',
  
  // Products
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  OUT_OF_STOCK: 'Producto agotado',
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  
  // Orders
  ORDER_NOT_FOUND: 'Pedido no encontrado',
  CART_EMPTY: 'El carrito está vacío',
  
  // Users
  USER_NOT_FOUND: 'Usuario no encontrado',
  EMAIL_EXISTS: 'El email ya está registrado',
  USERNAME_EXISTS: 'El nombre de usuario ya existe',
  
  // Files
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no válido',
  
  // General
  SERVER_ERROR: 'Error del servidor',
  NETWORK_ERROR: 'Error de conexión',
  NOT_FOUND: 'Recurso no encontrado'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Products
  PRODUCT_CREATED: 'Producto creado exitosamente',
  PRODUCT_UPDATED: 'Producto actualizado exitosamente',
  PRODUCT_DELETED: 'Producto eliminado exitosamente',
  
  // Orders
  ORDER_CREATED: 'Pedido creado exitosamente',
  ORDER_UPDATED: 'Pedido actualizado exitosamente',
  ORDER_CANCELLED: 'Pedido cancelado exitosamente',
  
  // Users
  USER_REGISTERED: 'Usuario registrado exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado exitosamente',
  PASSWORD_UPDATED: 'Contraseña actualizada exitosamente',
  
  // General
  OPERATION_SUCCESS: 'Operación completada exitosamente'
};

// Default Images
export const DEFAULT_IMAGES = {
  PRODUCT: '/img/placeholder.jpg',
  AVATAR: '/img/avatar-placeholder.png',
  COVER: '/img/cover-placeholder.jpg'
};

// Social Media
export const SOCIAL_MEDIA = {
  INSTAGRAM: 'https://instagram.com/commonplacestore',
  FACEBOOK: 'https://facebook.com/commonplacestore',
  TWITTER: 'https://twitter.com/commonplacestore',
  TIKTOK: 'https://tiktok.com/@commonplacestore'
};