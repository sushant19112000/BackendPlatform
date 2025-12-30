var express = require('express');
var router = express.Router();
var {
    getAllNotifications, getUserNotifications, createNotification, deleteNotification,
    createNotificationMultiSub
} = require('../services/notificationService/notificationCrud');
const prisma = require('../db/dbConnection');

router.get('/role', async (req, res) => {
    try {

        const roleName = req.query.name; // keep as string
        const role = await prisma.role.findFirst({
            where: { name: roleName },
            include: {
                roleNotifications: {
                    include: {
                        notification: true, // include the actual notification object
                    },
                    orderBy: {
                        notification: {
                            createdAt: "desc", // adjust field if needed (e.g., id)
                        },
                    },
                },
            },
        });

        // Extract only the notification objects
        const notifications =
            role?.roleNotifications.map((rn) => rn.notification) || [];

        res.status(200).json(notifications);
    }
    catch (e) {
        console.log(e);
    }
})

router.get('/user', async (req, res) => {
   try {
      const userId = Number(req.query.userId);

      if (!userId) {
         return res.status(400).json({
            message: "userId query parameter is required",
         });
      }

      const user = await prisma.user.findUnique({
         where: { id: userId },
         include: {
            userNotifications: {
               include: {
                  notification: true, // include actual notification
               },
               orderBy: {
                  notification: {
                     createdAt: "desc",
                  },
               },
            },
         },
      });

      if (!user) {
         return res.status(404).json({
            message: "User not found",
         });
      }

      // Extract only notification objects
      const notifications = user.userNotifications.map(
         (un) => un.notification
      );

      return res.status(200).json(notifications);

   } catch (error) {
      console.error("Error fetching user notifications:", error);
      return res.status(500).json({
         message: "Internal server error",
      });
   }
});


router.post('/', async (req, res) => {
    try {
        const data = req.body;
        // const notificationSubGroups=await addNotificationSubGroup(data);
        console.log(data)

        res.status(201).json({ message: "Sub Group Created" });
    }
    catch (e) {
        console.log(e);
    }
})


router.get('/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const userNotications = await getUserNotifications(userId);
        res.status(200).json([...userNotications]);
    }
    catch (e) {
        console.log(e)
    }
})



router.post('/', async (req, res) => {
    try {
        const data = req.body;
        const newNotification = await createNotificationMultiSub(data.message, data.priorityId, data.roles);
        res.status(201).json({ message: "Data Added successfully", notification: newNotification });
    }
    catch (e) {
        console.log(e);
    }
})

router.delete('/:notificationId', async (req, res) => {
    try {
        const notificationId = Number(req.params.notificationId);
        const deletedNotification = await prisma.notification.delete({ where: { id: notificationId } });
        res.status(201).json({ message: "Data Added successfully", notification: deletedNotification });
    }
    catch (e) {
        console.log(e);
    }
})

module.exports = router;

