const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');
const errorHandler = require('./middleware/errorHandler');
const NotFoundError = require('./errors/NotFoundError');

const app = express();

app.set('trust proxy', 1);

// Core Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);

// Serve uploaded photos statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Handle unknown routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
