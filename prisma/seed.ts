/**
 * Database Seed Script for AIRM-IP
 * Creates test organization and users for each role
 *
 * Run with: npx prisma db seed
 */

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedFrameworks } from './seed-frameworks';

const prisma = new PrismaClient();

// Test password for all seed users (change in production!)
const TEST_PASSWORD = 'Test@123456';

// Test users for each role
const TEST_USERS = [
  {
    email: 'admin@airm-ip.local',
    name: 'Admin User',
    role: UserRole.ADMIN,
  },
  {
    email: 'riskmanager@airm-ip.local',
    name: 'Risk Manager',
    role: UserRole.RISK_MANAGER,
  },
  {
    email: 'assessor@airm-ip.local',
    name: 'Risk Assessor',
    role: UserRole.ASSESSOR,
  },
  {
    email: 'auditor@airm-ip.local',
    name: 'Compliance Auditor',
    role: UserRole.AUDITOR,
  },
  {
    email: 'viewer@airm-ip.local',
    name: 'Report Viewer',
    role: UserRole.VIEWER,
  },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create or get test organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'airm-ip-demo' },
    update: {},
    create: {
      name: 'AIRM-IP Demo Organization',
      slug: 'airm-ip-demo',
      settings: {
        defaultLanguage: 'en',
        enabledFrameworks: ['NIST_AI_RMF', 'ISO_42001'],
      },
    },
  });

  console.log(`✅ Organization: ${organization.name} (${organization.id})`);

  // Hash password once for all users
  const passwordHash = await hashPassword(TEST_PASSWORD);

  // Create test users
  console.log('\n📝 Creating test users...\n');

  for (const userData of TEST_USERS) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        role: userData.role,
        passwordHash,
      },
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        passwordHash,
        emailVerified: new Date(),
        organizationId: organization.id,
      },
    });

    console.log(`  ✅ ${user.role.padEnd(12)} | ${user.email}`);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('🎉 Seed completed successfully!\n');
  console.log('📋 Test Credentials:');
  console.log(`   Password: ${TEST_PASSWORD}`);
  console.log('   Emails:');
  TEST_USERS.forEach(u => console.log(`     - ${u.email}`));
  console.log('\n' + '─'.repeat(50));

  // Seed frameworks
  await seedFrameworks();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
