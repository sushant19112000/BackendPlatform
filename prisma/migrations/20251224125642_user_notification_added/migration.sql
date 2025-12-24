-- CreateTable
CREATE TABLE "userNotifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "notificationId" INTEGER NOT NULL,
    CONSTRAINT "userNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "userNotifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
