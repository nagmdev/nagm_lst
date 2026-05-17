import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error('Usage: ts-node scripts/makeAdmin.ts <email>');
    process.exit(1);
  }

  const email = emailArg.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`User ${email} is already admin.`);
      } else {
        const updated = await prisma.user.update({ where: { email }, data: { role: 'admin' } });
        console.log(`Promoted ${updated.email} to admin.`);
      }
      return;
    }

    const tempPassword = 'AdminTemp#123';
    const hashed = await bcrypt.hash(tempPassword, 10);
    const created = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashed,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
      },
    });
    console.log(`Created admin ${created.email} with temporary password: ${tempPassword}`);
  } catch (e: any) {
    console.error('Failed to set admin:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


