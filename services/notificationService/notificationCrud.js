const prisma = require('../../db/dbConnection')

const getAllNotifications = async () => {
  try {
    const notifications = await prisma.notification.findMany();
    return notifications;
  }
  catch (e) {
    console.log(e);

  }
}

// const getUserNotifications = async (userId) => {
//   try {
//     const userWithNotifications = await prisma.user.findFirst({
//       where: { id: userId },
//       include: {
//         notificationLinks: {
//           include: {
//             notificationSubscriber: {
//               include: {
//                 notifications: {
//                   include: {
//                     notificationPriority: true, // include priority level here
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!userWithNotifications) return [];

//     const allNotifications = userWithNotifications.notificationLinks.flatMap(
//       (link) => link.notificationSubscriber?.notifications || []
//     );

//     return allNotifications.map((notif) => ({
//       id: notif.id,
//       message: notif.message,
//       created_at: notif.created_at,
//       priorityLevel: notif.notificationPriority.level, // just the value
//     }));
//   } catch (e) {
//     console.error("Error fetching user notifications:", e);
//     return [];
//   }
// };

const getUserNotifications = async (userId) => {
    try {
        const userWithNotifications = await prisma.userNotificationLink.findMany({
            where: { userId: userId },
            include: {
                notification: {
                    include: { notificationPriority: true }
                }
            }
        });

        if (!userWithNotifications) return [];
        
        return userWithNotifications.map((userSubNotification) => ({
            id: userSubNotification.notification.id,
            message: userSubNotification.notification.message,
            created_at: userSubNotification.notification.createdAt,
            priorityLevel: userSubNotification.notification.notificationPriority.level, // just the value
        }));
    } catch (e) {
        console.error("Error fetching user notifications:", e);
        return [];
    }
};



const createNotification = async (message, notificationPriorityId, notificationSubscriberId) => {
  try {
    const newNotification = await prisma.notification.create({
      data: {
        message,
        notificationPriorityId,
        notificationSubscriberId
      }
    })
    return newNotification;
  }
  catch (e) {
    console.log(e)
  }
}

const createNotificationMultiSub = async (message, notificationPriorityId, groupIds , userIds=[]) => {
  try {
    const newNotification = await prisma.notification.create({
    data: {
      message,
      notificationPriorityId,
      createdAt: new Date(), // Explicitly set for clarity
    },
  });

  // Link notification to subscriber groups (notificationGroupLink)
  for (let grpId of groupIds) {
    await prisma.notificationGroupLink.create({
      data: {
        notificationId: newNotification.id,
        subscriberGroupId: grpId,
        assignedAt: new Date(),
      },
    });

    // Fetch users in the subscriber group
    const groupUsers = await prisma.subscriberGroupUser.findMany({
      where: { subscriberGroupId: grpId },
      select: { userId: true },
    });

    // Create userNotificationLink for each user in the group
    for (let { userId } of groupUsers) {
      await prisma.userNotificationLink.create({
        data: {
          notificationId: newNotification.id,
          userId,
          isRead: false, // Default to unread
          deliveredAt: new Date(),
          notificationSubscriberGroupId: grpId, // Link to the group
        },
      });
    }
  }

  // Link notification directly to individual users (if provided)
  for (let userId of userIds) {
    await prisma.userNotificationLink.create({
      data: {
        notificationId: newNotification.id,
        userId,
        isRead: false,
        deliveredAt: new Date(),
        notificationSubscriberGroupId: null, // Direct notification, no group
      },
    });
  }

  return newNotification;

  }
  catch (e) {
    console.log(e)
  }
}

const deleteNotification = async (id) => {
  try {
    const deletedNotification = await prisma.notification.delete({
      where: { id: id }
    })
    return deletedNotification;
  }
  catch (e) {
    console.log(e);
  }
}


module.exports = { getAllNotifications, getUserNotifications, createNotification, deleteNotification,createNotificationMultiSub }