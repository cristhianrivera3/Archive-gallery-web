import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado, token no proporcionado'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Token válido pero usuario no encontrado'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Token no válido'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Error de autenticación'
    });
  }
};

// @desc    Authorize by roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado, usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Rol ${req.user.role} no tiene permisos para acceder a esta ruta`
      });
    }

    next();
  };
};

// @desc    Optional auth (for public routes that can have user context)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

// @desc    Check if user owns the resource
export const checkOwnership = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params[paramName]);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Recurso no encontrado'
        });
      }

      // Check if user owns the resource or is admin
      if (resource.user && resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado para modificar este recurso'
        });
      }

      // Check if user is the seller (for products)
      if (resource.seller && resource.seller.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'No autorizado para modificar este producto'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        error: 'Error verificando propiedad del recurso'
      });
    }
  };
};