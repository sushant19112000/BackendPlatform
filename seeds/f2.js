const prisma = require('../db/dbConnection')
const hash = require('bcryptjs')


async function main() {
  // Clear existing data
  await prisma.leadsUpload.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.pacing.deleteMany();
  await prisma.campaignInfo.deleteMany();
  await prisma.campaignValidationProfile.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.client.deleteMany();
  await prisma.groupMessage.deleteMany();
  await prisma.userGroups.deleteMany();
  await prisma.group.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.UserOnNotificationSubscribers.deleteMany();
  await prisma.notificationSubscriber.deleteMany();
  await prisma.notificationPriority.deleteMany();
  await prisma.userrole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pacingReport.deleteMany();
  await prisma.campaignReport.deleteMany();

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        password: 'hashed_password_1',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
        password: 'hashed_password_2',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
        password: 'hashed_password_3',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana Prince',
        password: 'hashed_password_4',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'evan@example.com',
        name: 'Evan Wright',
        password: 'hashed_password_5',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create user roles
  const roles = await Promise.all([
    prisma.userrole.create({
      data: {
        name: 'Admin',
        userId: users[0].id,
      },
    }),
    prisma.userrole.create({
      data: {
        name: 'Manager',
        userId: users[1].id,
      },
    }),
    prisma.userrole.create({
      data: {
        name: 'Agent',
        userId: users[2].id,
      },
    }),
    prisma.userrole.create({
      data: {
        name: 'Analyst',
        userId: users[3].id,
      },
    }),
    prisma.userrole.create({
      data: {
        name: 'Viewer',
        userId: users[4].id,
      },
    }),
  ]);

  // Create notification priorities
  const priorities = await Promise.all([
    prisma.notificationPriority.create({
      data: {
        level: 1,
      },
    }),
    prisma.notificationPriority.create({
      data: {
        level: 2,
      },
    }),
    prisma.notificationPriority.create({
      data: {
        level: 3,
      },
    }),
    prisma.notificationPriority.create({
      data: {
        level: 4,
      },
    }),
    prisma.notificationPriority.create({
      data: {
        level: 5,
      },
    }),
  ]);

  // Create notification subscribers
  const subscribers = await Promise.all([
    prisma.notificationSubscriber.create({
      data: {
        name: 'Marketing Team',
      },
    }),
    prisma.notificationSubscriber.create({
      data: {
        name: 'Sales Team',
      },
    }),
    prisma.notificationSubscriber.create({
      data: {
        name: 'Support Team',
      },
    }),
    prisma.notificationSubscriber.create({
      data: {
        name: 'Management',
      },
    }),
    prisma.notificationSubscriber.create({
      data: {
        name: 'Developers',
      },
    }),
  ]);

  // Link users to notification subscribers
  await Promise.all([
    prisma.UserOnNotificationSubscribers.create({
      data: {
        userId: users[0].id,
        notificationSubscriberId: subscribers[0].id,
        assignedAt: new Date(),
      },
    }),
    prisma.UserOnNotificationSubscribers.create({
      data: {
        userId: users[1].id,
        notificationSubscriberId: subscribers[1].id,
        assignedAt: new Date(),
      },
    }),
    prisma.UserOnNotificationSubscribers.create({
      data: {
        userId: users[2].id,
        notificationSubscriberId: subscribers[2].id,
        assignedAt: new Date(),
      },
    }),
    prisma.UserOnNotificationSubscribers.create({
      data: {
        userId: users[3].id,
        notificationSubscriberId: subscribers[3].id,
        assignedAt: new Date(),
      },
    }),
    prisma.UserOnNotificationSubscribers.create({
      data: {
        userId: users[4].id,
        notificationSubscriberId: subscribers[4].id,
        assignedAt: new Date(),
      },
    }),
  ]);

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        message: 'New campaign created',
        notificationSubscriberId: subscribers[0].id,
        notificationPriorityId: priorities[0].id,
        created_at: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        message: 'Lead goal reached',
        notificationSubscriberId: subscribers[1].id,
        notificationPriorityId: priorities[1].id,
        created_at: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        message: 'System maintenance scheduled',
        notificationSubscriberId: subscribers[2].id,
        notificationPriorityId: priorities[2].id,
        created_at: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        message: 'New feature released',
        notificationSubscriberId: subscribers[3].id,
        notificationPriorityId: priorities[3].id,
        created_at: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        message: 'Security alert',
        notificationSubscriberId: subscribers[4].id,
        notificationPriorityId: priorities[4].id,
        created_at: new Date(),
      },
    }),
  ]);

  // Create groups
  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: 'Marketing Team',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Sales Team',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Support Team',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Developers',
      },
    }),
    prisma.group.create({
      data: {
        name: 'Management',
      },
    }),
  ]);

  // Add users to groups
  await Promise.all([
    prisma.userGroups.create({
      data: {
        userId: users[0].id,
        groupId: groups[0].id,
        assignedAt: new Date(),
      },
    }),
    prisma.userGroups.create({
      data: {
        userId: users[1].id,
        groupId: groups[1].id,
        assignedAt: new Date(),
      },
    }),
    prisma.userGroups.create({
      data: {
        userId: users[2].id,
        groupId: groups[2].id,
        assignedAt: new Date(),
      },
    }),
    prisma.userGroups.create({
      data: {
        userId: users[3].id,
        groupId: groups[3].id,
        assignedAt: new Date(),
      },
    }),
    prisma.userGroups.create({
      data: {
        userId: users[4].id,
        groupId: groups[4].id,
        assignedAt: new Date(),
      },
    }),
  ]);

  // Create group messages
  await Promise.all([
    prisma.groupMessage.create({
      data: {
        groupId: groups[0].id,
        body: 'Hello Marketing Team!',
        senderId: users[0].id,
        created_at: new Date(),
      },
    }),
    prisma.groupMessage.create({
      data: {
        groupId: groups[1].id,
        body: 'Sales targets for this month',
        senderId: users[1].id,
        created_at: new Date(),
      },
    }),
    prisma.groupMessage.create({
      data: {
        groupId: groups[2].id,
        body: 'Support tickets update',
        senderId: users[2].id,
        created_at: new Date(),
      },
    }),
    prisma.groupMessage.create({
      data: {
        groupId: groups[3].id,
        body: 'New deployment scheduled',
        senderId: users[3].id,
        created_at: new Date(),
      },
    }),
    prisma.groupMessage.create({
      data: {
        groupId: groups[4].id,
        body: 'Quarterly review meeting',
        senderId: users[4].id,
        created_at: new Date(),
      },
    }),
  ]);

  // Create direct messages
  await Promise.all([
    prisma.message.create({
      data: {
        body: 'Hi Bob, how are you?',
        senderId: users[0].id,
        recipientId: users[1].id,
        created_at: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        body: 'I need help with the campaign',
        senderId: users[1].id,
        recipientId: users[2].id,
        created_at: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        body: 'Can we meet tomorrow?',
        senderId: users[2].id,
        recipientId: users[3].id,
        created_at: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        body: 'The report is ready',
        senderId: users[3].id,
        recipientId: users[4].id,
        created_at: new Date(),
      },
    }),
    prisma.message.create({
      data: {
        body: 'Thanks for your help!',
        senderId: users[4].id,
        recipientId: users[0].id,
        created_at: new Date(),
      },
    }),
  ]);

  // Create clients
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Acme Corp',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Globex',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Soylent',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Initech',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.client.create({
      data: {
        name: 'Umbrella Corp',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create campaigns
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        name: 'Summer Sale 2023',
        clientId: clients[0].id,
        leadgoal: 1000,
        volumeGoals: JSON.stringify({ daily: 50, weekly: 350 }),
        duedate: new Date('2023-08-31'),
        leadTemplate: JSON.stringify({
          fields: ['name', 'email', 'phone'],
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Product Launch',
        clientId: clients[1].id,
        leadgoal: 500,
        volumeGoals: JSON.stringify({ daily: 25, weekly: 175 }),
        duedate: new Date('2023-07-15'),
        leadTemplate: JSON.stringify({
          fields: ['name', 'email', 'company'],
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Holiday Special',
        clientId: clients[2].id,
        leadgoal: 2000,
        volumeGoals: JSON.stringify({ daily: 100, weekly: 700 }),
        duedate: new Date('2023-12-25'),
        leadTemplate: JSON.stringify({
          fields: ['name', 'email', 'interests'],
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'Q4 Promotion',
        clientId: clients[3].id,
        leadgoal: 750,
        volumeGoals: JSON.stringify({ daily: 38, weekly: 266 }),
        duedate: new Date('2023-10-31'),
        leadTemplate: JSON.stringify({
          fields: ['name', 'email', 'position'],
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.campaign.create({
      data: {
        name: 'New Year Campaign',
        clientId: clients[4].id,
        leadgoal: 1500,
        volumeGoals: JSON.stringify({ daily: 75, weekly: 525 }),
        duedate: new Date('2024-01-15'),
        leadTemplate: JSON.stringify({
          fields: ['name', 'email', 'location'],
        }),
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create campaign info
  await Promise.all([
    prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[0].id,
        info: JSON.stringify({
          description: 'Summer promotion for all products',
          budget: 50000,
        }),
        content: JSON.stringify({
          landingPage: 'https://example.com/summer-sale',
          emailTemplate: 'summer-sale-template',
        }),
        filesInfo: JSON.stringify({
          assets: ['banner.jpg', 'flyer.pdf'],
        }),
        updates: JSON.stringify([
          { date: '2023-06-01', note: 'Campaign approved' },
        ]),
      },
    }),
    prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[1].id,
        info: JSON.stringify({
          description: 'Launch of new product line',
          budget: 75000,
        }),
        content: JSON.stringify({
          landingPage: 'https://example.com/new-product',
          emailTemplate: 'product-launch-template',
        }),
        filesInfo: JSON.stringify({
          assets: ['product1.jpg', 'product2.jpg'],
        }),
        updates: JSON.stringify([
          { date: '2023-06-10', note: 'Assets received' },
        ]),
      },
    }),
    prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[2].id,
        info: JSON.stringify({
          description: 'Year-end holiday promotion',
          budget: 100000,
        }),
        content: JSON.stringify({
          landingPage: 'https://example.com/holiday-special',
          emailTemplate: 'holiday-template',
        }),
        filesInfo: JSON.stringify({
          assets: ['holiday-banner.png', 'gift-guide.pdf'],
        }),
        updates: JSON.stringify([
          { date: '2023-11-01', note: 'Campaign approved' },
        ]),
      },
    }),
    prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[3].id,
        info: JSON.stringify({
          description: 'Quarter 4 sales push',
          budget: 60000,
        }),
        content: JSON.stringify({
          landingPage: 'https://example.com/q4-promo',
          emailTemplate: 'q4-promo-template',
        }),
        filesInfo: JSON.stringify({
          assets: ['promo-banner.jpg', 'discount-codes.csv'],
        }),
        updates: JSON.stringify([
          { date: '2023-09-15', note: 'Creative approved' },
        ]),
      },
    }),
    prisma.campaignInfo.create({
      data: {
        campaignId: campaigns[4].id,
        info: JSON.stringify({
          description: 'New Year resolution campaign',
          budget: 80000,
        }),
        content: JSON.stringify({
          landingPage: 'https://example.com/new-year',
          emailTemplate: 'new-year-template',
        }),
        filesInfo: JSON.stringify({
          assets: ['ny-banner.jpg', 'resolution-guide.pdf'],
        }),
        updates: JSON.stringify([
          { date: '2023-12-01', note: 'Campaign approved' },
        ]),
      },
    }),
  ]);

  // Create campaign validation profiles
  await Promise.all([
    prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[0].id,
        validations: JSON.stringify([
          { field: 'email', required: true, type: 'email' },
          { field: 'phone', required: true, type: 'phone' },
        ]),
      },
    }),
    prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[1].id,
        validations: JSON.stringify([
          { field: 'email', required: true, type: 'email' },
          { field: 'company', required: true, type: 'text' },
        ]),
      },
    }),
    prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[2].id,
        validations: JSON.stringify([
          { field: 'email', required: true, type: 'email' },
          { field: 'interests', required: false, type: 'array' },
        ]),
      },
    }),
    prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[3].id,
        validations: JSON.stringify([
          { field: 'email', required: true, type: 'email' },
          { field: 'position', required: false, type: 'text' },
        ]),
      },
    }),
    prisma.campaignValidationProfile.create({
      data: {
        campaignId: campaigns[4].id,
        validations: JSON.stringify([
          { field: 'email', required: true, type: 'email' },
          { field: 'location', required: false, type: 'text' },
        ]),
      },
    }),
  ]);

  // Create pacings
  const pacings = await Promise.all([
    prisma.pacing.create({
      data: {
        campaignId: campaigns[0].id,
        scheduledFor: new Date('2023-07-01'),
        leadGoal: 200,
        volumeName: 'initial',
        status: 'completed',
        actualLeads: 210,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.pacing.create({
      data: {
        campaignId: campaigns[1].id,
        scheduledFor: new Date('2023-07-15'),
        leadGoal: 100,
        volumeName: 'follow-up',
        status: 'active',
        actualLeads: 75,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.pacing.create({
      data: {
        campaignId: campaigns[2].id,
        scheduledFor: new Date('2023-12-01'),
        leadGoal: 500,
        volumeName: 'holiday',
        status: 'scheduled',
        actualLeads: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.pacing.create({
      data: {
        campaignId: campaigns[3].id,
        scheduledFor: new Date('2023-10-01'),
        leadGoal: 150,
        volumeName: 'q4',
        status: 'paused',
        actualLeads: 80,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.pacing.create({
      data: {
        campaignId: campaigns[4].id,
        scheduledFor: new Date('2024-01-01'),
        leadGoal: 300,
        volumeName: 'new-year',
        status: 'scheduled',
        actualLeads: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create leads uploads
  const uploads = await Promise.all([
    prisma.leadsUpload.create({
      data: {
        pacingId: pacings[0].id,
        uploadedBy: users[0].id,
        filename: 'summer_leads.csv',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.leadsUpload.create({
      data: {
        pacingId: pacings[1].id,
        uploadedBy: users[1].id,
        filename: 'product_leads.csv',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.leadsUpload.create({
      data: {
        pacingId: pacings[2].id,
        uploadedBy: users[2].id,
        filename: 'holiday_leads.csv',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.leadsUpload.create({
      data: {
        pacingId: pacings[3].id,
        uploadedBy: users[3].id,
        filename: 'q4_leads.csv',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.leadsUpload.create({
      data: {
        pacingId: pacings[4].id,
        uploadedBy: users[4].id,
        filename: 'newyear_leads.csv',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create leads
  await Promise.all([
    prisma.lead.create({
      data: {
        data: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-123-4567',
        }),
        email: 'john@example.com',
        campaignId: campaigns[0].id,
        uploadId: uploads[0].id,
        uploadType: 'file',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.lead.create({
      data: {
        data: JSON.stringify({
          name: 'Jane Smith',
          email: 'jane@example.com',
          company: 'Acme Inc',
        }),
        email: 'jane@example.com',
        campaignId: campaigns[1].id,
        uploadId: uploads[1].id,
        uploadType: 'file',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.lead.create({
      data: {
        data: JSON.stringify({
          name: 'Mike Johnson',
          email: 'mike@example.com',
          interests: ['sports', 'technology'],
        }),
        email: 'mike@example.com',
        campaignId: campaigns[2].id,
        uploadId: uploads[2].id,
        uploadType: 'file',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.lead.create({
      data: {
        data: JSON.stringify({
          name: 'Sarah Williams',
          email: 'sarah@example.com',
          position: 'Marketing Manager',
        }),
        email: 'sarah@example.com',
        campaignId: campaigns[3].id,
        uploadId: uploads[3].id,
        uploadType: 'file',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
    prisma.lead.create({
      data: {
        data: JSON.stringify({
          name: 'David Brown',
          email: 'david@example.com',
          location: 'New York',
        }),
        email: 'david@example.com',
        campaignId: campaigns[4].id,
        uploadId: uploads[4].id,
        uploadType: 'file',
        created_at: new Date(),
        updated_at: new Date(),
      },
    }),
  ]);

  // Create pacing reports
  await Promise.all([
    prisma.pacingReport.create({
      data: {
        type: 'TODAY',
        data: JSON.stringify([
          {
            campaignId: campaigns[0].id,
            campaignName: campaigns[0].name,
            scheduledFor: pacings[0].scheduledFor,
            leadGoal: pacings[0].leadGoal,
            actualLeads: pacings[0].actualLeads,
            status: pacings[0].status,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
    prisma.pacingReport.create({
      data: {
        type: 'OVERDUE',
        data: JSON.stringify([
          {
            campaignId: campaigns[3].id,
            campaignName: campaigns[3].name,
            scheduledFor: pacings[3].scheduledFor,
            leadGoal: pacings[3].leadGoal,
            actualLeads: pacings[3].actualLeads,
            status: pacings[3].status,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'ADMIN',
      },
    }),
    prisma.pacingReport.create({
      data: {
        type: 'PAUSED',
        data: JSON.stringify([
          {
            campaignId: campaigns[3].id,
            campaignName: campaigns[3].name,
            scheduledFor: pacings[3].scheduledFor,
            leadGoal: pacings[3].leadGoal,
            actualLeads: pacings[3].actualLeads,
            status: pacings[3].status,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
    prisma.pacingReport.create({
      data: {
        type: 'COMPLETED',
        data: JSON.stringify([
          {
            campaignId: campaigns[0].id,
            campaignName: campaigns[0].name,
            scheduledFor: pacings[0].scheduledFor,
            leadGoal: pacings[0].leadGoal,
            actualLeads: pacings[0].actualLeads,
            status: pacings[0].status,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'ADMIN',
      },
    }),
    prisma.pacingReport.create({
      data: {
        type: 'ALL',
        data: JSON.stringify(
          pacings.map((pacing) => ({
            campaignId: pacing.campaignId,
            campaignName: campaigns.find((c) => c.id === pacing.campaignId)?.name,
            scheduledFor: pacing.scheduledFor,
            leadGoal: pacing.leadGoal,
            actualLeads: pacing.actualLeads,
            status: pacing.status,
          }))
        ),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
  ]);

  // Create campaign reports
  await Promise.all([
    prisma.campaignReport.create({
      data: {
        type: 'TODAY',
        data: JSON.stringify([
          {
            campaignId: campaigns[0].id,
            campaignName: campaigns[0].name,
            leadGoal: campaigns[0].leadgoal,
            currentLeads: 210,
            dueLeads: 790,
            dueDate: campaigns[0].duedate,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
    prisma.campaignReport.create({
      data: {
        type: 'OVERDUE',
        data: JSON.stringify([
          {
            campaignId: campaigns[3].id,
            campaignName: campaigns[3].name,
            leadGoal: campaigns[3].leadgoal,
            currentLeads: 80,
            dueLeads: 670,
            dueDate: campaigns[3].duedate,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'ADMIN',
      },
    }),
    prisma.campaignReport.create({
      data: {
        type: 'PAUSED',
        data: JSON.stringify([
          {
            campaignId: campaigns[3].id,
            campaignName: campaigns[3].name,
            leadGoal: campaigns[3].leadgoal,
            currentLeads: 80,
            dueLeads: 670,
            dueDate: campaigns[3].duedate,
          },
        ]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
    prisma.campaignReport.create({
      data: {
        type: 'COMPLETED',
        data: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'ADMIN',
      },
    }),
    prisma.campaignReport.create({
      data: {
        type: 'ALL',
        data: JSON.stringify(
          campaigns.map((campaign) => ({
            campaignId: campaign.id,
            campaignName: campaign.name,
            leadGoal: campaign.leadgoal,
            currentLeads: Math.floor(Math.random() * campaign.leadgoal),
            dueLeads: campaign.leadgoal - Math.floor(Math.random() * campaign.leadgoal),
            dueDate: campaign.duedate,
          }))
        ),
        created_at: new Date(),
        updated_at: new Date(),
        generatedType: 'AUTO',
      },
    }),
  ]);

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
