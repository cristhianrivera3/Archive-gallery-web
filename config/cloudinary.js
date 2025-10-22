import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Función para subir imagen
export const uploadImage = async (filePath, folder = 'common-place-store') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('❌ Error subiendo imagen a Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para eliminar imagen
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result
    };
  } catch (error) {
    console.error('❌ Error eliminando imagen de Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Función para optimizar imagen (transformaciones)
export const getOptimizedImage = (publicId, options = {}) => {
  const {
    width = 500,
    height = 500,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    secure: true
  });
};

// Función para subir múltiples imágenes
export const uploadMultipleImages = async (filePaths, folder = 'common-place-store') => {
  try {
    const uploadPromises = filePaths.map(filePath => 
      uploadImage(filePath, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Filtrar solo las subidas exitosas
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);
    
    return {
      success: true,
      uploaded: successfulUploads,
      failed: failedUploads,
      total: results.length,
      successful: successfulUploads.length,
      failedCount: failedUploads.length
    };
    
  } catch (error) {
    console.error('❌ Error subiendo múltiples imágenes:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary;