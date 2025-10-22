import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
});

// @desc    Single file upload
export const uploadSingle = (fieldName) => upload.single(fieldName);

// @desc    Multiple files upload
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// @desc    Handle upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 5MB permitido.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Demasiados archivos. Máximo 5 archivos permitidos.'
      });
    }
  }

  if (err.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      success: false,
      error: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, etc.)'
    });
  }

  next(err);
};

// @desc    Process uploaded files for Cloudinary
export const processUploadedFiles = (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  // Single file
  if (req.file) {
    req.file.processed = {
      path: req.file.path,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    };
  }

  // Multiple files
  if (req.files) {
    req.files = req.files.map(file => ({
      ...file,
      processed: {
        path: file.path,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    }));
  }

  next();
};