const mongoose = require('mongoose');

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');
}

module.exports = connectDatabase;
