const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/checkUser.js <email>');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  console.log(user);
}

main().finally(async () => {
  await prisma.$disconnect();
});

