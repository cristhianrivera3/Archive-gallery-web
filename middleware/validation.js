import { body, validationResult, param } from 'express-validator';

// @desc    Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      details: errorMessages
    });
  }

  next();
};

// @desc    User registration validation
export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('El usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El usuario solo puede contener letras, números y guiones bajos'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingresa un email válido'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  handleValidationErrors
];

// @desc    User login validation
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Por favor ingresa un email válido'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

// @desc    Product creation/update validation
export const validateProduct = [
  body('name')
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .trim(),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres')
    .trim(),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  
  body('category')
    .isIn(['Camisetas', 'Pantalones', 'Chaquetas', 'Zapatos', 'Accesorios', 'Sudaderas'])
    .withMessage('Categoría no válida'),
  
  body('size')
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única'])
    .withMessage('Talla no válida'),
  
  body('condition')
    .isIn(['Nuevo', 'Como nuevo', 'Buen estado', 'Desgastado'])
    .withMessage('Condición no válida'),
  
  body('brand')
    .isLength({ min: 1, max: 50 })
    .withMessage('La marca debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número positivo'),
  
  handleValidationErrors
];

// @desc    Order creation validation
export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('El pedido debe contener al menos un item'),
  
  body('items.*.product')
    .isMongoId()
    .withMessage('ID de producto no válido'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser al menos 1'),
  
  body('shippingAddress.address')
    .notEmpty()
    .withMessage('La dirección es requerida'),
  
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  
  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('El código postal es requerido'),
  
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('El país es requerido'),
  
  body('paymentMethod')
    .isIn(['card', 'paypal', 'nequi', 'daviplata', 'cash'])
    .withMessage('Método de pago no válido'),
  
  handleValidationErrors
];

// @desc    MongoDB ID validation
export const validateObjectId = param('id')
  .isMongoId()
  .withMessage('ID no válido');

// @desc    User update validation
export const validateUserUpdate = [
  body('profile.firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('profile.lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El apellido debe tener entre 1 y 50 caracteres')
    .trim(),
  
  body('profile.bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La biografía no puede exceder 500 caracteres')
    .trim(),
  
  body('profile.location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La ubicación no puede exceder 100 caracteres')
    .trim(),
  
  body('sellerProfile.storeName')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre de la tienda debe tener entre 2 y 50 caracteres')
    .trim(),
  
  handleValidationErrors
];

// @desc    Password update validation
export const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  
  handleValidationErrors
];