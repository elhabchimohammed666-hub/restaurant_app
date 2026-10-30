const express = require('express');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available !== 'false') filter.isAvailable = true;
    if (req.query.search) filter.$text = { $search: String(req.query.search) };
    const sortOptions = { price: { priceCents: 1 }, popular: { popularity: -1 }, recent: { createdAt: -1 } };
    const sort = sortOptions[req.query.sort] || { popularity: -1, createdAt: -1 };
    const products = await Product.find(filter).sort(sort).limit(100);
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Plat introuvable.' });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Plat introuvable.' });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
