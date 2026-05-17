import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Checking database...\n');

    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
      take: 10,
    });
    console.log('👥 Users in database:');
    if (users.length === 0) {
      console.log('  (none)');
    } else {
      users.forEach((u) => console.log(`  - ${u.email} (role: ${u.role})`));
    }

    const jobs = await prisma.job.findMany({
      select: { id: true, title: true, createdBy: true, status: true },
      take: 10,
    });
    console.log('\n💼 Jobs in database:');
    if (jobs.length === 0) {
      console.log('  (none)');
    } else {
      jobs.forEach((j) => console.log(`  - ID ${j.id}: ${j.title} (status: ${j.status})`));
    }

    const apps = await prisma.application.findMany({
      select: { id: true, jobId: true, candidateId: true, status: true },
      take: 10,
    });
    console.log('\n📋 Applications in database:');
    if (apps.length === 0) {
      console.log('  (none)');
    } else {
      apps.forEach((a) => console.log(`  - ID ${a.id}: Job ${a.jobId}, Candidate ${a.candidateId}, Status: ${a.status}`));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
