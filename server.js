import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// ================================ 
// 🔧 CONFIGURACIÓN DE PATHS
// ================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
dotenv.config();

// ================================
// 🔗 CONEXIÓN A MONGODB MEJORADA
// ================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/commonplace';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    console.log('🔄 Usando datos de prueba temporales...');
  });

// ================================
// ⚙️ MIDDLEWARES
// ================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ================================
// 🧩 CONFIGURACIÓN DE EJS Y LAYOUTS
// ================================
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');

// ================================
// 📋 MODELO DE PRODUCTO TEMPORAL
// ================================
// Datos de prueba si MongoDB falla
const productosPrueba = [
  {
    _id: '1',
    nombre: 'Camiseta Básica',
    descripcion: 'Camiseta de algodón 100% premium',
    precio: 29.99,
    imagen: '/img/placeholder.jpg',
    stock: 15,
    fechaCreacion: new Date()
  },
  {
    _id: '2',
    nombre: 'Taza Personalizada', 
    descripcion: 'Taza de cerámica con diseño exclusivo',
    precio: 19.99,
    imagen: '/img/placeholder.jpg',
    stock: 8,
    fechaCreacion: new Date()
  },
  {
    _id: '3',
    nombre: 'Sticker Pack',
    descripcion: 'Pack de stickers variados',
    precio: 9.99,
    imagen: '/img/placeholder.jpg',
    stock: 25,
    fechaCreacion: new Date()
  }
];

// Función para obtener productos (intenta MongoDB primero, luego datos de prueba)
async function obtenerProductos() {
  try {
    // Intenta importar el modelo dinámicamente
    const { default: Product } = await import('./models/product.js');
    const productos = await Product.find().sort({ fechaCreacion: -1 });
    return productos;
  } catch (error) {
    console.log('📝 Usando datos de prueba temporales');
    return productosPrueba;
  }
}

// Función para obtener un producto por ID
async function obtenerProductoPorId(id) {
  try {
    const { default: Product } = await import('./models/product.js');
    const producto = await Product.findById(id);
    return producto;
  } catch (error) {
    console.log('📝 Buscando en datos de prueba temporales');
    return productosPrueba.find(p => p._id === id);
  }
}

// ================================
// 🚏 RUTAS PRINCIPALES
// ================================

// Ruta principal - Página de inicio
app.get('/', async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: productos
    });
  } catch (error) {
    console.error('Error:', error);
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: productosPrueba 
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
      title: producto.nombre + ' - ČOMMØN PL4CE STOR3!',
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
      productos: productos
    });
  } catch (error) {
    console.error('Error en admin:', error);
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE STOR3!',
      productos: productosPrueba
    });
  }
});

// Ruta para agregar producto (POST)
app.post('/admin/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen } = req.body;
    
    // Si MongoDB está conectado, guarda en la base de datos
    try {
      const { default: Product } = await import('./models/product.js');
      const nuevoProducto = new Product({
        nombre,
        descripcion,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        imagen: imagen || '/img/placeholder.jpg'
      });
      
      await nuevoProducto.save();
      console.log('✅ Producto guardado en MongoDB');
    } catch (dbError) {
      console.log('📝 Guardando en datos temporales (no persistente)');
      // En datos temporales, solo simularíamos el guardado
    }
    
    res.redirect('/admin');
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.redirect('/admin');
  }
});

// Ruta de API para productos (JSON)
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await obtenerProductos();
    res.json(productos);
  } catch (error) {
    res.json(productosPrueba);
  }
});

// Ruta de salud/estado
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ČOMMØN PL4CE STOR3! funcionando',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Página No Encontrada',
    message: 'La página que buscas no existe.'
  });
});

// ================================
// 🧱 SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ČOMMØN PL4CE STOR3! funcionando en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
});