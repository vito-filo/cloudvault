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
  const bob = await prisma.user.create({
    data: {
      id: 'c3c8d716-225b-499b-bd16-582036a2942e',
      name: 'Bob',
      email: 'bob@example.com',
      provider: 'Cognito',
      providerId: '123456789',
      userConfirmed: true,
    },
  });
  await prisma.user.create({
    data: {
      id: '34707e24-c31a-4060-b9b2-b75814855e61',
      name: 'Charlie',
      email: 'charlie@example.com',
      provider: 'Cognito',
      providerId: '123456790',
      userConfirmed: true,
    },
  });
  await prisma.user.create({
    data: {
      id: '01b60717-8251-4968-ade1-10bc1ccc6874',
      name: 'Dave',
      email: 'dave@example.com',
      provider: 'Cognito',
      providerId: '123456791',
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

  // GitHub password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '1b71e8b8-4a19-472c-a315-a1f6be24a094',
      url: 'https://github.com',
      serviceName: 'GitHub',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonGitHubPass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My GitHub account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Twitter password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '1c69c175-d4e2-42b6-bc05-a318e2505f21',
      url: 'https://twitter.com',
      serviceName: 'Twitter',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonTwitterPass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Twitter account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // OpenAI password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: 'dab0b865-938b-4cfa-8a68-a4b15bdb3763',
      url: 'https://openai.com',
      serviceName: 'OpenAI',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonOpenAIPass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My OpenAI account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Microsoft password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: 'dcfbde84-ca6c-45f3-a391-2c7181c86ea5',
      url: 'https://microsoft.com',
      serviceName: 'Microsoft',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonMicrosoftPass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Microsoft account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Apple password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '6a8620dc-e151-4521-8881-c11e85e5e47a',
      url: 'https://apple.com',
      serviceName: 'Apple',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonApplePass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Apple account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // Amazon password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: '0a6c8cae-7c20-409f-aa68-3c58eadefc3d',
      url: 'https://amazon.com',
      serviceName: 'Amazon',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonAmazonPass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My Amazon account',
      owner: { connect: { id: fartington.id } },
    },
  });

  // YouTube password for Fartington
  iv = generateIV();
  await prisma.password.create({
    data: {
      id: 'aa1fd964-50d9-4b90-b189-de264cf67c44',
      url: 'https://youtube.com',
      serviceName: 'YouTube',
      username: fartington.name,
      email: fartington.email,
      password: encrypt('FartingtonYouTubePass!', key, iv),
      iv: iv.toString('hex'),
      description: 'My YouTube account',
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
          { user: { connect: { id: bob.id } }, isAdmin: false },
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
