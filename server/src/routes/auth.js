const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Nom, e-mail et mot de passe de 8 caractères minimum requis.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, phone });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'E-mail et mot de passe requis.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

module.exports = router;
