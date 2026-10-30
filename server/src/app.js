require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured.');
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
