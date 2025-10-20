import express from 'express';
import mongoose from 'mongoose';
import { app } from './server';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err)
    // ================================
    // ⚙️ MIDDLEWARES
    // ================================
    ,

    // ================================
    // ⚙️ MIDDLEWARES
    // ================================
    app.use(express.urlencoded({ extended: true })));
