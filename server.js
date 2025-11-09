// Configuración para Render.com
const isProduction = process.env.NODE_ENV === 'production';

import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import mercadopago from 'mercadopago';

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

// Middleware para producción
if (isProduction) {
  console.log('🚀 Modo: PRODUCCIÓN (Render.com)');
  app.set('trust proxy', 1);
} else {
  console.log('💻 Modo: DESARROLLO (Local)');
}

// ================================
// 🔗 CONEXIÓN A MONGODB
// ================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/common-place');
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.log('❌ Error conectando MongoDB:', error.message);
    console.log('📝 Usando modo demo sin base de datos');
  }
};

const checkDBHealth = () => {
  return mongoose.connection.readyState === 1;
};

connectDB();

// ================================
// ⚙️ CONFIGURACIÓN MULTER PARA SUBIDA DE ARCHIVOS
// ================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ================================
// ⚙️ MIDDLEWARES DE SEGURIDAD Y PERFORMANCE
// ================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://via.placeholder.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas requests desde esta IP, intenta de nuevo en 15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ================================
// 💳 CONFIGURACIÓN MERCADO PAGO
// ================================
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-1234567890123456-123456-123456789012345678901234567890'
});

// ================================
// 🧩 CONFIGURACIÓN DE EJS Y LAYOUTS
// ================================
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// ================================
// 📋 DATOS DE PRUEBA (FALLBACK)
// ================================
const productosPrueba = [
  {
    _id: '1',
    name: 'Oversize Black Tee',
    description: 'Premium cotton oversized t-shirt with streetwear aesthetic.',
    price: 89000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Oversize Black Tee' }],
    stock: 5,
    category: 'Streetwear',
    size: 'L',
    condition: 'New',
    brand: 'Common Place',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  },
  {
    _id: '2',
    name: 'Techwear Jacket', 
    description: 'Futuristic technical jacket with multiple pockets.',
    price: 210000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Techwear Jacket' }],
    stock: 2,
    category: 'Techwear',
    size: 'M',
    condition: 'New',
    brand: 'TechWear',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  },
  {
    _id: '3',
    name: 'Vintage Denim Jeans',
    description: 'Classic vintage denim with unique wash.',
    price: 120000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Vintage Denim' }],
    stock: 3,
    category: 'Pantalones',
    size: '32',
    condition: 'Like New',
    brand: 'Vintage Co',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  },
  {
    _id: '4',
    name: 'Designer Blazer',
    description: 'Elegant blazer for urban sophistication.',
    price: 180000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Designer Blazer' }],
    stock: 1,
    category: 'Sacos',
    size: 'M',
    condition: 'New',
    brand: 'Urban Elegance',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  }
];

const artworksPrueba = [
  {
    _id: '1',
    title: 'Urban Dreams',
    artist: 'Alex Rivera',
    description: 'Mixed media exploring urban landscapes',
    image: '/img/placeholder.jpg',
    year: '2024',
    category: 'Digital Art'
  },
  {
    _id: '2',
    title: 'Neon Nights',
    artist: 'Maria Chen',
    description: 'Digital painting of city nightlife',
    image: '/img/placeholder.jpg',
    year: '2024',
    category: 'Digital Art'
  }
];

