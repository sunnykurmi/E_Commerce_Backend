const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },

},
{timestamps:true});

// Create a Cart model using the schema
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
