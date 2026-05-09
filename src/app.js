require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

console.log('INIT: Loading routes...');
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AL-Usama-Import and Export System API' });
});

const healthRoutes = require('./routes/health');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/health', healthRoutes);

console.log('INIT: Loading business routes...');
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const orderRoutes = require('./routes/orderRoutes');
const financeRoutes = require('./routes/financeRoutes');
const auditRoutes = require('./routes/auditRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const customsRoutes = require('./routes/customsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/customs', customsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);
console.log('INIT: App routes configured.');

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  if (err.stack) console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
