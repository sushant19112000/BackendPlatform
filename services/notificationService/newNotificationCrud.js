const prisma = require('../../db/dbConnection')

const getUserNotifications = async (userId) => {
    try {
        const userWithNotifications = await prisma.userNotificationLink.findFirst({
            where: { id: userId },
            include: {
                notification: {
                    include: { priorityLevel: true }
                }
            }
        });

        if (!userWithNotifications) return [];

        return userWithNotifications.map((userSubNotification) => ({
            id: userSubNotification.notification.id,
            message: userSubNotification.notification.message,
            created_at: userSubNotification.notification.createdAt,
            priorityLevel: userSubNotification.notification.priorityLevel.level, // just the value
        }));
    } catch (e) {
        console.error("Error fetching user notifications:", e);
        return [];
    }
};


module.exports={getUserNotifications};