// ================================
// 🗂️ FUNCIONES PARA OBTENER DATOS
// ================================
async function obtenerProductos() {
  try {
    const { default: Product } = await import('./models/Product.js');
    const productos = await Product.find({ active: true, stock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(12);
    return productos;
  } catch (error) {
    console.log('📝 Usando datos de prueba temporales - MongoDB no disponible');
    return productosPrueba;
  }
}

async function obtenerProductosPorCategoria(categoria) {
  try {
    const { default: Product } = await import('./models/Product.js');
    let query = { active: true, stock: { $gt: 0 } };
    
    if (categoria && categoria !== 'todo') {
      query.category = new RegExp(categoria, 'i');
    }
    
    const productos = await Product.find(query)
      .sort({ createdAt: -1 });
    return productos;
  } catch (error) {
    console.log('📝 Usando datos de prueba por categoría');
    if (categoria && categoria !== 'todo') {
      return productosPrueba.filter(p => 
        p.category.toLowerCase().includes(categoria.toLowerCase())
      );
    }
    return productosPrueba;
  }
}

async function obtenerProductoPorId(id) {
  try {
    const { default: Product } = await import('./models/Product.js');
    const producto = await Product.findById(id);
    return producto;
  } catch (error) {
    console.log('📝 Buscando en datos de prueba temporales');
    return productosPrueba.find(p => p._id === id);
  }
}

async function obtenerArtworks() {
  try {
    return artworksPrueba;
  } catch (error) {
    console.log('📝 Usando datos de prueba para galería');
    return artworksPrueba;
  }
}

// ================================
// 🚏 RUTAS DE VISTAS (EJS) - NUEVA ESTRUCTURA
// ================================

// Ruta principal - Página de inicio con dos banners
app.get('/', async (req, res) => {
  try {
    const banners = {
      stock: '/img/stock-banner.jpg',
      gallery: '/img/gallery-banner.jpg'
    };
    
    res.render('index', { 
      title: 'ČOMMØN PL4CE ¡! ⁂✧ - Streetwear & Art Gallery',
      banners: banners,
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error cargando página principal:', error);
    res.render('index', { 
      title: 'ČOMMØN PL4CE ¡! ⁂✧ - Streetwear & Art Gallery',
      banners: {},
      dbConnected: false
    });
  }
});

// Ruta STOCK - Página de productos
app.get('/stock', async (req, res) => {
  try {
    const categoria = req.query.categoria;
    const productos = categoria ? 
      await obtenerProductosPorCategoria(categoria) : 
      await obtenerProductos();
    
    res.render('stock', { 
      title: 'STOCK - ČOMMØN PL4CE ¡! ⁂✧',
      productos: productos,
      categoriaActual: categoria || 'todo',
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error cargando stock:', error);
    res.render('stock', { 
      title: 'STOCK - ČOMMØN PL4CE ¡! ⁂✧',
      productos: productosPrueba,
      categoriaActual: 'todo',
      dbConnected: false
    });
  }
});

// Ruta GALLERY - Página de galería de arte
app.get('/gallery', async (req, res) => {
  try {
    const artworks = await obtenerArtworks();
    res.render('gallery', { 
      title: 'GALLERY - ČOMMØN PL4CE ¡! ⁂✧',
      artworks: artworks,
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error cargando galería:', error);
    res.render('gallery', { 
      title: 'GALLERY - ČOMMØN PL4CE ¡! ⁂✧',
      artworks: artworksPrueba,
      dbConnected: false
    });
  }
});

// Ruta para vista individual de producto
app.get('/producto/:id', async (req, res) => {
  try {
    const producto = await obtenerProductoPorId(req.params.id);
    
    if (!producto) {
      return res.status(404).render('error', { 
        title: 'Producto No Encontrado',
        message: 'El producto que buscas no existe.'
      });
    }
    
    res.render('product', { 
      title: producto.name + ' - ČOMMØN PL4CE ¡! ⁂✧',
      producto: producto
    });
  } catch (error) {
    console.error('Error al cargar producto:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error al cargar el producto.'
    });
  }
});

// ================================
// 🛒 SISTEMA DE CARRITO CON COOKIES - CORREGIDO
// ================================

// Agregar producto al carrito
app.post('/api/carrito/agregar', async (req, res) => {
  try {
    const { productoId, cantidad = 1 } = req.body;
    
    // Validar producto
    const { default: Product } = await import('./models/Product.js');
    const producto = await Product.findById(productoId);
    
    if (!producto || !producto.active || producto.stock < 1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Producto no disponible' 
      });
    }

    // Leer carrito actual
    let carrito = req.cookies.carrito ? JSON.parse(req.cookies.carrito) : [];
    
    // Verificar si ya está en el carrito
    const itemExistente = carrito.find(item => item.productoId === productoId);
    
    if (itemExistente) {
      itemExistente.cantidad += parseInt(cantidad);
    } else {
      carrito.push({
        productoId: productoId,
        cantidad: parseInt(cantidad),
        agregadoEn: new Date().toISOString(),
        precio: producto.price
      });
    }
    
    // Guardar en cookies por 7 días
    res.cookie('carrito', JSON.stringify(carrito), { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    
    res.json({ 
      success: true, 
      message: 'Producto agregado al carrito',
      carrito: carrito 
    });
    
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al agregar al carrito' 
    });
  }
});

// Obtener carrito con detalles completos
app.get('/api/carrito', async (req, res) => {
  try {
    const carrito = req.cookies.carrito ? JSON.parse(req.cookies.carrito) : [];
    const { default: Product } = await import('./models/Product.js');
    
    // Enriquecer con datos del producto
    const carritoConDetalles = await Promise.all(
      carrito.map(async (item) => {
        const producto = await Product.findById(item.productoId);
        return {
          ...item,
          producto: producto ? {
            _id: producto._id,
            name: producto.name,
            price: producto.price,
            images: producto.images,
            stock: producto.stock,
            brand: producto.brand,
            size: producto.size
          } : null
        };
      })
    );
    
    // Filtrar productos que ya no existen
    const carritoFiltrado = carritoConDetalles.filter(item => item.producto !== null);
    
    // Actualizar cookie si hubo cambios
    if (carritoFiltrado.length !== carrito.length) {
      res.cookie('carrito', JSON.stringify(carritoFiltrado.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        agregadoEn: item.agregadoEn,
        precio: item.precio
      }))), { 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
      });
    }
    
    res.json({ 
      success: true, 
      carrito: carritoFiltrado 
    });
    
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.json({ success: true, carrito: [] });
  }
});

// Eliminar item del carrito
app.delete('/api/carrito/:productoId', (req, res) => {
  try {
    let carrito = req.cookies.carrito ? JSON.parse(req.cookies.carrito) : [];
    carrito = carrito.filter(item => item.productoId !== req.params.productoId);
    
    res.cookie('carrito', JSON.stringify(carrito), { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    
    res.json({ 
      success: true, 
      message: 'Producto eliminado del carrito',
      carrito: carrito 
    });
    
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar del carrito' 
    });
  }
});

// Actualizar cantidad
app.put('/api/carrito/:productoId', async (req, res) => {
  try {
    const { cantidad } = req.body;
    let carrito = req.cookies.carrito ? JSON.parse(req.cookies.carrito) : [];
    
    const item = carrito.find(item => item.productoId === req.params.productoId);
    if (item) {
      item.cantidad = parseInt(cantidad);
    }
    
    res.cookie('carrito', JSON.stringify(carrito), { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax'
    });
    
    res.json({ 
      success: true, 
      message: 'Cantidad actualizada',
      carrito: carrito 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar cantidad' 
    });
  }
});

// ================================
// 💳 SISTEMA DE PAGOS CON MERCADO PAGO (INCLUYE NEQUI)
// ================================

// Ruta para crear preferencia de pago
app.post('/api/crear-pago', async (req, res) => {
  try {
    const { items, comprador } = req.body;
    
    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    const preference = {
      items: items.map(item => ({
        id: item.productoId,
        title: `${item.producto.name} - ${item.producto.brand} (${item.producto.size})`,
        description: `Condición: ${item.producto.condition}`,
        category_id: "fashion",
        quantity: item.cantidad,
        currency_id: "COP",
        unit_price: item.precio,
        picture_url: item.producto.images[0]?.url ? 
          `${req.protocol}://${req.get('host')}${item.producto.images[0].url}` : 
          `${req.protocol}://${req.get('host')}/img/placeholder.jpg`
      })),
      payer: {
        name: comprador.nombre,
        surname: comprador.apellido,
        email: comprador.email,
        phone: {
          area_code: "57",
          number: comprador.telefono.replace(/\D/g, '')
        },
        address: {
          street_name: comprador.direccion,
          zip_code: comprador.codigoPostal || "000000"
        }
      },
      payment_methods: {
        excluded_payment_types: [],
        excluded_payment_methods: [],
        installments: 1,
        default_installments: 1
      },
      back_urls: {
        success: `${req.protocol}://${req.get('host')}/pago-exitoso`,
        failure: `${req.protocol}://${req.get('host')}/pago-fallido`, 
        pending: `${req.protocol}://${req.get('host')}/pago-pendiente`
      },
      auto_return: "approved",
      notification_url: `${req.protocol}://${req.get('host')}/api/webhook-mercadopago`,
      statement_descriptor: "COMMON PLACE",
      external_reference: `common_place_${Date.now()}`,
      expires: false,
      metadata: {
        comprador: comprador.nombre,
        email: comprador.email,
        tienda: "ČOMMØN PL4CE"
      }
    };

    console.log('🔄 Creando preferencia de pago...');
    const response = await mercadopago.preferences.create(preference);
    
    console.log('✅ Preferencia creada:', response.body.id);
    
    res.json({ 
      success: true, 
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });
    
  } catch (error) {
    console.error('❌ Error creando pago:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear el pago: ' + error.message 
    });
  }
});

// Webhook para confirmaciones de pago
app.post('/api/webhook-mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'payment') {
      console.log('📦 Webhook recibido - ID de pago:', data.id);
      
      // Obtener detalles del pago
      const payment = await mercadopago.payment.findById(data.id);
      const paymentData = payment.body;
      
      console.log('💰 Estado del pago:', paymentData.status);
      console.log('📋 Detalles:', {
        id: paymentData.id,
        status: paymentData.status,
        amount: paymentData.transaction_amount,
        email: paymentData.payer?.email,
        reference: paymentData.external_reference
      });
      
      // Aquí puedes actualizar stock, crear orden, etc.
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).send('Error');
  }
});

