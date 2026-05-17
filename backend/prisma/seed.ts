// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // Wipe in FK-safe order. Yes, it’s tedious. So is data integrity.
  await prisma.aTSResult.deleteMany();
  await prisma.answerRevision.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.deepSeekInteraction.deleteMany();
  await prisma.question.deleteMany();
  await prisma.position.deleteMany();
  await prisma.leadershipPrinciple.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Users (kept simple; your auth can fight me later)
  await prisma.user.createMany({
    data: [
      {
        id: 'user1',
        email: 'user1@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      },
      {
        id: 'admin1',
        email: 'm.abdo@tieapps.com',
        password: hashedPassword,
        role: 'admin',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '0987654321',
      },
      {
        id: 'user2',
        email: 'user2@example.com',
        password: hashedPassword,
        role: 'user',
        firstName: 'Alice',
        lastName: 'Smith',
        phone: '1122334455',
      },
    ],
  });
  console.log('Seeded 3 users');

  // 10 companies, real-enough to not embarrass you in a demo
  const companiesData = [
    { name: 'Tech Innovators', website: 'https://techinnovators.com', careerSiteUrl: 'https://techinnovators.com/careers', status: 'active' },
    { name: 'Green Solutions', website: 'https://greensolutions.com', careerSiteUrl: 'https://greensolutions.com/careers', status: 'active' },
    { name: 'Health First', website: 'https://healthfirst.com', careerSiteUrl: 'https://healthfirst.com/careers', status: 'active' },
    { name: 'EduSmart', website: 'https://edusmart.com', careerSiteUrl: 'https://edusmart.com/careers', status: 'active' },
    { name: 'FinTech Pro', website: 'https://fintechpro.com', careerSiteUrl: 'https://fintechpro.com/careers', status: 'active' },
    { name: 'Urban Mobility Labs', website: 'https://urbanmobilitylabs.com', careerSiteUrl: 'https://urbanmobilitylabs.com/careers', status: 'active' },
    { name: 'CloudForge', website: 'https://cloudforge.dev', careerSiteUrl: 'https://cloudforge.dev/careers', status: 'active' },
    { name: 'Retail Nexus', website: 'https://retailnexus.co', careerSiteUrl: 'https://retailnexus.co/careers', status: 'active' },
    { name: 'Aquila Cyber', website: 'https://aquilacyber.com', careerSiteUrl: 'https://aquilacyber.com/careers', status: 'active' },
    { name: 'AgriSense', website: 'https://agrisense.ai', careerSiteUrl: 'https://agrisense.ai/careers', status: 'active' },
  ];
  await prisma.company.createMany({ data: companiesData });
  console.log('Seeded 10 companies');

  const companies = await prisma.company.findMany();

  // 10 leadership principles per company. Yes, they’re familiar. They work.
  const PRINCIPLES = [
    { name: 'Customer Obsession', description: 'Start with the customer and work backwards.' },
    { name: 'Ownership', description: 'Act on behalf of the entire company.' },
    { name: 'Invent and Simplify', description: 'Seek out new ideas and simplify.' },
    { name: 'Are Right, A Lot', description: 'Strong judgment and good instincts.' },
    { name: 'Learn and Be Curious', description: 'Never stop learning.' },
    { name: 'Hire and Develop the Best', description: 'Raise the performance bar.' },
    { name: 'Insist on the Highest Standards', description: 'Relentlessly high standards.' },
    { name: 'Think Big', description: 'Create and communicate a bold direction.' },
    { name: 'Bias for Action', description: 'Speed matters in business.' },
    { name: 'Earn Trust', description: 'Listen attentively, speak candidly, treat others respectfully.' },
  ];

  for (const company of companies) {
    await prisma.leadershipPrinciple.createMany({
      data: PRINCIPLES.map(p => ({
        name: p.name,
        description: p.description,
        companyId: company.id,
      })),
    });
  }
  console.log('Seeded 10 leadership principles per company');

  // Optional: a couple positions per company so your UI doesn’t look empty
  for (const company of companies) {
    await prisma.position.createMany({
      data: [
        { title: 'Software Engineer', companyId: company.id },
        { title: 'Product Manager', companyId: company.id },
      ],
    });
  }
  console.log('Seeded positions for each company');

  // Fetch principles grouped by company for mapping
  const allPrinciples = await prisma.leadershipPrinciple.findMany();

  // 20 realistic interview questions
  const QUESTION_BANK = [
    'Tell me about a time you turned vague requirements into a shipped feature.',
    'Describe a situation where you defended the user experience against competing priorities.',
    'Give an example of a high-impact decision you made with incomplete data.',
    'Tell me about a time you reduced operational toil through automation.',
    'Describe a conflict on your team and how you resolved it.',
    'Tell me about the biggest bug you shipped and what you changed afterward.',
    'Describe a time you influenced stakeholders without formal authority.',
    'Tell me about a project where you radically simplified a complex system.',
    'Describe a time you mentored someone and how you measured their growth.',
    'Tell me about a time you raised the quality bar and met resistance.',
    'Describe a time you challenged a popular opinion and were right.',
    'Tell me about a time you learned a new domain quickly to unblock progress.',
    'Describe a time you delivered under an unrealistic deadline.',
    'Tell me about a time you decomposed a monolith or large module safely.',
    'Describe a time you handled an on-call incident end-to-end.',
    'Tell me about a time you identified a KPI that changed product direction.',
    'Describe a time you balanced short-term hacks with long-term architecture.',
    'Tell me about a time you dealt with misaligned expectations from leadership.',
    'Describe a time you built something that scaled 10x without rewrites.',
    'Tell me about a time you earned back a customer’s trust after a failure.',
  ];

  // Create exactly 20 questions total, each mapped to a random company and one of its principles
  const questionData = QUESTION_BANK.map(text => {
    const company = pickRandom(companies);
    const companyPrinciples = allPrinciples.filter(p => p.companyId === company.id);
    const lp = pickRandom(companyPrinciples);
    return {  
      text,
      companyName: company.name,
      leadershipPrincipleName: lp.name,
      // If your enum only accepts 'BEHAVIORAL', keep it. You’re welcome.
      questionType: 'BEHAVIORAL' as const,
    };
  });

  await prisma.question.createMany({ data: questionData });
  console.log('Seeded 20 questions total');

  // Toss in a couple STAR answers so your UI has something to render
  const questions = await prisma.question.findMany({ take: 3 });
  await prisma.answer.createMany({
    data: [
      {
        situation: 'Critical checkout bug triggered timeouts during peak traffic.',
        task: 'Restore reliability within 48 hours and prevent recurrence.',
        action: 'Rolled back, added circuit breaker, wrote load tests, set SLOs.',
        result: 'Error rate down 96%, no regressions in 3 months.',
        userId: 'user1',
        questionId: questions[0]?.id,
      },
      {
        situation: 'Customer churn spiked for SMB segment.',
        task: 'Identify root cause and reduce churn by 20%.',
        action: 'Interviewed users, simplified onboarding, added in-app guides.',
        result: 'Churn down 27% over two quarters.',
        userId: 'admin1',
        questionId: questions[1]?.id,
      },
      {
        situation: 'Release process blocked teams weekly.',
        task: 'Cut release lead time by half.',
        action: 'Implemented trunk-based dev, CI pipelines, and feature flags.',
        result: 'Lead time from 5 days to 2; deployments daily.',
        userId: 'user2',
        questionId: questions[2]?.id,
      },
    ].filter(a => a.questionId), // in case take:3 returns fewer than 3, calm down.
  });
  console.log('Seeded sample answers');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
