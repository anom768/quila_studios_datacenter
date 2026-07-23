const userService = require('../services/userService');
const tokenService = require('../services/tokenService');
const { hashPassword, comparePassword } = require('../utils/password');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ValidationError = require('../errors/ValidationError');

/**
 * Validates credentials and generates a JWT
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<string>} The JWT token
 */
const loginUseCase = async (username, password) => {
  const user = await userService.findByUsername(username);
  
  if (!user) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const token = tokenService.signToken({
    sub: user.id,
    username: user.username,
    role: user.role,
  });

  return token;
};

/**
 * Creates a new user with hashed password
 * @param {Object} data 
 * @returns {Promise<Object>} Created user payload
 */
const registerUseCase = async (data) => {
  const existingUser = await userService.findByUsername(data.username);
  
  if (existingUser) {
    throw new ValidationError('Username already taken');
  }

  const passwordHash = await hashPassword(data.password);
  
  const user = await userService.createUser({
    username: data.username,
    passwordHash,
    role: data.role,
  });

  return user;
};

module.exports = {
  loginUseCase,
  registerUseCase,
};
