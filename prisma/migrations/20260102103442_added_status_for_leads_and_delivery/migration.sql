-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_campaignDeliveries" (
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
    "status" TEXT NOT NULL DEFAULT 'DELIVERED',
    CONSTRAINT "campaignDeliveries_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaign" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "campaignDeliveries_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_campaignDeliveries" ("accepted", "campaignId", "data", "date", "errors", "fileName", "id", "rejections", "submitted", "uploaderId") SELECT "accepted", "campaignId", "data", "date", "errors", "fileName", "id", "rejections", "submitted", "uploaderId" FROM "campaignDeliveries";
DROP TABLE "campaignDeliveries";
ALTER TABLE "new_campaignDeliveries" RENAME TO "campaignDeliveries";
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
    "leadstatus" TEXT NOT NULL DEFAULT 'VALIDATED',
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
