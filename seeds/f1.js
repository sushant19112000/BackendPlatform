// prisma/seed.ts
const prisma = require('../db/dbConnection')
const hash = require('bcryptjs')

async function main() {
  // Seed Users
  const password = await hash.hash('password123', 12);
  const users = await prisma.user.createMany({
    data: [
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password,
      },
      {
        email: 'manager@example.com',
        name: 'Manager User',
        password,
      },
      {
        email: 'agent1@example.com',
        name: 'Agent One',
        password,
      },
      {
        email: 'agent2@example.com',
        name: 'Agent Two',
        password,
      },
      {
        email: 'client@example.com',
        name: 'Client User',
        password,
      },
    ]
  });

  // Seed User Roles
  const userRoles = await prisma.userrole.createMany({
    data: [
      { name: 'ADMIN', userId: 1 },
      { name: 'MANAGER', userId: 2 },
      { name: 'AGENT', userId: 3 },
      { name: 'AGENT', userId: 4 },
      { name: 'CLIENT', userId: 5 },
    ],
   
  });

  // Seed Clients
  const clients = await prisma.client.createMany({
    data: [
      { name: 'Tech Corp' },
      { name: 'Finance LLC' },
      { name: 'Health Systems' },
      { name: 'Edu Solutions' },
      { name: 'Retail Group' },
    ],
   
  });

  // Seed Campaigns
  const campaigns = await prisma.campaign.createMany({
    data: [
      {
        name: 'Tech Hiring Q1',
        clientId: 1,
        leadgoal: 1000,
        volumeGoals: JSON.stringify({ weekly: 250, daily: 50 }),
        duedate: new Date('2023-03-31'),
        campaignValidationProfileCheck: 'basic',
      },
      {
        name: 'Financial Advisors',
        clientId: 2,
        leadgoal: 500,
        volumeGoals: JSON.stringify({ weekly: 100, daily: 20 }),
        duedate: new Date('2023-04-15'),
      },
      {
        name: 'Healthcare Summit',
        clientId: 3,
        leadgoal: 800,
        volumeGoals: JSON.stringify({ weekly: 200, daily: 40 }),
        duedate: new Date('2023-05-01'),
      },
      {
        name: 'Education Conference',
        clientId: 4,
        leadgoal: 600,
        volumeGoals: JSON.stringify({ weekly: 150, daily: 30 }),
        duedate: new Date('2023-05-15'),
      },
      {
        name: 'Retail Expansion',
        clientId: 5,
        leadgoal: 1200,
        volumeGoals: JSON.stringify({ weekly: 300, daily: 60 }),
        duedate: new Date('2023-06-30'),
      },
    ],
   
  });

  // Seed Campaign Infos
  const campaignInfos = await prisma.campaignInfo.createMany({
    data: [
      {
        campaignId: 1,
        info: JSON.stringify({ industry: 'Technology', targetRoles: ['Developer', 'Engineer'] }),
        content: JSON.stringify({ emailTemplate: 'tech_template_1', callScript: 'tech_script_1' }),
        filesInfo: JSON.stringify({ attachments: ['profile.pdf', 'offer.docx'] }),
        updates: JSON.stringify([{ date: new Date(), note: 'Initial setup' }]),
      },
      {
        campaignId: 2,
        info: JSON.stringify({ industry: 'Finance', targetRoles: ['Advisor', 'Analyst'] }),
        content: JSON.stringify({ emailTemplate: 'finance_template_1', callScript: 'finance_script_1' }),
        filesInfo: JSON.stringify({ attachments: ['brochure.pdf'] }),
        updates: JSON.stringify([{ date: new Date(), note: 'Initial setup' }]),
      },
      {
        campaignId: 3,
        info: JSON.stringify({ industry: 'Healthcare', targetRoles: ['Doctor', 'Administrator'] }),
        content: JSON.stringify({ emailTemplate: 'health_template_1', callScript: 'health_script_1' }),
        filesInfo: JSON.stringify({ attachments: ['agenda.pdf', 'speakers.docx'] }),
        updates: JSON.stringify([{ date: new Date(), note: 'Initial setup' }]),
      },
      {
        campaignId: 4,
        info: JSON.stringify({ industry: 'Education', targetRoles: ['Teacher', 'Principal'] }),
        content: JSON.stringify({ emailTemplate: 'edu_template_1', callScript: 'edu_script_1' }),
        filesInfo: JSON.stringify({ attachments: ['program.pdf'] }),
        updates: JSON.stringify([{ date: new Date(), note: 'Initial setup' }]),
      },
      {
        campaignId: 5,
        info: JSON.stringify({ industry: 'Retail', targetRoles: ['Manager', 'Buyer'] }),
        content: JSON.stringify({ emailTemplate: 'retail_template_1', callScript: 'retail_script_1' }),
        filesInfo: JSON.stringify({ attachments: ['catalog.pdf', 'pricing.xlsx'] }),
        updates: JSON.stringify([{ date: new Date(), note: 'Initial setup' }]),
      },
    ],
   
  });

  // Seed Campaign Validation Profiles
  const campaignValidationProfiles = await prisma.campaignValidationProfile.createMany({
    data: [
      {
        campaignId: 1,
        validations: JSON.stringify({ email: true, linkedin: true, company: true }),
      },
      {
        campaignId: 2,
        validations: JSON.stringify({ email: true, linkedin: false, company: true }),
      },
      {
        campaignId: 3,
        validations: JSON.stringify({ email: true, linkedin: true, company: false }),
      },
      {
        campaignId: 4,
        validations: JSON.stringify({ email: true, linkedin: false, company: false }),
      },
      {
        campaignId: 5,
        validations: JSON.stringify({ email: true, linkedin: true, company: true }),
      },
    ],
   
  });

  // Seed Pacings
  const pacings = await prisma.pacing.createMany({
    data: [
      {
        campaignId: 1,
        scheduledFor: new Date('2023-03-01'),
        leadGoal: 50,
        status: 'completed',
        actualLeads: 52,
      },
      {
        campaignId: 1,
        scheduledFor: new Date('2023-03-02'),
        leadGoal: 50,
        status: 'completed',
        actualLeads: 48,
      },
      {
        campaignId: 2,
        scheduledFor: new Date('2023-03-01'),
        leadGoal: 20,
        status: 'active',
        actualLeads: 15,
      },
      {
        campaignId: 3,
        scheduledFor: new Date('2023-03-05'),
        leadGoal: 40,
        status: 'scheduled',
      },
      {
        campaignId: 4,
        scheduledFor: new Date('2023-03-10'),
        leadGoal: 30,
        status: 'paused',
      },
    ],
   
  });

  // Seed Leads Uploads
  const leadsUploads = await prisma.leadsUpload.createMany({
    data: [
      {
        pacingId: 1,
        uploadedBy: 3,
        filename: 'tech_leads_0301.csv',
      },
      {
        pacingId: 1,
        uploadedBy: 3,
        filename: 'tech_leads_0301_2.csv',
      },
      {
        pacingId: 2,
        uploadedBy: 4,
        filename: 'finance_leads_0301.csv',
      },
      {
        pacingId: 3,
        uploadedBy: 3,
        filename: 'health_leads_0305.csv',
      },
      {
        pacingId: 4,
        uploadedBy: 4,
        filename: 'edu_leads_0310.csv',
      },
    ],
   
  });

  // Seed Leads
  const leads = await prisma.lead.createMany({
    data: [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@tech.com',
        address: '123 Tech St, San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        company: 'Tech Corp',
        title: 'Senior Developer',
        country: 'USA',
        campaignId: 1,
        uploadId: 1,
        uploadType: 'file',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@finance.com',
        address: '456 Finance Ave, New York, NY',
        linkedin: 'linkedin.com/in/janesmith',
        company: 'Finance LLC',
        title: 'Financial Advisor',
        country: 'USA',
        campaignId: 2,
        uploadId: 3,
        uploadType: 'file',
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@health.com',
        address: '789 Health Blvd, Chicago, IL',
        linkedin: 'linkedin.com/in/mikejohnson',
        company: 'Health Systems',
        title: 'Doctor',
        country: 'USA',
        campaignId: 3,
        uploadId: 4,
        uploadType: 'file',
      },
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.williams@edu.com',
        address: '321 Education Lane, Boston, MA',
        linkedin: 'linkedin.com/in/sarahwilliams',
        company: 'Edu Solutions',
        title: 'Principal',
        country: 'USA',
        campaignId: 4,
        uploadId: 5,
        uploadType: 'file',
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@retail.com',
        address: '654 Retail Road, Seattle, WA',
        linkedin: 'linkedin.com/in/davidbrown',
        company: 'Retail Group',
        title: 'Store Manager',
        country: 'USA',
        campaignId: 5,
        uploadType: 'manual',
      },
    ],
   
  });

  // Seed Groups
  const groups = await prisma.group.createMany({
    data: [
      { name: 'Admin Team' },
      { name: 'Sales Team' },
      { name: 'Support Team' },
      { name: 'Marketing Team' },
      { name: 'Client Team' },
    ],
   
  });

  // Seed User Groups
  const userGroups = await prisma.userGroups.createMany({
    data: [
      { userId: 1, groupId: 1 },
      { userId: 2, groupId: 1 },
      { userId: 3, groupId: 2 },
      { userId: 4, groupId: 2 },
      { userId: 5, groupId: 5 },
    ],
   
  });

  // Seed Group Messages
  const groupMessages = await prisma.groupMessage.createMany({
    data: [
      {
        groupId: 1,
        body: 'Welcome to the admin team!',
        senderId: 1,
      },
      {
        groupId: 2,
        body: 'Sales meeting at 2pm',
        senderId: 2,
      },
      {
        groupId: 1,
        body: 'New campaign guidelines',
        senderId: 2,
      },
      {
        groupId: 2,
        body: 'Targets for this week',
        senderId: 3,
      },
      {
        groupId: 5,
        body: 'Client feedback received',
        senderId: 5,
      },
    ],
   
  });

  // Seed Messages
  const messages = await prisma.message.createMany({
    data: [
      {
        body: 'Hello, how are you?',
        senderId: 1,
        recipientId: 2,
      },
      {
        body: 'Please review the campaign',
        senderId: 2,
        recipientId: 3,
        read_at: new Date(),
      },
      {
        body: 'Leads uploaded successfully',
        senderId: 3,
        recipientId: 2,
      },
      {
        body: 'Client meeting scheduled',
        senderId: 2,
        recipientId: 5,
      },
      {
        body: 'Need more information',
        senderId: 5,
        recipientId: 2,
      },
    ],
   
  });

  // Seed Notification Priorities
  const notificationPriorities = await prisma.notificationPriority.createMany({
    data: [
      { level: 1 }, // Critical
      { level: 2 }, // High
      { level: 3 }, // Medium
      { level: 4 }, // Low
      { level: 5 }, // Info
    ],
   
  });

  // Seed Notification Subscribers
  const notificationSubscribers = await prisma.notificationSubscriber.createMany({
    data: [
      { name: 'Campaign Updates' },
      { name: 'System Alerts' },
      { name: 'Lead Notifications' },
      { name: 'Pacing Alerts' },
      { name: 'Client Messages' },
    ],
   
  });

  // Seed User Notification Subscribers
  const userNotificationSubscribers = await prisma.UserOnNotificationSubscribers.createMany({
    data: [
      { userId: 1, notificationSubscriberId: 1 },
      { userId: 1, notificationSubscriberId: 2 },
      { userId: 2, notificationSubscriberId: 1 },
      { userId: 3, notificationSubscriberId: 3 },
      { userId: 4, notificationSubscriberId: 3 },
    ],
   
  });

  // Seed Notifications
  const notifications = await prisma.notification.createMany({
    data: [
      {
        message: 'New leads uploaded to Tech Hiring Q1',
        notificationSubscriberId: 1,
        notificationPriorityId: 3,
      },
      {
        message: 'System maintenance scheduled',
        notificationSubscriberId: 2,
        notificationPriorityId: 2,
      },
      {
        message: 'Pacing goal not met for Financial Advisors',
        notificationSubscriberId: 4,
        notificationPriorityId: 2,
      },
      {
        message: 'New message from client',
        notificationSubscriberId: 5,
        notificationPriorityId: 3,
      },
      {
        message: 'Campaign Healthcare Summit completed',
        notificationSubscriberId: 1,
        notificationPriorityId: 4,
      },
    ],
   
  });

  // Seed Pacing Reports
  const pacingReports = await prisma.pacingReport.createMany({
    data: [
      {
        type: 'TODAY',
        data: JSON.stringify([
          { campaignId: 1, campaignName: 'Tech Hiring Q1', leadGoal: 50, actualLeads: 52 },
          { campaignId: 2, campaignName: 'Financial Advisors', leadGoal: 20, actualLeads: 15 },
        ]),
        generatedType: 'AUTO',
      },
      {
        type: 'OVERDUE',
        data: JSON.stringify([
          { campaignId: 2, campaignName: 'Financial Advisors', leadGoal: 20, actualLeads: 15, daysOverdue: 2 },
        ]),
        generatedType: 'ADMIN',
      },
      {
        type: 'ALL',
        data: JSON.stringify([
          { campaignId: 1, campaignName: 'Tech Hiring Q1', leadGoal: 1000, actualLeads: 100, status: 'active' },
          { campaignId: 2, campaignName: 'Financial Advisors', leadGoal: 500, actualLeads: 15, status: 'active' },
        ]),
        generatedType: 'ADMIN',
      },
      {
        type: 'COMPLETED',
        data: JSON.stringify([
          { campaignId: 3, campaignName: 'Healthcare Summit', leadGoal: 800, actualLeads: 800, completionDate: new Date() },
        ]),
        generatedType: 'AUTO',
      },
      {
        type: 'PAUSED',
        data: JSON.stringify([
          { campaignId: 4, campaignName: 'Education Conference', leadGoal: 600, actualLeads: 300, pauseDate: new Date() },
        ]),
        generatedType: 'AUTO',
      },
    ],
   
  });

  // Seed Campaign Reports
  const campaignReports = await prisma.campaignReport.createMany({
    data: [
      {
        type: 'TODAY',
        data: JSON.stringify([
          { campaignId: 1, campaignName: 'Tech Hiring Q1', leadGoal: 1000, currentLeads: 100, dueLeads: 900, dueDate: '2023-03-31' },
        ]),
        generatedType: 'AUTO',
      },
      {
        type: 'OVERDUE',
        data: JSON.stringify([
          { campaignId: 2, campaignName: 'Financial Advisors', leadGoal: 500, currentLeads: 15, dueLeads: 485, dueDate: '2023-04-15', daysOverdue: 5 },
        ]),
        generatedType: 'ADMIN',
      },
      {
        type: 'ALL',
        data: JSON.stringify([
          { campaignId: 1, campaignName: 'Tech Hiring Q1', leadGoal: 1000, currentLeads: 100, dueLeads: 900, dueDate: '2023-03-31' },
          { campaignId: 2, campaignName: 'Financial Advisors', leadGoal: 500, currentLeads: 15, dueLeads: 485, dueDate: '2023-04-15' },
        ]),
        generatedType: 'ADMIN',
      },
      {
        type: 'COMPLETED',
        data: JSON.stringify([
          { campaignId: 3, campaignName: 'Healthcare Summit', leadGoal: 800, currentLeads: 800, dueLeads: 0, dueDate: '2023-05-01', completionDate: new Date() },
        ]),
        generatedType: 'AUTO',
      },
      {
        type: 'PAUSED',
        data: JSON.stringify([
          { campaignId: 4, campaignName: 'Education Conference', leadGoal: 600, currentLeads: 300, dueLeads: 300, dueDate: '2023-05-15', pauseDate: new Date() },
        ]),
        generatedType: 'AUTO',
      },
    ],
   
  });

  console.log({
    users,
    userRoles,
    clients,
    campaigns,
    campaignInfos,
    campaignValidationProfiles,
    pacings,
    leadsUploads,
    leads,
    groups,
    userGroups,
    groupMessages,
    messages,
    notificationPriorities,
    notificationSubscribers,
    userNotificationSubscribers,
    notifications,
    pacingReports,
    campaignReports,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });