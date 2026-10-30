const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  instructions: { type: String, trim: true, maxlength: 300 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'delivery', 'admin'], default: 'customer', required: true },
  addresses: { type: [addressSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