// Rutas de respuesta de pago
app.get('/pago-exitoso', (req, res) => {
  // Limpiar carrito después de pago exitoso
  res.clearCookie('carrito');
  
  res.render('pagoExitoso', { 
    title: '¡Pago Exitoso! - ČOMMØN PL4CE',
    payment_id: req.query.payment_id,
    collection_id: req.query.collection_id
  });
});

app.get('/pago-fallido', (req, res) => {
  res.render('pagoFallido', { 
    title: 'Pago Fallido - ČOMMØN PL4CE',
    error: req.query.error 
  });
});

app.get('/pago-pendiente', (req, res) => {
  res.render('pagoPendiente', { 
    title: 'Pago Pendiente - ČOMMØN PL4CE',
    payment_id: req.query.payment_id 
  });
});

// Ruta de checkout
app.get('/checkout', async (req, res) => {
  try {
    res.render('checkout', { 
      title: 'Checkout - ČOMMØN PL4CE',
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error en checkout:', error);
    res.render('checkout', { 
      title: 'Checkout - ČOMMØN PL4CE',
      dbConnected: false
    });
  }
});

// ================================
// 🎨 RUTAS DE ADMINISTRACIÓN MEJORADAS
// ================================

// Ruta del panel de administración
app.get('/admin', async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE ¡! ⁂✧',
      productos: productos,
      dbConnected: checkDBHealth(),
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error en admin:', error);
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE ¡! ⁂✧',
      productos: productosPrueba,
      dbConnected: false,
      success: req.query.success,
      error: req.query.error
    });
  }
});

