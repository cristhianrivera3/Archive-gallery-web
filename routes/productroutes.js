// routes/ProductRoutes.js
import express from 'express';
import Product from '../models/product.js';

const router = express.Router();

// Obtener todos los productos (API)
router.get('/api/productos', async (req, res) => {
    try {
        const productos = await Product.find().sort({ fechaCreacion: -1 });
        res.json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Obtener producto por ID (API)
router.get('/api/productos/:id', async (req, res) => {
    try {
        const producto = await Product.findById(req.params.id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Crear producto nuevo (API)
router.post('/api/productos', async (req, res) => {
    try {
        const nuevo = new Product(req.body);
        const guardado = await nuevo.save();
        res.status(201).json(guardado);
    } catch (err) {
        res.status(400).json({ error: 'Error al crear el producto' });
    }
});

export default router;