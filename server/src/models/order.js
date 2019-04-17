const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    default: 'new',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
