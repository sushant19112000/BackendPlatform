const prisma = require('../db/dbConnection');

const validationJson = {
  fieldRules: {
    firstName: {
      regex: "^[A-Za-z ,.'-]{2,}$",
      error: "First name must contain at least 2 alphabetic characters",
    },
    lastName: {
      regex: "^[A-Za-z ,.'-]{2,}$",
      error: "Last name must contain at least 2 alphabetic characters",
    },
    email: {
      regex: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      error: "Invalid email format",
    },
    address: {
      regex: "^(?!\\s*$).+",
      error: "Address is required",
    },
    linkedin: {
      regex: "^https:\\/\\/(www\\.)?linkedin\\.com\\/.*$",
      error: "LinkedIn URL must start with https://www.linkedin.com/",
    },
    company: {
      regex: "^[\\w\\s\\-&',.()]{2,}$",
      error: "Company name must be at least 2 characters",
    },
    title: {
      regex: "^[A-Za-z0-9 ,.'-/]{2,}$",
      error: "Job title must be at least 2 characters",
    },
    country: {
      regex: "^[A-Za-z ,.'-]{2,}$",
      error: "Invalid country name",
    },
    uploadType: {
      regex: "^(manual|automated)$",
      error: "Upload type must be 'manual' or 'automated'",
    },
  },
  valueRules: [
    {
      mode: "exclusion",
      fieldNames: ["email"],
      values: ["gmail.com", "yahoo.com", "tempmail.com"],
      scope: "global",
      error: "Email domain is excluded",
    },
    {
      mode: "inclusion",
      fieldNames: ["email"],
      values: ["regionalpartner.com"],
      scope: "global",
      error: "Email domain is not a regional partner",
    },
    {
      mode: "inclusion",
      fieldNames: ["title"],
      values: ["CIO", "CISO", "Security Director"],
      scope: "SASE SHW UKI",
      error: "Job title is not valid for SASE SHW UKI",
    },
    {
      mode: "inclusion",
      fieldNames: ["title"],
      values: ["Compliance Manager", "Network Architect"],
      scope: "SASE PAB NORDICS",
      error: "Job title is not valid for SASE PAB NORDICS",
    },
    {
      mode: "inclusion",
      fieldNames: ["industry"],
      values: ["Technology", "Finance"],
      scope: "SASE SHW UKI",
      error: "Industry is not valid for SASE SHW UKI",
    },
    {
      mode: "inclusion",
      fieldNames: ["industry"],
      values: ["Healthcare", "Energy"],
      scope: "SASE PAB NORDICS",
      error: "Industry is not valid for SASE PAB NORDICS",
    },
    {
      mode: "inclusion",
      fieldNames: ["country"],
      values: ["United Kingdom", "Ireland"],
      scope: "SASE SHW UKI",
      error: "Country is not valid for SASE SHW UKI",
    },
    {
      mode: "inclusion",
      fieldNames: ["country"],
      values: ["Sweden", "Norway", "Finland"],
      scope: "SASE PAB NORDICS",
      error: "Country is not valid for SASE PAB NORDICS",
    },
    {
      mode: "inclusion",
      fieldNames: ["employeeSize"],
      values: ["100-500", "500-1000"],
      scope: "SASE SHW UKI",
      error: "Employee size is not valid for SASE SHW UKI",
    },
    {
      mode: "inclusion",
      fieldNames: ["employeeSize"],
      values: ["1000-5000", "5000+"],
      scope: "SASE PAB NORDICS",
      error: "Employee size is not valid for SASE PAB NORDICS",
    },
  ],
};

