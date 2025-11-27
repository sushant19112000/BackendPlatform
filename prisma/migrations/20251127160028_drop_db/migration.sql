/*
  Warnings:

  - You are about to drop the column `leadTemplateValidation` on the `lead` table. All the data in the column will be lost.
  - You are about to drop the column `phase1Validation` on the `lead` table. All the data in the column will be lost.
  - You are about to drop the column `validationProfile` on the `volume` table. All the data in the column will be lost.
  - You are about to alter the column `externalRules` on the `volume` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `leadTemplate` on the `volume` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lead" (
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
    "qcResult" BOOLEAN,
    "qcReason" TEXT,
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
INSERT INTO "new_lead" ("accepted", "campaignDeliveryId", "campaignId", "created_at", "data", "email", "id", "pacingId", "pending", "qcReason", "qcResult", "rejected", "rejectedReason", "updated_at", "uploadId", "uploadType", "volumeId") SELECT "accepted", "campaignDeliveryId", "campaignId", "created_at", "data", "email", "id", "pacingId", "pending", "qcReason", "qcResult", "rejected", "rejectedReason", "updated_at", "uploadId", "uploadType", "volumeId" FROM "lead";
DROP TABLE "lead";
ALTER TABLE "new_lead" RENAME TO "lead";
CREATE INDEX "lead_uploadId_idx" ON "lead"("uploadId");
CREATE UNIQUE INDEX "lead_campaignId_email_key" ON "lead"("campaignId", "email");
CREATE TABLE "new_volume" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "leadGoal" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "pending" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "headers" JSONB NOT NULL,
    "leadTemplate" JSONB,
    "externalRules" JSONB,
    CONSTRAINT "volume_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_volume" ("campaignId", "completed", "externalRules", "headers", "id", "leadGoal", "leadTemplate", "name", "pending", "status") SELECT "campaignId", "completed", "externalRules", "headers", "id", "leadGoal", "leadTemplate", "name", "pending", "status" FROM "volume";
DROP TABLE "volume";
ALTER TABLE "new_volume" RENAME TO "volume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
