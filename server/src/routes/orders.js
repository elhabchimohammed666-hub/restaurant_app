const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const orderStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'cancelled'];

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, fulfillment, deliveryAddress, payment, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !['delivery', 'pickup'].includes(fulfillment)) {
      return res.status(400).json({ message: 'Articles et mode de commande valides requis.' });
    }

    if (fulfillment === 'delivery' && (!deliveryAddress?.street || !deliveryAddress?.city || !deliveryAddress?.postalCode)) {
      return res.status(400).json({ message: 'Une adresse complète est requise pour la livraison.' });
    }
    if (!['card', 'cash'].includes(payment?.method || 'card')) {
      return res.status(400).json({ message: 'Mode de paiement invalide.' });
    }

    if (items.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
      return res.status(400).json({ message: 'Un article de la commande est invalide.' });
    }

    const safeItems = [];
    for (const item of items) {
      const requestedOptions = item.selectedOptions || [];
      if (typeof item.product !== 'string'
        || !mongoose.isValidObjectId(item.product)
        || !Number.isInteger(item.quantity)
        || item.quantity < 1
        || item.quantity > 50
        || !Array.isArray(requestedOptions)
        || requestedOptions.some((selected) => !selected
          || typeof selected.group !== 'string'
          || typeof selected.option !== 'string'
          || !mongoose.isValidObjectId(selected.group)
          || !mongoose.isValidObjectId(selected.option))) {
        return res.status(400).json({ message: 'Un article de la commande est invalide.' });
      }
    }

    const products = await Product.find({
      _id: { $in: [...new Set(items.map((item) => item.product))] },
      isAvailable: true,
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const item of items) {
      const requestedOptions = item.selectedOptions || [];
      const product = productsById.get(item.product);
      if (!product) {
        return res.status(400).json({ message: 'Un plat de la commande est indisponible.' });
      }
      const selectedOptions = [];
      if (new Set(requestedOptions.map((selected) => `${selected.group}:${selected.option}`)).size !== requestedOptions.length) {
        return res.status(400).json({ message: `Option répétée pour ${product.name}.` });
      }
      for (const selected of requestedOptions) {
        const group = product.optionGroups.id(selected.group);
        const option = group?.options.id(selected.option);
        if (!group || !option) {
          return res.status(400).json({ message: `Option invalide pour ${product.name}.` });
        }
        selectedOptions.push({
          groupName: group.name,
          optionName: option.name,
          priceCents: option.priceCents,
        });
      }
      for (const group of product.optionGroups) {
        const selectedCount = requestedOptions.filter((selected) => String(selected.group) === String(group.id)).length;
        const minimum = group.required ? Math.max(1, group.minChoices) : group.minChoices;
        if (selectedCount < minimum || selectedCount > group.maxChoices) {
          return res.status(400).json({ message: `Nombre de choix invalide pour ${group.name}.` });
        }
      }
      safeItems.push({
        product: product.id,
        name: product.name,
        quantity: item.quantity,
        selectedOptions,
        unitPriceCents: product.priceCents + selectedOptions.reduce((sum, option) => sum + option.priceCents, 0),
      });
    }
    const subtotalCents = safeItems.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
    const deliveryFeeCents = fulfillment === 'delivery' ? 300 : 0;
    const order = await Order.create({
      customer: req.user.id,
      items: safeItems,
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : undefined,
      payment: { method: payment?.method || 'card' },
      subtotalCents,
      deliveryFeeCents,
      totalCents: subtotalCents + deliveryFeeCents,
      notes,
    });
    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.get('/', requireAuth, requireRole('admin', 'delivery'), async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(100);
    return res.json({ orders });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', requireAuth, requireRole('admin', 'delivery'), async (req, res, next) => {
  try {
    if (!orderStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Statut de commande invalide.' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' });
    return res.json({ order });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
