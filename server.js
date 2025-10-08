import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productroutes.js';



const app = express();

// Configuración para rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use('/api/products', productRoutes);
app.use(express.urlencoded({ extended: true }));

// Conexión con MongoDB Atlas
mongoose.connect('mongodb+srv://cristianriverasz123_db_user:ydH19YPOODPQifjb@cluster0.iko3tkq.mongodb.net/stockgallery?retryWrites=true&w=majority&appName=Cluster0');


// Configuración de vistas y archivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.render('index');
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));



