const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_SEED_USERNAME || 'admin';
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!password) {
    console.warn('ADMIN_SEED_PASSWORD is not set. Skipping admin seed.');
    return;
  }

  console.log(`Seeding admin user '${username}'...`);

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      role: 'admin',
    },
    create: {
      username,
      passwordHash,
      role: 'admin',
    },
  });

  console.log(`Successfully seeded admin user with ID: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
