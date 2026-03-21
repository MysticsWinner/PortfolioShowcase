const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Tanmay%40123@localhost:5432/portfolio";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("=== DATABASE STATE ===");

  const roles = await prisma.role.findMany();
  console.log("\n--- ROLES ---");
  console.log(roles);

  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log("\n--- USERS ---");
  users.forEach(u => {
    console.log(`ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Active: ${u.isActive} | Role: ${u.role?.type}`);
  });

  const portfolios = await prisma.portfolio.findMany();
  console.log("\n--- PORTFOLIOS ---");
  console.log(portfolios);

  console.log("======================");
  await prisma.$disconnect();
}

main().catch(console.error);
