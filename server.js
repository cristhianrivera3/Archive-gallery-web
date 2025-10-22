import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar configuración y middleware
import connectDB, { checkDBHealth } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Importar rutas
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();
dotenv.config();

// ================================
// 🔗 CONEXIÓN A MONGODB
// ================================
connectDB();

// ================================
// ⚙️ MIDDLEWARES DE SEGURIDAD Y PERFORMANCE
// ================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://via.placeholder.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    name: 'Camiseta Oversize Negra',
    description: 'Camiseta 100% algodón con corte urbano oversize. Perfecta para looks casuales.',
    price: 89000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Camiseta Oversize Negra' }],
    stock: 5,
    category: 'Camisetas',
    size: 'L',
    condition: 'Como nuevo',
    brand: 'Streetwear Co',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  },
  {
    _id: '2',
    name: 'Chaqueta Techwear Futurista', 
    description: 'Chaqueta técnica impermeable con múltiples bolsillos y diseño futurista.',
    price: 210000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Chaqueta Techwear' }],
    stock: 2,
    category: 'Chaquetas',
    size: 'M',
    condition: 'Nuevo',
    brand: 'TechWear',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  },
  {
    _id: '3',
    name: 'Hoodie Essentials Beige',
    description: 'Hoodie básico premium en color beige, tejido fleece de alta calidad.',
    price: 120000,
    images: [{ url: '/img/placeholder.jpg', alt: 'Hoodie Essentials' }],
    stock: 8,
    category: 'Sudaderas',
    size: 'XL',
    condition: 'Buen estado',
    brand: 'Essentials',
    createdAt: new Date(),
    active: true,
    stats: { views: 0, favorites: 0, sales: 0 }
  }
];

// Función para obtener productos (intenta MongoDB primero, luego datos de prueba)
async function obtenerProductos() {
  try {
    const { default: Product } = await import('./models/Product.js');
    const productos = await Product.find({ active: true, stock: { $gt: 0 } })
      .populate('seller', 'username profile.avatar')
      .sort({ createdAt: -1 })
      .limit(12);
    return productos;
  } catch (error) {
    console.log('📝 Usando datos de prueba temporales - MongoDB no disponible');
    return productosPrueba;
  }
}

// Función para obtener un producto por ID
async function obtenerProductoPorId(id) {
  try {
    const { default: Product } = await import('./models/Product.js');
    const producto = await Product.findById(id)
      .populate('seller', 'username profile.avatar sellerProfile');
    return producto;
  } catch (error) {
    console.log('📝 Buscando en datos de prueba temporales');
    return productosPrueba.find(p => p._id === id);
  }
}

// ================================
// 🚏 RUTAS DE VISTAS (EJS)
// ================================

// Ruta principal - Página de inicio
app.get('/', async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: productos,
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error cargando página principal:', error);
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: productosPrueba,
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
      title: producto.name + ' - ČOMMØN PL4CE STOR3!',
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

// Ruta del panel de administración
app.get('/admin', async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE STOR3!',
      productos: productos,
      dbConnected: checkDBHealth()
    });
  } catch (error) {
    console.error('Error en admin:', error);
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE STOR3!',
      productos: productosPrueba,
      dbConnected: false
    });
  }
});

// Ruta para agregar producto (POST básico para vistas)
app.post('/admin/productos', async (req, res) => {
  try {
    const { name, description, price, stock, category, size, condition, brand } = req.body;
    
    try {
      const { default: Product } = await import('./models/Product.js');
      const { default: User } = await import('./models/User.js');
      
      // Usar un usuario temporal o crear uno por defecto
      let seller = await User.findOne().sort({ createdAt: 1 });
      if (!seller) {
        seller = await User.create({
          username: 'admin',
          email: 'admin@commonplace.com',
          password: 'temp123',
          role: 'admin'
        });
      }
      
      const nuevoProducto = new Product({
        name: name || 'Producto Sin Nombre',
        description: description || 'Descripción no disponible',
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 1,
        category: category || 'Camisetas',
        size: size || 'M',
        condition: condition || 'Buen estado',
        brand: brand || 'Generico',
        images: [{ url: '/img/placeholder.jpg', alt: name || 'Producto' }],
        seller: seller._id
      });
      
      await nuevoProducto.save();
      console.log('✅ Producto guardado en MongoDB');
    } catch (dbError) {
      console.log('📝 MongoDB no disponible - producto no persistido');
      // En modo fallback, no persistimos los datos
    }
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.redirect('/admin');
  }
});

// ================================
// 📡 RUTAS API (REST)
// ================================

// Usar rutas API
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Ruta de salud/estado
app.get('/health', (req, res) => {
  const health = {
    status: 'OK', 
    message: 'ČOMMØN PL4CE STOR3! funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    version: '1.0.0'
  };
  
  res.json(health);
});

// Ruta de información del sistema
app.get('/api/info', (req, res) => {
  res.json({
    app: 'ČOMMØN PL4CE STOR3!',
    version: '1.0.0',
    description: 'Tienda de ropa urbana de segunda mano',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      users: '/api/users',
      orders: '/api/orders',
      reviews: '/api/reviews'
    }
  });
});

// ================================
// 🛡️ MANEJO DE ERRORES
// ================================

// 404 handler para vistas
app.use('/admin', (req, res) => {
  res.status(404).render('error', {
    title: 'Página No Encontrada',
    message: 'La página de administración que buscas no existe.'
  });
});

// 404 handler global
app.use(notFound);

// Error handler global
app.use(errorHandler);

// ================================
// 🧱 INICIO DEL SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;

// Función de inicio
const startServer = () => {
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 ČOMMØN PL4CE STOR3! - Servidor Iniciado');
    console.log('='.repeat(60));
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? '✅ Conectado' : '❌ Desconectado'}`);
    console.log(`🛡️  Security: Helmet, Compression, Rate Limiting activados`);
    console.log('');
    console.log('📡 Endpoints disponibles:');
    console.log(`   🏠 Vistas:    http://localhost:${PORT}`);
    console.log(`   🛍️  Productos: http://localhost:${PORT}/api/products`);
    console.log(`   🔐 Auth:      http://localhost:${PORT}/api/auth`);
    console.log(`   ❤️  Health:     http://localhost:${PORT}/health`);
    console.log('');
    console.log('⚡ Usa Ctrl+C para detener el servidor');
    console.log('='.repeat(60));
  });
};

// Manejo de graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal de terminación...');
  await mongoose.connection.close();
  console.log('✅ Conexiones cerradas - Servidor terminado');
  process.exit(0);
});

// Iniciar servidor
startServer();

export default app;