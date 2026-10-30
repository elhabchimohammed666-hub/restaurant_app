const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedOptions: [{
    groupName: { type: String, required: true },
    optionName: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 0 },
  }],
  unitPriceCents: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [orderItemSchema], required: true, validate: [(items) => items.length > 0, 'An order must contain at least one item.'] },
  fulfillment: { type: String, enum: ['delivery', 'pickup'], required: true },
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    instructions: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  payment: {
    method: { type: String, enum: ['cash', 'card'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    providerReference: String,
  },
  subtotalCents: { type: Number, required: true, min: 0 },
  deliveryFeeCents: { type: Number, default: 0, min: 0 },
  totalCents: { type: Number, required: true, min: 0 },
  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true });

orderSchema.index({ customer: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
