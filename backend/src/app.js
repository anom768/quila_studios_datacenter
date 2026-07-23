const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const errorHandler = require('./middleware/errorHandler');
const NotFoundError = require('./errors/NotFoundError');

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);

// Handle unknown routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
