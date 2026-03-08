import { PrismaClient, UserRole, PlanType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@trendomic.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@trendomic.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      plan: PlanType.ENTERPRISE,
      dailyLimit: 1000,
      isActive: true,
    },
  });

  console.log('✅ Admin seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });