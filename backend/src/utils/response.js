/**
 * Send standard success response
 * @param {Object} res - Express response object
 * @param {Object|Array} data - Payload data
 * @param {string} [message] - Optional success message
 * @param {number} [statusCode=200] - HTTP status code
 */
const sendSuccess = (res, data = {}, message = undefined, statusCode = 200) => {
  const response = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
};

/**
 * Send standard error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
const sendError = (res, statusCode, message) =>
  res.status(statusCode).json({
    success: false,
    error: message,
  });

module.exports = {
  sendSuccess,
  sendError,
};
