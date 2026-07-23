const AppError = require('../errors/AppError');
const { sendError } = require('../utils/response');
const config = require('../config');

/**
 * Global Express error handling middleware
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  // Handle unexpected or internal errors
  const statusCode = err.statusCode || 500;
  
  let message = err.message || 'Internal Server Error';
  if (statusCode === 500 && config.env === 'production') {
    message = 'Internal Server Error';
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
