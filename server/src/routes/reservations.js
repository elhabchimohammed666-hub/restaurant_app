const express = require('express');
const Reservation = require('../models/Reservation');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const reservationStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, slotAt, partySize, specialRequests } = req.body;
    const reservationDate = new Date(slotAt);
    if (typeof name !== 'string' || !name.trim()
      || typeof email !== 'string' || !email.trim()
      || typeof phone !== 'string' || !phone.trim()
      || Number.isNaN(reservationDate.getTime())
      || reservationDate <= new Date()
      || !Number.isInteger(partySize)
      || partySize < 1
      || partySize > 20) {
      return res.status(400).json({ message: 'Nom, coordonnées, créneau et nombre de personnes requis.' });
    }
    const reservation = await Reservation.create({
      customer: req.user?.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      slotAt: reservationDate,
      partySize,
      specialRequests,
    });
    return res.status(201).json({ reservation });
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ customer: req.user.id }).sort({ slotAt: 1 }).limit(50);
    return res.json({ reservations });
  } catch (error) {
    return next(error);
  }
});

router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const reservations = await Reservation.find().populate('customer', 'name email').sort({ slotAt: 1 }).limit(100);
    return res.json({ reservations });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    if (!reservationStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Statut de réservation invalide.' });
    }
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });
    return res.json({ reservation });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
