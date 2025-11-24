-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkIn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT NOT NULL DEFAULT 'default',
    CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserLeave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "leaveType" TEXT NOT NULL,
    "fromDate" DATETIME NOT NULL,
    "toDate" DATETIME NOT NULL,
    "duration" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserLeave_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserLeave_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TEXT NOT NULL DEFAULT 'startTime',
    "latestLogged" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TEXT NOT NULL DEFAULT 'endTime',
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER,
    "breakId" INTEGER,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "UserTask" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_breakId_fkey" FOREIGN KEY ("breakId") REFERENCES "UserBreak" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    "assignedById" INTEGER NOT NULL,
    CONSTRAINT "UserTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTask_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBreak" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "breakId" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL,
    CONSTRAINT "UserBreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserBreak_breakId_fkey" FOREIGN KEY ("breakId") REFERENCES "Break" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "typeId" INTEGER,
    "status" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "reassigned" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Break" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "body" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" DATETIME,
    CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "groupMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "groupId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" DATETIME,
    CONSTRAINT "groupMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "groupMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "userGroups" (
    "userId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "groupId"),
    CONSTRAINT "userGroups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "userGroups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "message" TEXT NOT NULL,
    "notificationPriorityId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "notification_notificationPriorityId_fkey" FOREIGN KEY ("notificationPriorityId") REFERENCES "notificationPriority" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificationPriority" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL DEFAULT 'user'
);

-- CreateTable
CREATE TABLE "roleNotification" (
    "roleId" INTEGER NOT NULL,
    "notificationId" INTEGER NOT NULL,

    PRIMARY KEY ("roleId", "notificationId"),
    CONSTRAINT "roleNotification_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "roleNotification_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "userrole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "userrole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "userrole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "client" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "leadgoal" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL,
    "pending" INTEGER NOT NULL,
    "duedate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "info" JSONB NOT NULL,
    "additionalInfo" TEXT NOT NULL DEFAULT 'default info',
    "descriptionOfFilesAttached" TEXT NOT NULL DEFAULT 'default des',
    "content" JSONB NOT NULL,
    "filesInfo" JSONB NOT NULL,
    "updates" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    CONSTRAINT "campaign_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campaignDeliveries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignId" INTEGER NOT NULL DEFAULT 6,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileName" TEXT NOT NULL DEFAULT 'default_delivery_file.xlsx',
    "submitted" INTEGER NOT NULL DEFAULT 0,
    "accepted" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "rejections" INTEGER NOT NULL DEFAULT 0,
    "uploaderId" INTEGER,
    "data" TEXT NOT NULL DEFAULT 'data',
    CONSTRAINT "campaignDeliveries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "campaignDeliveries_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "campaignType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "volume" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "leadGoal" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "pending" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "validationProfile" JSONB NOT NULL,
    "headers" JSONB NOT NULL,
    "leadTemplate" TEXT NOT NULL DEFAULT 'template',
    "externalRules" TEXT NOT NULL DEFAULT 'externalRules',
    CONSTRAINT "volume_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "arrivedOn" DATETIME NOT NULL,
    "arrivedOnTime" TEXT NOT NULL DEFAULT 'HH:MM',
    "dueTime" TEXT NOT NULL DEFAULT 'HH:MM',
    "due" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "leadDetails" JSONB,
    "leadDetailsSection" TEXT NOT NULL DEFAULT 'section',
    "type" TEXT NOT NULL DEFAULT 'LEADGEN',
    "quotes" JSONB,
    "campaignId" INTEGER,
    "remark" TEXT,
    "briefHyperlink" TEXT
);

-- CreateTable
CREATE TABLE "BriefUpdates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "briefId" INTEGER NOT NULL,
    "arrivedOn" DATETIME NOT NULL,
    "due" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "leadDetails" JSONB,
    "type" TEXT NOT NULL DEFAULT 'LEADGEN',
    "quotes" JSONB,
    "campaignId" INTEGER,
    "remark" TEXT,
    "briefHyperlink" TEXT,
    CONSTRAINT "BriefUpdates_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pacing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "volumeId" INTEGER NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "leadGoal" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "actualLeads" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pacing_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "data" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "pacingId" INTEGER NOT NULL,
    "volumeId" INTEGER NOT NULL,
    "uploadId" INTEGER,
    "uploadType" TEXT NOT NULL DEFAULT 'manual',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "phase1Validation" BOOLEAN NOT NULL DEFAULT false,
    "leadTemplateValidation" BOOLEAN NOT NULL DEFAULT false,
    "campaignDeliveryId" INTEGER,
    "accepted" BOOLEAN NOT NULL DEFAULT false,
    "pending" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "rejectedReason" TEXT NOT NULL DEFAULT 'Reason',
    CONSTRAINT "lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lead_pacingId_fkey" FOREIGN KEY ("pacingId") REFERENCES "pacing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lead_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lead_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "leadsUpload" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "lead_campaignDeliveryId_fkey" FOREIGN KEY ("campaignDeliveryId") REFERENCES "campaignDeliveries" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leadsUpload" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pacingId" INTEGER NOT NULL,
    "uploadedBy" INTEGER,
    "filename" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "results" JSONB NOT NULL,
    CONSTRAINT "leadsUpload_pacingId_fkey" FOREIGN KEY ("pacingId") REFERENCES "pacing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "leadsUpload_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pacingReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "generatedType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "campaignReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "generatedType" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_date_key" ON "Attendance"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");

-- CreateIndex
CREATE INDEX "Brief_campaignId_idx" ON "Brief"("campaignId");

-- CreateIndex
CREATE INDEX "BriefUpdates_campaignId_idx" ON "BriefUpdates"("campaignId");

-- CreateIndex
CREATE INDEX "lead_uploadId_idx" ON "lead"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "lead_campaignId_email_key" ON "lead"("campaignId", "email");
