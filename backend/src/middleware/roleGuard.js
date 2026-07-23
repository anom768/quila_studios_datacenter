const ForbiddenError = require('../errors/ForbiddenError');

/**
 * Middleware factory to restrict routes by role
 * @param  {...string} allowedRoles 
 * @returns {Function}
 */
const roleGuard = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ForbiddenError('Insufficient permissions');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };

module.exports = roleGuard;
