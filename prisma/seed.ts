// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Example seeding for a User table
  await prisma.user.createMany({
    data: [
      {
        name: 'Alice',
        email: 'alice@example.com',
        provider: 'Cognito',
        providerId: '123456678',
        userConfirmed: true,
      },
      {
        name: 'Bob',
        email: 'bob@example.com',
        provider: 'Cognito',
        providerId: '123456679',
        userConfirmed: true,
      },
      {
        name: 'Fartington',
        email: 'fertemupsa@gufum.com',
        provider: 'Cognito',
        providerId: '123456612',
        userConfirmed: true,
      },
    ],
  });

  // await prisma.password.createMany({
  //   data: [
  //     {
  //       userId: 1,
  //       url: 'google.com',
  //       serviceName: 'Google',
  //       username: 'Alice',
  //       email: 'alice@example.com',
  //       password: 'password123',
  //       description: 'My Google account',
  //     },
  //     {
  //       userId: 1,
  //       url: 'facebook.com',
  //       serviceName: 'Facebook',
  //       username: 'AliceFB',
  //       email: 'alice.fb@example.com',
  //       password: 'fbpassword123',
  //       description: 'My Facebook account',
  //     },
  //     {
  //       userId: 2,
  //       url: 'twitter.com',
  //       serviceName: 'Twitter',
  //       username: 'BobTw',
  //       email: 'bob.tw@example.com',
  //       password: 'twpassword456',
  //       description: 'My Twitter account',
  //     },
  //     {
  //       userId: 2,
  //       url: 'linkedin.com',
  //       serviceName: 'LinkedIn',
  //       username: 'BobLinkedIn',
  //       email: 'bob.linkedin@example.com',
  //       password: 'linkedin789',
  //       description: 'My LinkedIn account',
  //     },
  //     {
  //       userId: 1,
  //       url: 'github.com',
  //       serviceName: 'GitHub',
  //       username: 'AliceGH',
  //       email: 'alice.gh@example.com',
  //       password: 'ghpassword321',
  //       description: 'My GitHub account',
  //     },
  //   ],
  // });
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
