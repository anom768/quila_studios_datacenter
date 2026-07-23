const prisma = require('../../src/config/prisma');
const { hashPassword } = require('../../src/utils/password');

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);
  // Add other tables if needed in the future, but auth tests mostly care about users
}

async function createTestUser({ username, password, role }) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      role,
    },
  });
  return user;
}

module.exports = {
  resetDatabase,
  createTestUser,
};
