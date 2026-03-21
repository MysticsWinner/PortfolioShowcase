const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  console.log('--- 1. Wiping Postgres Database Matrix ---');
  try {
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
    console.log('\n✅ Database wiped and re-synchronized from schema successfully!\n');
  } catch (error) {
    console.error('CRITICAL: Failed to reset database.', error);
    process.exit(1);
  }

  console.log('--- 2. Building Root Administrator ---');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing securely from .env");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  let adminRole = await prisma.role.findUnique({ where: { type: 'ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { type: 'ADMIN' } });
  }

  let viewerRole = await prisma.role.findUnique({ where: { type: 'VIEWER' } });
  if (!viewerRole) {
    viewerRole = await prisma.role.create({ data: { type: 'VIEWER' } });
  }

  const email = "admin@example.com";
  const password = "admin_secure_password";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "System Administrator",
        email: email,
        password: hashedPassword,
        isActive: true, 
        roleId: adminRole.id,
      }
    });
    console.log(`✅ SUCCESS: Administrator initialized: ${email} // ${password}`);
  }

  await prisma.$disconnect();
  console.log('\n🚀 Reset Utility Completed Successfully.');
}

main().catch(console.error);
