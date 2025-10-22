import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    url: String,
    alt: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  sizeAccuracy: {
    type: Number,
    min: 1,
    max: 5
  },
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  shippingSpeed: {
    type: Number,
    min: 1,
    max: 5
  },
  sellerCommunication: {
    type: Number,
    min: 1,
    max: 5
  },
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  response: {
    comment: {
      type: String,
      maxlength: 500
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Índice compuesto para evitar reviews duplicados
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });

// Virtual para rating promedio detallado
reviewSchema.virtual('detailedRating').get(function() {
  const ratings = [
    this.rating,
    this.sizeAccuracy,
    this.quality,
    this.shippingSpeed,
    this.sellerCommunication
  ].filter(r => r); // Filtra ratings undefined

  if (ratings.length === 0) return 0;
  
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Middleware para actualizar el rating del producto
reviewSchema.post('save', async function() {
  try {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product);
    
    if (product) {
      const reviews = await this.constructor.find({ 
        product: this.product,
        status: 'approved'
      });
      
      if (reviews.length > 0) {
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        // Actualizar el rating del producto
        await Product.findByIdAndUpdate(this.product, {
          $set: {
            'stats.averageRating': Number(averageRating.toFixed(1)),
            'stats.reviewCount': reviews.length
          }
        });
      }
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
});

// Método estático para obtener reviews por producto
reviewSchema.statics.getProductReviews = function(productId, options = {}) {
  const { page = 1, limit = 10, sort = '-createdAt', rating } = options;
  const skip = (page - 1) * limit;
  
  let query = { 
    product: productId,
    status: 'approved'
  };
  
  if (rating) {
    query.rating = Number(rating);
  }
  
  return this.find(query)
    .populate('user', 'username profile.avatar profile.firstName')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Método estático para obtener estadísticas de ratings
reviewSchema.statics.getRatingStats = function(productId) {
  return this.aggregate([
    {
      $match: {
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        average: { $avg: '$_id' },
        distribution: {
          $push: {
            rating: '$_id',
            count: '$count'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        average: { $round: ['$average', 1] },
        distribution: {
          $arrayToObject: {
            $map: {
              input: '$distribution',
              as: 'dist',
              in: {
                k: { $toString: '$$dist.rating' },
                v: '$$dist.count'
              }
            }
          }
        }
      }
    }
  ]);
};

// Método para marcar review como útil
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.includes(userId)) {
    this.helpful.push(userId);
    await this.save();
  }
  return this;
};

// Método para remover marca de útil
reviewSchema.methods.unmarkHelpful = async function(userId) {
  this.helpful.pull(userId);
  await this.save();
  return this;
};

export default mongoose.model('Review', reviewSchema);