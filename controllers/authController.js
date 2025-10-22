import User from '../models/User.js';
import { generateToken } from '../utils/helpers.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El usuario o email ya existe'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error en el registro'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa email y contraseña'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo usuario'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      'profile.firstName': req.body.firstName,
      'profile.lastName': req.body.lastName,
      'profile.bio': req.body.bio,
      'profile.location': req.body.location,
      'profile.website': req.body.website
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando detalles'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'La contraseña actual es incorrecta'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando contraseña'
    });
  }
};