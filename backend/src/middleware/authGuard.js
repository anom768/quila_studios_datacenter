const tokenService = require('../services/tokenService');
const UnauthorizedError = require('../errors/UnauthorizedError');

/**
 * Middleware to protect routes via HTTP-only cookie JWT
 */
const authGuard = (req, res, next) => {
  const token = req.cookies.quila_token;

  if (!token) {
    throw new UnauthorizedError('Not authenticated');
  }

  try {
    const payload = tokenService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    throw new UnauthorizedError('Not authenticated');
  }
};

module.exports = authGuard;
