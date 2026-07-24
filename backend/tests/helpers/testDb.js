const prisma = require('../../src/config/prisma');
const { hashPassword } = require('../../src/utils/password');

async function resetDatabase() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users", "staff", "staff_id_counters" RESTART IDENTITY CASCADE`);
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

async function createTestStaff(data) {
  // Mirrors the staffId generation logic in staffService.createStaff,
  // implemented directly here so test fixtures don't depend on the API layer.
  return prisma.$transaction(async (tx) => {
    let prefix = 'QS';
    if (data.employmentType === 'Internship') {
      prefix = 'IN';
    }

    const counter = await tx.staffIdCounter.upsert({
      where: { prefix },
      update: { lastSequence: { increment: 1 } },
      create: { prefix, lastSequence: 1 },
    });

    const sequenceString = String(counter.lastSequence).padStart(3, '0');
    const staffId = `${prefix}${sequenceString}`;

    const staff = await tx.staff.create({
      data: {
        staffId,
        ...data
      },
    });

    return staff;
  });
}

module.exports = {
  resetDatabase,
  createTestUser,
  createTestStaff,
};
