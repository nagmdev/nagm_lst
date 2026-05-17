import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const email = 'm.abdo@tieapps.com';
  const password = 'password123';

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: 'superadmin',
        isVerified: true,
        status: 'ACTIVE',
        password: await bcrypt.hash(password, 10),
      },
    });
    console.log(`Updated existing user to superadmin: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        password: await bcrypt.hash(password, 10),
        role: 'superadmin',
        isVerified: true,
        status: 'ACTIVE',
      },
    });
    console.log(`Created superadmin user: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