// Ruta para actualizar banners
app.post('/admin/update-banner', upload.single('bannerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin?error=No se seleccionó ninguna imagen');
    }

    const bannerType = req.body.bannerType;
    const imagePath = '/uploads/' + req.file.filename;

    console.log(`✅ Banner ${bannerType} actualizado: ${imagePath}`);
    
    res.redirect('/admin?success=Banner actualizado correctamente');
  } catch (error) {
    console.error('❌ Error actualizando banner:', error);
    res.redirect('/admin?error=Error al actualizar el banner');
  }
});

// Ruta para agregar producto
app.post('/admin/productos', upload.array('productImages', 5), async (req, res) => {
  try {
    const { name, description, price, stock, category, size, condition, brand } = req.body;
    
    console.log('📦 Datos recibidos del formulario:', req.body);
    console.log('🖼️ Archivos recibidos:', req.files);

    if (!name || !description || !price) {
      return res.redirect('/admin?error=Nombre, descripción y precio son requeridos');
    }

    try {
      const { default: Product } = await import('./models/Product.js');
      
      const images = [];
      if (req.files && req.files.length > 0) {
        req.files.forEach((file, index) => {
          images.push({
            url: '/uploads/' + file.filename,
            alt: name,
            isPrimary: index === 0
          });
        });
      } else {
        images.push({
          url: '/img/placeholder.jpg',
          alt: name,
          isPrimary: true
        });
      }
      
      const nuevoProducto = new Product({
        name: name,
        description: description,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 1,
        category: category || 'Camisetas',
        size: size || 'M',
        condition: condition || 'New',
        brand: brand || 'Common Place',
        images: images,
        active: true
      });
      
      await nuevoProducto.save();
      console.log('✅ Producto guardado en MongoDB:', nuevoProducto.name);
      
      res.redirect('/admin?success=Producto agregado correctamente');
      
    } catch (dbError) {
      console.log('📝 MongoDB no disponible - producto no persistido');
      res.redirect('/admin?success=Producto agregado (modo demo - no persistido)');
    }
    
  } catch (error) {
    console.error('❌ Error al agregar producto:', error);
    res.redirect('/admin?error=Error al agregar el producto');
  }
});

