import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      permissions: ['users:read', 'users:write', 'schedules:*', 'analytics:*', 'compute:*', 'integrations:*'],
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      permissions: ['schedules:read', 'schedules:write', 'analytics:read', 'compute:*'],
    },
  });

  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@trendomic.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@trendomic.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      roleId: adminRole.id,
    },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
