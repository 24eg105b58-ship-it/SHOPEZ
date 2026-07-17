const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a product price'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please add a product category'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Please add a product image URL'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock level'],
    min: 0,
    default: 0,
  },
  reviews: [reviewSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
