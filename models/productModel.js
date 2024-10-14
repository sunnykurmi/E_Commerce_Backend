const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true, // Making category a required field
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Reference to the user model
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
