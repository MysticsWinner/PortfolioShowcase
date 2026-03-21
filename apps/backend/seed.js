const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing securely from .env");

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding Root Administrator Account...");

  // 1. Ensure Roles Exist
  let adminRole = await prisma.role.findUnique({ where: { type: 'ADMIN' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({ data: { type: 'ADMIN' } });
  }

  let viewerRole = await prisma.role.findUnique({ where: { type: 'VIEWER' } });
  if (!viewerRole) {
    viewerRole = await prisma.role.create({ data: { type: 'VIEWER' } });
  }

  // 2. Create Admin Account
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
        isActive: true, // Auto-approve the admin natively
        roleId: adminRole.id,
      }
    });
    console.log(`✅ SUCCESS: Built Administrator: ${email} / ${password}`);
  } else {
    console.log(`⚠️ ALREADY EXISTS: Administrator: ${email}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
