// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { generateIV, encrypt } from '../src/common/utils/crypto.util';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  // Example seeding for a User table

  const key = Buffer.from(
    process.env.AES_KEY || '0123456789abcdef0123456789abcdef', // 32 bytes for AES-256
    'hex',
  );

  const fartington = await prisma.user.create({
    data: {
      id: '1e862f3c-d251-41ec-bd96-62d59e570a4c',
      name: 'Fartington',
      email: 'fertemupsa@gufum.com',
      provider: 'Cognito',
      providerId: '123456612',
      userConfirmed: true,
    },
  });
  const alice = await prisma.user.create({
    data: {
      id: '8c537fed-aa7c-4d6b-8a36-1815dceb68b4',
      name: 'Alice',
      email: 'alice@example.com',
      provider: 'Cognito',
      providerId: '123456678',
      userConfirmed: true,
    },
  });

  // Google passowrd for Fartington
  let iv = generateIV();
  await prisma.password.create({
    data: {
      id: '7951f8f5-95b2-44d3-807b-d35080d2b13a',
      url: 'https://google.com',
      serviceName: 'Google',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('ExamplePassword123!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Google account',
      owner: { connect: { id: fartington.id } },
    },
  });
  // Facebook password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '05ba29e5-2d37-4f31-b1b1-9654737f89a0',
      url: 'https://facebook.com',
      serviceName: 'Facebook',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('AnotherPassword456!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Facebook account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Twitter password for Alice
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '3d6eed35-3a60-4be5-a965-7478702f8c2f',
      url: 'https://twitter.com',
      serviceName: 'Twitter',
      username: alice.name,
      email: alice.email,
      password: encrypt('AliceTwitterPass789!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Twitter account',
      owner: { connect: { id: alice.id } },
    },
  });

  // Netflix password for Family
  iv = generateIV();
  const netflixFamily = await prisma.password.create({
    data: {
      id: '0e8429ce-5811-4f2d-a357-fa9a2ab1e493',
      url: 'https://netflix.com',
      serviceName: 'Netflix',
      username: 'FamilyAccount',
      email: 'family@email.com',
      password: encrypt('FamilyNetflixPass123!', key, iv),
      iv: iv.toString('hex'),
      description: 'Family Netflix account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Group Family for Fartington and Alice
  await prisma.group.create({
    data: {
      id: 'af1c66b2-af96-4bce-85fd-b11c40db511f',
      name: 'Family',
      description: 'Group for family members',
      createdBy: { connect: { id: fartington.id } },
      members: {
        create: [
          { user: { connect: { id: fartington.id } }, isAdmin: true },
          { user: { connect: { id: alice.id } }, isAdmin: false },
        ],
      },
      sharedPasswords: {
        create: [
          {
            password: { connect: { id: netflixFamily.id } },
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
