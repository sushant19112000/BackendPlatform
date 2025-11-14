const prisma = require('../db/dbConnection')
const bcrypt = require('bcryptjs');
const faker = require('@faker-js/faker').faker;



async function main() {
  // Clear existing data
  await prisma.userNotificationLink.deleteMany();
  await prisma.userGroups.deleteMany();
  await prisma.leadsUpload.deleteMany();
  await prisma.pacing.deleteMany();
  await prisma.campaignValidationProfile.deleteMany();
  await prisma.campaignInfo.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.userrole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPriority.deleteMany();
  await prisma.notificationSubscriber.deleteMany();
  await prisma.groupMessage.deleteMany();
  await prisma.group.deleteMany();
  await prisma.message.deleteMany();
  await prisma.campaignReport.deleteMany();
  await prisma.pacingReport.deleteMany();
  await prisma.user.deleteMany();

  // Seed Roles
  const roles = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      return prisma.role.create({
        data: {
          name: i === 0 ? 'admin' : `role_${i + 1}`,
        },
      });
    })
  );

  // Seed Users
  const users = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          password: await bcrypt.hash('password123', 10),
          roles: {
            create: {
              roleId: roles[Math.floor(Math.random() * roles.length)].id,
            },
          },
        },
      });
    })
  );

  // Seed Notification Priorities
  const priorities = await Promise.all(
    Array.from({ length: 10 }, async (_, i) => {
      return prisma.notificationPriority.create({
        data: {
          level: i + 1,
        },
      });
    })
  );

  // Seed Notification Subscribers
  const subscribers = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.notificationSubscriber.create({
        data: {
          name: faker.company.name(),
        },
      });
    })
  );

  // Seed Notifications
  const notifications = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.notification.create({
        data: {
          message: faker.lorem.sentence(),
          notificationPriorityId: priorities[Math.floor(Math.random() * priorities.length)].id,
        },
      });
    })
  );

  // Seed User Notification Links
  for (let i = 0; i < 10; i++) {
    await prisma.userNotificationLink.create({
      data: {
        userId: users[Math.floor(Math.random() * users.length)].id,
        subscriberId: subscribers[Math.floor(Math.random() * subscribers.length)].id,
        notificationId: notifications[Math.floor(Math.random() * notifications.length)].id,
      },
    });
  }

  // Seed Groups
  const groups = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.group.create({
        data: {
          name: faker.lorem.word(),
        },
      });
    })
  );

  // Seed User Groups
  for (let i = 0; i < 10; i++) {
    await prisma.userGroups.create({
      data: {
        userId: users[Math.floor(Math.random() * users.length)].id,
        groupId: groups[Math.floor(Math.random() * groups.length)].id,
      },
    });
  }

  // Seed Messages
  for (let i = 0; i < 10; i++) {
    await prisma.message.create({
      data: {
        body: faker.lorem.paragraph(),
        senderId: users[Math.floor(Math.random() * users.length)].id,
        recipientId: users[Math.floor(Math.random() * users.length)].id,
      },
    });
  }

  // Seed Group Messages
  for (let i = 0; i < 10; i++) {
    await prisma.groupMessage.create({
      data: {
        groupId: groups[Math.floor(Math.random() * groups.length)].id,
        body: faker.lorem.paragraph(),
        senderId: users[Math.floor(Math.random() * users.length)].id,
      },
    });
  }

  // Seed Clients
  const clients = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.client.create({
        data: {
          name: faker.company.name(),
        },
      });
    })
  );

  // Seed Campaigns
  const campaigns = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.campaign.create({
        data: {
          name: `${faker.company.buzzNoun()} ${faker.company.buzzVerb()}`,
          clientId: clients[Math.floor(Math.random() * clients.length)].id,
          leadgoal: faker.number.int({ min: 100, max: 1000 }),
          volumeGoals: { global: faker.number.int({ min: 50, max: 500 }) },
          duedate: faker.date.future(),
          leadTemplate: { fields: ['email', 'name'] },
        },
      });
    })
  );

  // Seed Campaign Info
  for (let i = 0; i < 10; i++) {
    await prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[i].id,
        info: { description: faker.lorem.paragraph() },
        content: { text: faker.lorem.paragraphs() },
        filesInfo: { count: faker.number.int({ min: 1, max: 5 }) },
        updates: { lastUpdate: faker.date.recent().toISOString() },
      },
    });
  }

  // Seed Campaign Validation Profiles
  for (let i = 0; i < 10; i++) {
    await prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[i].id,
        validations: { requiredFields: ['email'] },
      },
    });
  }

  // Seed Pacings
  const pacings = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.pacing.create({
        data: {
          campaignId: campaigns[Math.floor(Math.random() * campaigns.length)].id,
          scheduledFor: faker.date.future(),
          leadGoal: faker.number.int({ min: 10, max: 100 }),
          volumeName: 'global',
          status: 'scheduled',
        },
      });
    })
  );

  // Seed Leads Uploads
  const uploads = await Promise.all(
    Array.from({ length: 10 }, async () => {
      return prisma.leadsUpload.create({
        data: {
          pacingId: pacings[Math.floor(Math.random() * pacings.length)].id,
          uploadedBy: users[Math.floor(Math.random() * users.length)].id,
          filename: faker.system.fileName(),
        },
      });
    })
  );

  // Seed Leads
  for (let i = 0; i < 10; i++) {
    await prisma.lead.create({
      data: {
        data: { name: faker.person.fullName() },
        email: faker.internet.email(),
        campaignId: campaigns[Math.floor(Math.random() * campaigns.length)].id,
        uploadId: uploads[Math.floor(Math.random() * uploads.length)].id,
        uploadType: 'manual',
      },
    });
  }

  // Seed Campaign Reports
  for (let i = 0; i < 10; i++) {
    await prisma.campaignReport.create({
      data: {
        type: 'ALL',
        data: [{
          campaignId: campaigns[i].id,
          campaignName: campaigns[i].name,
          leadGoal: campaigns[i].leadgoal,
          currentLeads: faker.number.int({ min: 0, max: campaigns[i].leadgoal }),
          dueLeads: faker.number.int({ min: 0, max: campaigns[i].leadgoal }),
          dueDate: campaigns[i].duedate.toISOString(),
        }],
        generatedType: 'AUTO',
      },
    });
  }

  // Seed Pacing Reports
  for (let i = 0; i < 10; i++) {
    await prisma.pacingReport.create({
      data: {
        type: 'TODAY',
        data: [{
          pacingId: pacings[i].id,
          leadGoal: pacings[i].leadGoal,
          actualLeads: faker.number.int({ min: 0, max: pacings[i].leadGoal }),
        }],
        generatedType: 'AUTO',
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });