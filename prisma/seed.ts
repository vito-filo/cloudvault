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
      id: '588ba40d-08b1-4877-a769-4a83661009cb',
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
      id: 'd1e862f3c-d251-41ec-bd96-62d59e570a4c',
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
      id: 'e2e862f3c-d251-41ec-bd96-62d59e570a4c',
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
      id: 'f3e862f3c-d251-41ec-bd96-62d59e570a4c',
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
      id: 'g4e862f3c-d251-41ec-bd96-62d59e570a4c',
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
      id: 'h5e862f3c-d251-41ec-bd96-62d59e570a4c',
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
