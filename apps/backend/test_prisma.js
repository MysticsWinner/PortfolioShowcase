const { PrismaClient } = require('@prisma/client');

async function test() {
  try {
    const prisma = new PrismaClient({
      accelerateUrl: process.env.DATABASE_URL || "postgresql://postgres:Tanmay%40123@localhost:5432/portfolio"
    });
    await prisma.$connect();
    const count = await prisma.user.count();
    console.log("SUCCESS, user count:", count);
    process.exit(0);
  } catch(err) {
    console.log("FAIL", err.stack);
    process.exit(1);
  }
}
test();
