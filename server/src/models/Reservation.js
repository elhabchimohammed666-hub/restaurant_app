const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  slotAt: { type: Date, required: true, index: true },
  partySize: { type: Number, required: true, min: 1, max: 20 },
  specialRequests: { type: String, trim: true, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending', index: true },
}, { timestamps: true });

reservationSchema.index({ slotAt: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
