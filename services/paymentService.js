import Stripe from 'stripe';
import Order from '../models/Order.js';

class PaymentService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
  }

  // @desc    Create Stripe payment intent
  async createPaymentIntent(orderId, paymentMethod) {
    try {
      const order = await Order.findById(orderId).populate('user', 'email');
      
      if (!order) {
        throw new Error('Order not found');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          orderId: order._id.toString(),
          userId: order.user._id.toString()
        },
        receipt_email: order.user.email,
        description: `Order #${order._id} - ČOMMØN PL4CE STOR3!`
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Process Nequi payment (simulación)
  async processNequiPayment(orderId, phoneNumber) {
    try {
      // Simular procesamiento de pago con Nequi
      // En producción, integrarías con la API real de Nequi
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      // Simular éxito del 90% para testing
      const success = Math.random() > 0.1;
      
      if (success) {
        return {
          success: true,
          transactionId: `NEQ${Date.now()}`,
          message: 'Pago procesado exitosamente con Nequi'
        };
      } else {
        throw new Error('Pago rechazado por Nequi');
      }
    } catch (error) {
      console.error('Nequi payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Process DaviPlata payment (simulación)
  async processDaviPlataPayment(orderId, phoneNumber) {
    try {
      // Simular procesamiento de pago con DaviPlata
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.1;
      
      if (success) {
        return {
          success: true,
          transactionId: `DAV${Date.now()}`,
          message: 'Pago procesado exitosamente con DaviPlata'
        };
      } else {
        throw new Error('Pago rechazado por DaviPlata');
      }
    } catch (error) {
      console.error('DaviPlata payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Verify payment status
  async verifyPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Refund payment
  async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundParams = {
        payment_intent: paymentIntentId
      };
      
      if (amount) {
        refundParams.amount = Math.round(amount * 100);
      }
      
      const refund = await this.stripe.refunds.create(refundParams);
      
      return {
        success: true,
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PaymentService();