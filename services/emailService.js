import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Order from '../models/Order.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // @desc    Send welcome email
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"ČOMMØN PL4CE STOR3!" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '¡Bienvenido a ČOMMØN PL4CE STOR3! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B7355, #C8A97E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #8B7355; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>ČOMMØN PL4CE STOR3!</h1>
                <p>Tu destino para moda urbana única</p>
              </div>
              <div class="content">
                <h2>¡Hola ${user.profile?.firstName || user.username}! 👋</h2>
                <p>Estamos emocionados de tenerte en nuestra comunidad de moda urbana.</p>
                
                <h3>🎁 Lo que puedes hacer:</h3>
                <ul>
                  <li>🛍️ Descubrir prendas únicas de segunda mano</li>
                  <li>⭐ Guardar tus productos favoritos</li>
                  <li>👥 Seguir a vendedores destacados</li>
                  <li>💬 Dejar reviews en tus compras</li>
                </ul>

                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="button">
                  Explorar Productos
                </a>

                <p>Si tienes alguna pregunta, no dudes en responder a este email.</p>
                
                <div class="footer">
                  <p>© 2024 ČOMMØN PL4CE STOR3!. Todos los derechos reservados.</p>
                  <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe" style="color: #666;">Cancelar suscripción</a></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to: ${user.email}`);
      
      return { success: true };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error: error.message };
    }
  }

  // @desc    Send order confirmation email
  async sendOrderConfirmation(order) {
    try {
      const user = await User.findById(order.user);
      const mailOptions = {
        from: `"ČOMMØN PL4CE STOR3!" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `✅ Confirmación de Pedido #${order._id.toString().slice(-6)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B7355, #C8A97E); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .order-info { background: white; padding: 20px; border: 1px solid #ddd; }
              .item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: #f9f9f9; }
              .total { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Pedido Confirmado! 🎉</h1>
                <p>N° ${order._id.toString().slice(-6)}</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Hola ${user.profile?.firstName || user.username},</h2>
                <p>Tu pedido ha sido confirmado y está siendo procesado.</p>

                <div class="order-info">
                  <h3>📦 Detalles del Pedido</h3>
                  ${order.items.map(item => `
                    <div class="item">
                      <span>${item.name} (${item.size})</span>
                      <span>${item.quantity} x $${item.price.toLocaleString()}</span>
                    </div>
                  `).join('')}
                  
                  <div class="total">
                    <span>Total: $${order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <p><strong>🚚 Dirección de envío:</strong><br>
                ${order.shippingAddress.address}, ${order.shippingAddress.city}<br>
                ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}</p>

                <p>Te notificaremos cuando tu pedido sea enviado.</p>
                
                <div style="text-align: center; margin-top: 30px; color: #666;">
                  <p>© 2024 ČOMMØN PL4CE STOR3!</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Order confirmation sent for order: ${order._id}`);
      
      return { success: true };
    } catch (error) {
      console.error('Order confirmation email error:', error);
      return { success: false, error: error.message };
    }
  }

  // @desc    Send order shipped email
  async sendOrderShipped(order, trackingNumber) {
    try {
      const user = await User.findById(order.user);
      const mailOptions = {
        from: `"ČOMMØN PL4CE STOR3!" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `🚚 Tu pedido ha sido enviado #${order._id.toString().slice(-6)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B7355, #C8A97E); color: white; padding: 20px; text-align: center; }
              .tracking { background: #e8f4ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Pedido En Camino! 🚚</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px;">
                <h2>¡Buenas noticias, ${user.profile?.firstName || user.username}!</h2>
                <p>Tu pedido #${order._id.toString().slice(-6)} ha sido enviado.</p>

                <div class="tracking">
                  <h3>📦 Número de Seguimiento</h3>
                  <p><strong>${trackingNumber}</strong></p>
                  <p>Puedes rastrear tu pedido usando este número en el sitio web del transportista.</p>
                </div>

                <p><strong>📍 Dirección de entrega:</strong><br>
                ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>

                <p>El tiempo de entrega estimado es de 3-5 días hábiles.</p>
                
                <div style="text-align: center; margin-top: 30px; color: #666;">
                  <p>© 2024 ČOMMØN PL4CE STOR3!</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Order shipped email error:', error);
      return { success: false, error: error.message };
    }
  }

  // @desc    Send password reset email
  async sendPasswordReset(user, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
      
      const mailOptions = {
        from: `"ČOMMØN PL4CE STOR3!" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔐 Restablecer tu Contraseña',
        html: `
          <!DOCTYPE html>
          <html>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #8B7355, #C8A97E); color: white; padding: 30px; text-align: center;">
                <h1>Restablecer Contraseña</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px;">
                <h2>Hola ${user.profile?.firstName || user.username},</h2>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #8B7355; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                  Restablecer Contraseña
                </a>
                
                <p>Este enlace expirará en 10 minutos.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
                
                <div style="text-align: center; margin-top: 30px; color: #666;">
                  <p>© 2024 ČOMMØN PL4CE STOR3!</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('Password reset email error:', error);
      return { success: false, error: error.message };
    }
  }

  // @desc    Send new product notification to followers
  async sendNewProductNotification(product, followers) {
    try {
      const emails = followers.map(follower => follower.email);
      
      if (emails.length === 0) return { success: true };

      const mailOptions = {
        from: `"ČOMMØN PL4CE STOR3!" <${process.env.EMAIL_USER}>`,
        bcc: emails,
        subject: `🆕 Nuevo producto de ${product.seller.storeName || product.seller.username}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #8B7355, #C8A97E); color: white; padding: 20px; text-align: center;">
                <h1>Nuevo Producto Disponible! 🎉</h1>
              </div>
              
              <div style="background: #f9f9f9; padding: 30px;">
                <h2>${product.name}</h2>
                <p>${product.description}</p>
                <p><strong>Precio: $${product.price.toLocaleString()}</strong></p>
                
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/product/${product._id}" 
                   style="display: inline-block; padding: 10px 20px; background: #8B7355; color: white; text-decoration: none; border-radius: 5px;">
                  Ver Producto
                </a>
                
                <div style="text-align: center; margin-top: 30px; color: #666;">
                  <p>© 2024 ČOMMØN PL4CE STOR3!</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ New product notification sent to ${emails.length} followers`);
      
      return { success: true };
    } catch (error) {
      console.error('New product notification error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();