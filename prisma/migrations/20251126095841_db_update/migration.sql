/*
  Warnings:

  - You are about to drop the `campaignType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "campaignType";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BriefUpdates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "briefId" INTEGER NOT NULL,
    "arrivedOn" DATETIME NOT NULL,
    "clientCode" TEXT NOT NULL DEFAULT 'PH',
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
INSERT INTO "new_BriefUpdates" ("arrivedOn", "briefHyperlink", "briefId", "campaignId", "due", "id", "leadDetails", "quotes", "remark", "status", "type") SELECT "arrivedOn", "briefHyperlink", "briefId", "campaignId", "due", "id", "leadDetails", "quotes", "remark", "status", "type" FROM "BriefUpdates";
DROP TABLE "BriefUpdates";
ALTER TABLE "new_BriefUpdates" RENAME TO "BriefUpdates";
CREATE INDEX "BriefUpdates_campaignId_idx" ON "BriefUpdates"("campaignId");
CREATE TABLE "new_campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "leadgoal" INTEGER NOT NULL DEFAULT 0,
    "completed" INTEGER NOT NULL,
    "pending" INTEGER NOT NULL,
    "duedate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstUploadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weeklyUploadDays" TEXT NOT NULL DEFAULT 'Default',
    "cpc" INTEGER NOT NULL DEFAULT 0,
    "info" JSONB NOT NULL,
    "additionalInfo" TEXT NOT NULL DEFAULT 'default info',
    "descriptionOfFilesAttached" TEXT NOT NULL DEFAULT 'default des',
    "content" JSONB NOT NULL,
    "filesInfo" JSONB NOT NULL,
    "updates" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "campaignType" TEXT NOT NULL DEFAULT 'SINGLE_TOUCH',
    CONSTRAINT "campaign_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_campaign" ("additionalInfo", "clientId", "code", "completed", "content", "created_at", "descriptionOfFilesAttached", "duedate", "filesInfo", "id", "info", "leadgoal", "name", "pending", "status", "updated_at", "updates") SELECT "additionalInfo", "clientId", "code", "completed", "content", "created_at", "descriptionOfFilesAttached", "duedate", "filesInfo", "id", "info", "leadgoal", "name", "pending", "status", "updated_at", "updates" FROM "campaign";
DROP TABLE "campaign";
ALTER TABLE "new_campaign" RENAME TO "campaign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
