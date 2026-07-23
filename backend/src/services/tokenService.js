const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Signs a JWT payload
 * @param {Object} payload 
 * @returns {string}
 */
const signToken = (payload) => jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

/**
 * Verifies a JWT token
 * @param {string} token 
 * @returns {Object}
 */
const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

module.exports = {
  signToken,
  verifyToken,
};
