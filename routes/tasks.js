var express = require('express');
var router = express.Router();
// const { getUserTasks, getTasksAssignedBy } = require('../services/tasks/userTasks');
const { getAllTasks, createTask, getTask, getAllUnassignedTasks } = require('../services/tasks/tasks');
const { multiUserTaskAssign, getUserTasks, getUserTask, getTasksAssignedBy } = require('../services/tasks/userTasks');
const prisma = require('../db/dbConnection');
const roles = [1, 2]

router.get('/', async (req, res) => {
   try {
      const tasks = await getAllTasks();
      return res.status(200).json({ message: "Data fetched successfully", data: tasks });
   }
   catch (e) {
      console.log(e);
   }
})


router.get('/unassigned', async (req, res) => {
   try {
      const tasks = await getAllUnassignedTasks();


      return res.status(200).json({ message: "Data fetched successfully", data: tasks });
   }
   catch (e) {
      console.log(e);
   }
})

router.get('/reassign', async (req, res) => {
   try {
      const tasks = await getAllUnassignedTasks();
      return res.status(200).json({ message: "Data fetched successfully", data: tasks });
   }
   catch (e) {
      console.log(e);
   }
})


router.get('/user-tasks', async (req, res) => {
   try {
      const userId = Number(req.query.userId) || -1;
      const taskId = Number(req.query.taskId) || -1;


      if (userId != -1 && taskId != -1) {
         const task = await getUserTask(userId, taskId);

         return res.status(200).json({ message: "Data fetched successfully", data: task });
      }
      if (userId != -1 && taskId == -1) {
         const tasks = await getUserTasks(userId);
         console.log(tasks)
         return res.status(200).json({ message: "Data fetched successfully", data: tasks });
      }

      // const task = await getTask(taskId);
      return res.status(200).json({ message: "Data fetched successfully", data: [] });
   }
   catch (e) {
      console.log(e);
   }
})

// router.put('/update-status', async (req, res) => {
//    try {
//       const { taskId, userId, status } = req.body;

//       if (!taskId || !userId || !status) {
//          return res.status(400).json({
//             message: "taskId, userId, and status are required",
//          });
//       }

//       const taskIdNum = Number(taskId);
//       const userIdNum = Number(userId);

//       // Check user-task relation
//       const userTask = await prisma.userTask.findFirst({
//          where: {
//             taskId: taskIdNum,
//             userId: userIdNum,
//          },
//       });

//       // Fetch task once
//       const task = await prisma.task.findUnique({
//          where: { id: taskIdNum },
//       });

//       if (!task) {
//          return res.status(404).json({ message: "Task not found" });
//       }

//       // If no user-task relation, check admin role
//       if (!userTask) {
//          const userRole = await prisma.userrole.findFirst({
//             where: { userId: userIdNum },
//             include: { role: true, user: true },
//          });

//          if (!['admin', 'superAdmin'].includes(userRole?.role?.name)) {
//             return res.status(403).json({
//                message: "User does not have permission to update this task",
//             });
//          }

//          // Admin update
//          const updatedTask = await prisma.task.update({
//             where: { id: taskIdNum },
//             data: { status },
//          });

//          const message = `Task "${updatedTask.name}" status was updated to "${updatedTask.status}" by admin.`;

//          let newNotification = await prisma.notification.create({
//             data: {
//                message,
//                notificationPriority: { connect: { id: 3 } },
//                url: `/tasks/${updatedTask.id}`,
//                type: "task-status-updated-by-admin",
//             },
//          });

//          req.io.emit('receiveTaskStatus', {
//             type: "task-status-updated-by-admin",
//             taskId: updatedTask.id,
//             message,
//             payload: {
//                status: updatedTask.status,
//                userId: userTask.userId,
//                assignedById: userTask.assignedById
//             },
//          });


//          let newUserNotificationLink = await prisma.userNotifications.create({
//             data: {
//                userId: userTask.userId,
//                notificationId: newNotification.id
//             }
//          })

//          let newUser2NotificationLink = await prisma.userNotifications.create({
//             data: {
//                userId: userTask.assignedById,
//                notificationId: newNotification.id
//             }
//          })
//                console.log(newNotification,'new ')

//          return res.status(200).json({
//             message: "Task status updated successfully by admin",
//             data: updatedTask,
//          });
//       }

//       // User update
//       const updatedTask = await prisma.task.update({
//          where: { id: taskIdNum },
//          data: { status },
//       });

//       const message = `Task "${updatedTask.name}" status was updated to "${updatedTask.status}" by the assigned user.`;

//       let newNotification = await prisma.notification.create({
//          data: {
//             message,
//             notificationPriority: { connect: { id: 3 } },
//             url: `/tasks/${updatedTask.id}`,
//             type: "task-status-updated-by-user",

//          },
//       });

//       console.log(newNotification,'new ')

//       req.io.emit('receiveTaskStatus', {
//          type: "task-status-updated-by-user",
//          taskId: updatedTask.id,
//          message,
//          payload: {
//             status: updatedTask.status,
//             userId: userTask.userId,
//             assignedById: userTask.assignedById
//          },
//       });


//       let newUserNotificationLink = await prisma.userNotifications.create({
//          data: {
//             userId: userTask.userId,
//             notificationId: newNotification.id
//          }
//       })

//       let newUser2NotificationLink = await prisma.userNotifications.create({
//          data: {
//             userId: userTask.assignedById,
//             notificationId: newNotification.id
//          }
//       })

//       return res.status(200).json({
//          message: "Task status updated successfully",
//          data: updatedTask,
//       });

//    } catch (error) {
//       console.error("Error updating task status:", error);
//       return res.status(500).json({
//          message: "Internal server error",
//       });
//    }
// });



router.put('/update-status', async (req, res) => {
   try {
      const { taskId, userId, status } = req.body;

      if (!taskId || !userId || !status) {
         return res.status(400).json({
            message: "taskId, userId, and status are required",
         });
      }

      const taskIdNum = Number(taskId);
      const userIdNum = Number(userId);

      // Fetch task
      const task = await prisma.task.findUnique({
         where: { id: taskIdNum },
      });

      if (!task) {
         return res.status(404).json({ message: "Task not found" });
      }

      // Check if user is assigned to task
      const userTask = await prisma.userTask.findFirst({
         where: {
            taskId: taskIdNum,
            userId: userIdNum,
         },
         include: { user: true },
      });

      let isAdmin = false;
      let updatedByName = null;

      // Assigned user
      if (userTask) {
         updatedByName = userTask.user.name;
      }

      // If not assigned, check admin role
      if (!userTask) {
         const userRole = await prisma.userrole.findFirst({
            where: { userId: userIdNum },
            include: { role: true, user: true },
         });

         if (!['admin', 'superAdmin'].includes(userRole?.role?.name)) {
            return res.status(403).json({
               message: "You do not have permission to update this task",
            });
         }

         isAdmin = true;
         updatedByName = `${userRole.user.name} (${userRole.role.name})`;
      }

      // Update task status
      const updatedTask = await prisma.task.update({
         where: { id: taskIdNum },
         data: { status },
      });

      // Build notification message (single source of truth)
      const message = `Task "${updatedTask.name}" status was updated to "${updatedTask.status}" by ${updatedByName}.`;

      // Create notification
      const newNotification = await prisma.notification.create({
         data: {
            message,
            notificationPriority: { connect: { id: 3 } },
            url: `/tasks/${updatedTask.id}`,
            type: 'task'
         },
      });

      // Notify assigned users
      const assignedUsers = await prisma.userTask.findMany({
         where: { taskId: taskIdNum },
         select: { userId: true },
      });

      if (assignedUsers.length) {
         await prisma.userNotifications.createMany({
            data: assignedUsers.map((u) => ({
               userId: u.userId,
               notificationId: newNotification.id,
            })),
         });
      }

      // Notify admin roles (admin updates only)
      if (isAdmin) {
         await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
               notificationId: newNotification.id,
               roleId,
            })),
         });
      }

      // Emit socket event
      req.io.emit('task', {
         type: newNotification.type,
         taskId: updatedTask.id,
         message,
         assignedTo:userTask.userId,
         assignedBy:userTask.assignedById,
         payload: {
            status: updatedTask.status,
            updatedBy: isAdmin ? "admin" : "user",
            updatedByName,
         },
      });

      return res.status(200).json({
         message: "Task status updated successfully",
         data: updatedTask,
      });

   } catch (error) {
      console.error("Error updating task status:", error);
      return res.status(500).json({
         message: "Internal server error",
      });
   }
});

// router.put('/update-status', async (req, res) => {
//   try {
//     const { taskId, userId, status } = req.body;

//     if (!taskId || !userId || !status) {
//       return res.status(400).json({
//         message: "taskId, userId, and status are required"
//       });
//     }

//     // Fetch user (for name)
//     const user = await prisma.user.findUnique({
//       where: { id: Number(userId) },
//       select: { name: true }
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const task = await prisma.task.findUnique({
//       where: { id: Number(taskId) }
//     });

//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//     const url = `/tasks/${taskId}`;

//     // Check user-task relation
//     const userTask = await prisma.userTask.findFirst({
//       where: {
//         taskId: Number(taskId),
//         userId: Number(userId),
//       },
//       inc
//     });

//     let updatedBy = "user";

//     // If no relation, check admin role
//     if (!userTask) {
//       const userRole = await prisma.userrole.findFirst({
//         where: { userId: Number(userId) },
//         include: { role: true }
//       });

//       if (!userRole || !['admin', 'superAdmin'].includes(userRole.role.name)) {
//         return res.status(403).json({
//           message: "User does not have permission to update this task",
//         });
//       }

//       updatedBy = "admin";
//     }

//     // Update task status
//     const updatedTask = await prisma.task.update({
//       where: { id: Number(taskId) },
//       data: { status },
//     });

//     // Notification message
//     const message =
//       updatedBy === "admin"
//         ? `Admin ${user.name} updated the status of task "${updatedTask.name}" to "${updatedTask.status}".`
//         : `${user.name} updated the status of task "${updatedTask.name}" to "${updatedTask.status}".`;

//     // Create notification
//     await prisma.notification.create({
//       data: {
//         message,
//         notificationPriority: {
//           connect: { id: 3 }
//         },
//         url,
//         type:
//           updatedBy === "admin"
//             ? "task-status-updated-by-admin"
//             : "task-status-updated-by-user",
//       }
//     });

//     // Emit socket event
//     req.io.emit('receiveTaskStatus', {
//       type:
//         updatedBy === "admin"
//           ? "task-status-updated-by-admin"
//           : "task-status-updated-by-user",
//       message,
//       payload: {
//         url,
//         priorityId: 3,
//         taskId: updatedTask.id,
//         status: updatedTask.status
//         userId:userId,
//         assignedById:assignedById
//       }
//     });

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       data: updatedTask,
//     });

//   } catch (error) {
//     console.error("Error updating task status:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// });


router.put('/:id', async (req, res) => {
   try {
      const taskId = Number(req.params.id);
      const data = req.body;
      const task = await updatedTask(taskId, data);
      return res.status(200).json({ message: "Data fetched successfully", data: task });
   }
   catch (e) {
      console.log(e);
   }
})

router.get('/:id', async (req, res) => {
   try {
      const taskId = Number(req.params.id);
      const task = await getTask(taskId);
      return res.status(200).json({ message: "Data fetched successfully", data: task });
   }
   catch (e) {
      console.log(e);
   }
})


router.post('/', async (req, res) => {
   try {
      const data = req.body;
      console.log(data, 'task data')
      const newTask = await createTask(data.type, data.typeId, data.name, data.status, data.remark, data.level);

      if (!newTask) {
         return res.status(400).json({ message: "Error Creating Task" });
      }
      return res.status(200).json({ message: "Task created successfully", data: newTask });
   }
   catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
   }
})



router.get('/assignedBy/:id', async (req, res) => {
   try {
      const id = Number(req.params.id);
      const tasks = await getTasksAssignedBy(id);
      return res.status(200).json({ message: "Data fetched successfully", data: tasks });
   }
   catch (e) {
      console.log(e);
   }
})




router.post('/:id/assign', async (req, res) => {
   try {
      const taskId = Number(req.params.id) || -1;
      if (taskId == -1) {
         return res.status(404).json({ message: "Task not found" })
      }

      const data = req.body;
      const { users, assignedById } = data;

      const taskAssignedData = await multiUserTaskAssign(users, assignedById, taskId);
      return res.status(201).json({ data: taskAssignedData })
   }
   catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
   }
})

router.post('/:id/reassign', async (req, res) => {
   try {
      const taskId = Number(req.params.id) || -1;
      if (taskId == -1) {
         return res.status(404).json({ message: "Task not found" })
      }

      const data = req.body;
      console.log(data, 'assigned data')
      const { users, assignedById } = data;
      console.log(taskId, 'taskid')
      const taskAssignedData = await multiUserTaskAssign(users, assignedById, taskId);
      return res.status(201).json({ data: taskAssignedData })
   }
   catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
   }
})




module.exports = router;