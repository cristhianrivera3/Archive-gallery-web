import Product from '../models/Product.js';
import Order from '../models/Order.js';

class InventoryService {
  
  // @desc    Check product availability
  async checkAvailability(productId, quantity) {
    try {
      const product = await Product.findById(productId);
      
      if (!product || !product.active) {
        return {
          available: false,
          error: 'Producto no disponible'
        };
      }

      if (product.stock < quantity) {
        return {
          available: false,
          error: `Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`,
          availableStock: product.stock
        };
      }

      return {
        available: true,
        product: product,
        availableStock: product.stock
      };
    } catch (error) {
      console.error('Inventory check error:', error);
      return {
        available: false,
        error: 'Error verificando disponibilidad'
      };
    }
  }

  // @desc    Reserve stock for an order
  async reserveStock(productId, quantity) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (product.stock < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${product.stock}, Solicitado: ${quantity}`);
      }

      // Reserve stock
      product.stock -= quantity;
      await product.save();

      console.log(`✅ Stock reservado: ${quantity} unidades de ${product.name}`);
      
      return {
        success: true,
        reserved: quantity,
        remainingStock: product.stock
      };
    } catch (error) {
      console.error('Stock reservation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Release reserved stock (if order is cancelled)
  async releaseStock(productId, quantity) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Release stock
      product.stock += quantity;
      await product.save();

      console.log(`🔄 Stock liberado: ${quantity} unidades de ${product.name}`);
      
      return {
        success: true,
        released: quantity,
        currentStock: product.stock
      };
    } catch (error) {
      console.error('Stock release error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Update stock after order completion
  async updateStockAfterSale(productId, quantity) {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Update sales count (stock was already reduced during reservation)
      product.stats.sales += quantity;
      await product.save();

      console.log(`📈 Stock actualizado después de venta: ${product.name}`);
      
      return {
        success: true,
        salesCount: product.stats.sales,
        currentStock: product.stock
      };
    } catch (error) {
      console.error('Stock update after sale error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Get low stock alerts
  async getLowStockAlerts(sellerId, threshold = 5) {
    try {
      const lowStockProducts = await Product.find({
        seller: sellerId,
        active: true,
        stock: { $lte: threshold, $gt: 0 }
      }).select('name stock price images');

      const outOfStockProducts = await Product.find({
        seller: sellerId,
        active: true,
        stock: 0
      }).select('name price images');

      return {
        success: true,
        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts
        },
        outOfStock: {
          count: outOfStockProducts.length,
          products: outOfStockProducts
        },
        totalAlerts: lowStockProducts.length + outOfStockProducts.length
      };
    } catch (error) {
      console.error('Low stock alerts error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Get inventory statistics
  async getInventoryStats(sellerId) {
    try {
      const stats = await Product.aggregate([
        {
          $match: {
            seller: sellerId,
            active: true
          }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
            averagePrice: { $avg: '$price' },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$stock', 5] }, 1, 0]
              }
            },
            outOfStockCount: {
              $sum: {
                $cond: [{ $eq: ['$stock', 0] }, 1, 0]
              }
            }
          }
        }
      ]);

      const categoryStats = await Product.aggregate([
        {
          $match: {
            seller: sellerId,
            active: true
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return {
        success: true,
        overview: stats.length > 0 ? stats[0] : {
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0,
          averagePrice: 0,
          lowStockCount: 0,
          outOfStockCount: 0
        },
        byCategory: categoryStats
      };
    } catch (error) {
      console.error('Inventory stats error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Bulk update stock
  async bulkUpdateStock(updates) {
    try {
      const results = [];
      
      for (const update of updates) {
        try {
          const product = await Product.findById(update.productId);
          
          if (!product) {
            results.push({
              productId: update.productId,
              success: false,
              error: 'Producto no encontrado'
            });
            continue;
          }

          product.stock = update.newStock;
          await product.save();

          results.push({
            productId: update.productId,
            success: true,
            productName: product.name,
            previousStock: update.previousStock,
            newStock: product.stock
          });
        } catch (error) {
          results.push({
            productId: update.productId,
            success: false,
            error: error.message
          });
        }
      }

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      return {
        success: true,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        },
        details: results
      };
    } catch (error) {
      console.error('Bulk stock update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // @desc    Get stock history (simulado)
  async getStockHistory(productId, days = 30) {
    try {
      // En una implementación real, esto vendría de una colección de historial
      // Por ahora simulamos datos
      const history = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        history.push({
          date: date.toISOString().split('T')[0],
          stock: Math.floor(Math.random() * 50) + 10, // Simular stock
          changes: Math.floor(Math.random() * 10) - 5 // Simular cambios
        });
      }

      return {
        success: true,
        productId,
        period: `${days} días`,
        history
      };
    } catch (error) {
      console.error('Stock history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new InventoryService();