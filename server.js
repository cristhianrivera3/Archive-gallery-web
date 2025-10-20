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
// 🔗 CONEXIÓN A MONGODB
// ================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

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
// 📋 IMPORTAR MODELO DE PRODUCTO
// ================================
import Product from './models/product.js';

// ================================
// 🚏 RUTAS PRINCIPALES
// ================================

// Ruta principal - Página de inicio
app.get('/', async (req, res) => {
  try {
    const productos = await Product.find().sort({ fechaCreacion: -1 });
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: productos
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.render('index', { 
      title: 'INICIO - ČOMMØN PL4CE STOR3!',
      productos: [] 
    });
  }
});

// Ruta para vista individual de producto
app.get('/producto/:id', async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
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
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Error al cargar el producto.'
    });
  }
});

// Ruta del panel de administración
app.get('/admin', async (req, res) => {
  try {
    const productos = await Product.find().sort({ fechaCreacion: -1 });
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE STOR3!',
      productos: productos
    });
  } catch (error) {
    res.render('admin', { 
      title: 'ADMIN - ČOMMØN PL4CE STOR3!',
      productos: []
    });
  }
});

// ================================
// 🧱 SERVIDOR
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 ČOMMØN PL4CE STOR3! funcionando en http://localhost:${PORT}`);
});
