const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  priceCents: { type: Number, default: 0, min: 0 },
});

const optionGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  required: { type: Boolean, default: false },
  minChoices: { type: Number, default: 0, min: 0 },
  maxChoices: { type: Number, default: 1, min: 1 },
  options: { type: [optionSchema], default: [] },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, index: true },
  priceCents: { type: Number, required: true, min: 0 },
  images: { type: [String], default: [] },
  optionGroups: { type: [optionGroupSchema], default: [] },
  isAvailable: { type: Boolean, default: true, index: true },
  popularity: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
