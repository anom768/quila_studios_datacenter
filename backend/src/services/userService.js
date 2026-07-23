const prisma = require('../config/prisma');

/**
 * Finds a user by username
 * @param {string} username 
 * @returns {Promise<Object|null>}
 */
const findByUsername = async (username) => prisma.user.findUnique({
    where: { username },
  });

/**
 * Creates a new user
 * @param {Object} data 
 * @param {string} data.username
 * @param {string} data.passwordHash
 * @param {string} data.role
 * @returns {Promise<Object>}
 */
const createUser = async (data) => prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

module.exports = {
  findByUsername,
  createUser,
};
