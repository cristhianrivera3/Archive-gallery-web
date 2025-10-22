import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Opciones adicionales para mejor rendimiento
      maxPoolSize: 10, // Máximo de conexiones
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Cierra sockets después de 45 segundos de inactividad
    });
    
    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
    
    // Manejo de eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB desconectado - Intentando reconectar...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado');
    });
    
    // Manejo graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Conexión a MongoDB cerrada por terminación de app');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Función para verificar estado de la conexión
export const checkDBHealth = () => {
  const states = {
    0: 'Disconnected',
    1: 'Connected', 
    2: 'Connecting',
    3: 'Disconnecting'
  };
  
  const state = states[mongoose.connection.readyState] || 'Unknown';
  console.log(`📊 Estado BD: ${state}`);
  return state === 'Connected';
};

export default connectDB;