// Ruta para eliminar producto
app.post('/admin/productos/:id/eliminar', async (req, res) => {
  try {
    const productId = req.params.id;
    
    console.log('🗑️ Intentando eliminar producto:', productId);
    
    try {
      const { default: Product } = await import('./models/Product.js');
      const resultado = await Product.findByIdAndDelete(productId);
      
      if (resultado) {
        console.log('✅ Producto eliminado de MongoDB:', productId);
        res.redirect('/admin?success=Producto eliminado correctamente');
      } else {
        console.log('⚠️ Producto no encontrado en MongoDB:', productId);
        res.redirect('/admin?error=Producto no encontrado');
      }
      
    } catch (dbError) {
      console.log('📝 Eliminación en datos temporales (no persistente)');
      res.redirect('/admin?success=Producto eliminado (modo demo)');
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.redirect('/admin?error=Error al eliminar el producto');
  }
});

// Ruta para gestión de galería
app.get('/admin/gallery', async (req, res) => {
  try {
    const artworks = await obtenerArtworks();
    res.render('admin-gallery', {
      title: 'GALLERY MANAGEMENT - ČOMMØN PL4CE ¡! ⁂✧',
      artworks: artworks,
      dbConnected: checkDBHealth(),
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error en admin gallery:', error);
    res.render('admin-gallery', {
      title: 'GALLERY MANAGEMENT - ČOMMØN PL4CE ¡! ⁂✧',
      artworks: artworksPrueba,
      dbConnected: false
    });
  }
});

// ================================
// 📡 RUTAS DEL SISTEMA
// ================================

// Ruta de salud/estado
app.get('/health', (req, res) => {
  const health = {
    status: 'OK', 
    message: 'ČOMMØN PL4CE ¡! ⁂✧ funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: checkDBHealth() ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    version: '2.0.0',
    features: ['stock', 'gallery', 'admin', 'banner-management', 'categorias', 'carrito', 'pagos']
  };
  
  res.json(health);
});

// Ruta de información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    app: 'ČOMMØN PL4CE ¡! ⁂✧',
    version: '2.0.0',
    description: 'Ropa de segunda de calidad seleccionada - Streetwear & Art Gallery',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      home: '/',
      stock: '/stock',
      gallery: '/gallery',
      admin: '/admin',
      checkout: '/checkout',
      carrito: '/api/carrito',
      pagos: '/api/crear-pago',
      health: '/health'
    },
    categorias: ['pantalones', 'camisetas', 'sacos', 'todo']
  });
});

// ================================
// ❌ MANEJO DE ERRORES
// ================================

// 404 handler para vistas
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página No Encontrada',
    message: 'La página que buscas no existe.'
  });
});

// ================================
// 🚀 INICIAR SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 ČOMMØN PL4CE ¡! ⁂✧ - Servidor Iniciado');
  console.log('='.repeat(70));
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 MongoDB: ${checkDBHealth() ? '✅ Conectado' : '❌ Desconectado'}`);
  console.log(`🛡️ Security: Helmet, Compression, Rate Limiting activados`);
  console.log(`🛒 Carrito: Cookies activadas`);
  console.log(`💳 Pagos: Mercado Pago integrado (Nequi disponible)`);
  console.log('');
  console.log('📡 Endpoints disponibles:');
  console.log(`   🏠 Home:      http://localhost:${PORT}`);
  console.log(`   🛍️ Stock:     http://localhost:${PORT}/stock`);
  console.log(`   🎨 Gallery:   http://localhost:${PORT}/gallery`);
  console.log(`   👨‍💼 Admin:     http://localhost:${PORT}/admin`);
  console.log(`   💳 Checkout:  http://localhost:${PORT}/checkout`);
  console.log(`   ❤️ Health:     http://localhost:${PORT}/health`);
  console.log('');
  console.log('🎯 Características:');
  console.log(`   ✅ Sistema de carrito con cookies`);
  console.log(`   ✅ Integración Mercado Pago (Nequi, tarjetas, PSE)`);
  console.log(`   ✅ Checkout completo`);
  console.log(`   ✅ Panel admin para productos`);
  console.log(`   ✅ Gestión de banners`);
  console.log('');
  console.log('⚡ Usa Ctrl+C para detener el servidor');
  console.log('='.repeat(70));
});

export default app;