async function main() {
  // Clear existing data to avoid conflicts
  await prisma.$executeRaw`DELETE FROM sqlite_sequence;`; // Reset auto-increment IDs
  await prisma.userNotificationLink.deleteMany({});
  await prisma.notificationGroupLink.deleteMany({});
  await prisma.subscriberGroupUser.deleteMany({});
  await prisma.notificationSubscriberGroup.deleteMany({});
  await prisma.groupMessage.deleteMany({});
  await prisma.userGroups.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.notificationPriority.deleteMany({});
  await prisma.pacingReport.deleteMany({});
  await prisma.campaignReport.deleteMany({});
  await prisma.leadsUpload.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.pacing.deleteMany({});
  await prisma.campaignValidationProfile.deleteMany({});
  await prisma.campaignInfo.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.userrole.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed roles (10 records)
  const rolesData = Array.from({ length: 10 }, (_, i) => ({
    name: `role${i + 1}`,
  }));
  const roles = await Promise.all(
    rolesData.map((role) => prisma.role.create({ data: role }))
  );

  // Seed users (15 records)
  const usersData = Array.from({ length: 15 }, (_, i) => ({
    email: `user${i + 1}@regionalpartner.com`,
    name: `User ${i + 1}`,
    password: `hashedpassword${i + 1}`,
  }));
  const users = await Promise.all(
    usersData.map((user, i) =>
      prisma.user.create({
        data: {
          ...user,
          roles: { create: [{ roleId: roles[i % roles.length].id }] },
        },
      })
    )
  );

  // Seed clients (10 records)
  const clientsData = Array.from({ length: 10 }, (_, i) => ({
    name: `Client ${i + 1}`,
    created_at: new Date(),
    updated_at: new Date(),
  }));
  const clients = await Promise.all(
    clientsData.map((client) => prisma.client.create({ data: client }))
  );

  // Seed campaigns (12 records)
  const campaignsData = Array.from({ length: 12 }, (_, i) => ({
    id: 101 + i,
    name: `Campaign ${i + 1}`,
    clientId: clients[i % clients.length].id,
    leadgoal: 100 + i * 10,
    volumeGoals: { global: 100 + i * 10 },
    duedate: new Date(`2025-05-${10 + i}`),
    leadTemplate: {
      fields: [
        'firstName',
        'lastName',
        'email',
        'title',
        'company',
        'address',
        'linkedin',
        'country',
        'industry',
        'employeeSize',
      ],
    },
    created_at: new Date(),
    updated_at: new Date(),
  }));
  const campaigns = await Promise.all(
    campaignsData.map((campaign) => prisma.campaign.create({ data: campaign }))
  );

  // Seed pacing (15 records)
  const pacingData = Array.from({ length: 15 }, (_, i) => {
    const day = String(1 + (i % 28)).padStart(2, '0'); // Days 01-28
    const hour = String(9 + (i % 12)).padStart(2, '0'); // Hours 09-20
    return {
      id: i + 1,
      campaignId: campaigns[i % campaigns.length].id,
      scheduledFor: new Date(`2025-04-${day}T${hour}:00:00Z`),
      leadGoal: 30 + (i % 30),
      status: ['scheduled', 'active', 'completed', 'paused'][i % 4],
      actualLeads: Math.min(30 + (i % 30), i * 2),
      volumeName: `volume${i % 5}`,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
  const pacings = await Promise.all(
    pacingData.map((pacing) => prisma.pacing.create({ data: pacing }))
  );

  // Seed leadsUpload (10 records)
  const uploadedFiles = Array.from({ length: 10 }, (_, i) => ({
    name: `Leads_File_${i + 1}.csv`,
    date: new Date(`2025-04-${String(5 + (i % 25)).padStart(2, '0')}T${String(8 + (i % 12)).padStart(2, '0')}:30:00Z`),
  }));
  const leadsUploads = await Promise.all(
    uploadedFiles.map((file, i) =>
      prisma.leadsUpload.create({
        data: {
          pacingId: pacings[i % pacings.length].id,
          uploadedBy: users[i % users.length].id,
          filename: file.name,
          created_at: file.date,
          updated_at: file.date,
        },
      })
    )
  );

  // Seed leads (20 records)
  const allLeads = Array.from({ length: 20 }, (_, i) => {
    const scope = i < 10 ? 'SASE SHW UKI' : 'SASE PAB NORDICS';
    return {
      id: i + 1,
      data: {
        firstName: `First${i + 1}`,
        lastName: `Last${i + 1}`,
        title:
          scope === 'SASE SHW UKI'
            ? ['CIO', 'CISO', 'Security Director'][i % 3]
            : ['Compliance Manager', 'Network Architect'][i % 2],
        company: `Company ${i + 1}`,
        address: `${100 + i} Street, City ${i + 1}`,
        linkedin: `https://www.linkedin.com/in/user${i + 1}`,
        country:
          scope === 'SASE SHW UKI'
            ? ['United Kingdom', 'Ireland'][i % 2]
            : ['Sweden', 'Norway', 'Finland'][i % 3],
        industry:
          scope === 'SASE SHW UKI'
            ? ['Technology', 'Finance'][i % 2]
            : ['Healthcare', 'Energy'][i % 2],
        employeeSize:
          scope === 'SASE SHW UKI'
            ? ['100-500', '500-1000'][i % 2]
            : ['1000-5000', '5000+'][i % 2],
      },
      email: `lead${i + 1}@regionalpartner.com`,
      campaignId: campaigns[i % campaigns.length].id,
      uploadId: i < 15 ? leadsUploads[i % leadsUploads.length].id : null,
      uploadType: i < 15 ? 'manual' : 'automated',
      created_at: new Date(`2025-04-${String(7 + (i % 3)).padStart(2, '0')}T${String(10 + (i % 5)).padStart(2, '0')}:00:00Z`),
      updated_at: new Date(`2025-04-${String(7 + (i % 3)).padStart(2, '0')}T${String(10 + (i % 5)).padStart(2, '0')}:00:00Z`),
    };
  });
  await Promise.all(
    allLeads.map((lead) => prisma.lead.create({ data: lead }))
  );

  // Seed notification priorities (10 records)
  const prioritiesData = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
  }));
  const priorities = await Promise.all(
    prioritiesData.map((priority) =>
      prisma.notificationPriority.create({ data: priority })
    )
  );

  // Seed notifications (15 records)
  const notificationsData = Array.from({ length: 15 }, (_, i) => ({
    message: `Notification ${i + 1} for campaign`,
    notificationPriorityId: priorities[i % priorities.length].id,
    createdAt: new Date(),
  }));
  const notifications = await Promise.all(
    notificationsData.map((notification) =>
      prisma.notification.create({ data: notification })
    )
  );

  // Seed groups (10 records)
  const groupsData = Array.from({ length: 10 }, (_, i) => ({
    name: `Group ${i + 1}`,
  }));
  const groups = await Promise.all(
    groupsData.map((group) => prisma.group.create({ data: group }))
  );

  // Seed userGroups (15 records)
  const userGroupsData = Array.from({ length: 15 }, (_, i) => ({
    userId: users[i % users.length].id,
    groupId: groups[i % groups.length].id,
    assignedAt: new Date(),
  }));
  await Promise.all(
    userGroupsData.map((ug) => prisma.userGroups.create({ data: ug }))
  );

  // Seed group messages (12 records)
  const groupMessagesData = Array.from({ length: 12 }, (_, i) => ({
    groupId: groups[i % groups.length].id,
    body: `Group message ${i + 1}`,
    senderId: users[i % users.length].id,
    created_at: new Date(),
  }));
  await Promise.all(
    groupMessagesData.map((msg) =>
      prisma.groupMessage.create({ data: msg })
    )
  );

  // Seed messages (12 records)
  const messagesData = Array.from({ length: 12 }, (_, i) => ({
    body: `Direct message ${i + 1}`,
    senderId: users[i % users.length].id,
    recipientId: users[(i + 1) % users.length].id,
    created_at: new Date(),
  }));
  await Promise.all(
    messagesData.map((msg) => prisma.message.create({ data: msg }))
  );

  // Seed notification subscriber groups (10 records)
  const subscriberGroupsData = Array.from({ length: 10 }, (_, i) => ({
    name: `SubscriberGroup ${i + 1}`,
  }));
  const subscriberGroups = await Promise.all(
    subscriberGroupsData.map((sg) =>
      prisma.notificationSubscriberGroup.create({ data: sg })
    )
  );

  // Seed subscriber group users (15 records)
  const subscriberGroupUsersData = Array.from({ length: 15 }, (_, i) => ({
    subscriberGroupId: subscriberGroups[i % subscriberGroups.length].id,
    userId: users[i % users.length].id,
  }));
  await Promise.all(
    subscriberGroupUsersData.map((sgu) =>
      prisma.subscriberGroupUser.create({ data: sgu })
    )
  );

  // Seed notification group links (12 records)
  const notificationGroupLinksData = Array.from({ length: 12 }, (_, i) => ({
    subscriberGroupId: subscriberGroups[i % subscriberGroups.length].id,
    notificationId: notifications[i % notifications.length].id,
    assignedAt: new Date(),
  }));
  await Promise.all(
    notificationGroupLinksData.map((ngl) =>
      prisma.notificationGroupLink.create({ data: ngl })
    )
  );

  // Seed user notification links (15 records)
  const userNotificationLinksData = Array.from({ length: 15 }, (_, i) => ({
    userId: users[i % users.length].id,
    notificationId: notifications[i % notifications.length].id,
    isRead: i % 2 === 0,
    deliveredAt: new Date(),
    notificationSubscriberGroupId: subscriberGroups[i % subscriberGroups.length].id,
  }));
  await Promise.all(
    userNotificationLinksData.map((unl) =>
      prisma.userNotificationLink.create({ data: unl })
    )
  );

  // Seed campaign info (10 records)
  const campaignInfoData = Array.from({ length: 10 }, (_, i) => ({
    campaignId: campaigns[i % campaigns.length].id,
    info: { description: `Info for campaign ${i + 1}` },
    content: { details: `Content ${i + 1}` },
    filesInfo: { count: i + 1 },
    updates: { lastUpdate: new Date().toISOString() },
  }));
  await Promise.all(
    campaignInfoData.map((ci) => prisma.campaignInfo.create({ data: ci }))
  );

  // Seed campaign validation profiles (10 records)
  const validationProfilesData = Array.from({ length: 10 }, (_, i) => ({
    campaignId: campaigns[i % campaigns.length].id,
    validations: validationJson,
  }));
  await Promise.all(
    validationProfilesData.map((vp) =>
      prisma.campaignValidationProfile.create({ data: vp })
    )
  );

  // Seed pacing reports (10 records)
  const pacingReportsData = Array.from({ length: 10 }, (_, i) => ({
    type: 'ALL',
    data: [{ pacingId: pacings[i % pacings.length].id, leads: i * 5 }],
    created_at: new Date(),
    updated_at: new Date(),
    generatedType: 'AUTO',
  }));
  await Promise.all(
    pacingReportsData.map((pr) => prisma.pacingReport.create({ data: pr }))
  );

  // Seed campaign reports (10 records)
  const campaignReportsData = Array.from({ length: 10 }, (_, i) => ({
    type: 'ALL',
    data: [
      {
        campaignId: campaigns[i % campaigns.length].id,
        campaignName: campaigns[i % campaigns.length].name,
        leadGoal: campaigns[i % campaigns.length].leadgoal,
        currentLeads: allLeads.length,
        dueLeads: campaigns[i % campaigns.length].leadgoal - allLeads.length,
        dueDate: campaigns[i % campaigns.length].duedate.toISOString(),
      },
    ],
    created_at: new Date(),
    updated_at: new Date(),
    generatedType: 'AUTO',
  }));
  await Promise.all(
    campaignReportsData.map((cr) => prisma.campaignReport.create({ data: cr }))
  );

  console.log('Database seeded successfully with 10-20 records per table and lead validation rules applied!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });