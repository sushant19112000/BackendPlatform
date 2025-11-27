-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Brief" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "clientCode" TEXT NOT NULL DEFAULT 'PH',
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
    "briefHyperlink" TEXT,
    "files" JSONB
);
INSERT INTO "new_Brief" ("arrivedOn", "arrivedOnTime", "briefHyperlink", "campaignId", "due", "dueTime", "files", "id", "leadDetails", "leadDetailsSection", "name", "quotes", "remark", "status", "type") SELECT "arrivedOn", "arrivedOnTime", "briefHyperlink", "campaignId", "due", "dueTime", "files", "id", "leadDetails", "leadDetailsSection", "name", "quotes", "remark", "status", "type" FROM "Brief";
DROP TABLE "Brief";
ALTER TABLE "new_Brief" RENAME TO "Brief";
CREATE INDEX "Brief_campaignId_idx" ON "Brief"("campaignId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
