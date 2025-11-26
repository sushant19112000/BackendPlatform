var express = require('express');
var router = express.Router();
// const { getUserTasks, getTasksAssignedBy } = require('../services/tasks/userTasks');
const { getAllTasks, createTask, getTask, getAllUnassignedTasks } = require('../services/tasks/tasks');
const { multiUserTaskAssign, getUserTasks, getUserTask, getTasksAssignedBy } = require('../services/tasks/userTasks');
const prisma = require('../db/dbConnection');


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

router.put('/update-status', async (req, res) => {
  try {
    const { taskId, userId, status } = req.body;

    if (!taskId || !userId || !status) {
      return res.status(400).json({
        message: "taskId, userId, and status are required"
      });
    }

    // 1️⃣ Check if user-task relation exists
    const userTask = await prisma.userTask.findFirst({
      where: {
        taskId: Number(taskId),
        userId: Number(userId),
      },
    });

    if (!userTask) {
      return res.status(403).json({
        message: "User does not have permission to update this task",
      });
    }

    // 2️⃣ Update task status (only if relation exists)
    const updatedTask = await prisma.task.update({
      where: { id: Number(taskId) },
      data: { status },
    });

   //  // 3️⃣ Update UserTask status as well (optional but recommended)
   //  await prisma.userTask.updateMany({
   //    where: {
   //      taskId: Number(taskId),
   //      userId: Number(userId),
   //    },
   //    data: { status },
   //  });

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
      console.log(data,'task data')
      const newTask = await createTask(data.type, data.typeId, data.name, data.status, data.remark, data.level);
    
      if(!newTask){
          return res.status(400).json({ message:"Error Creating Task"});
      }
      return res.status(200).json({ message:"Task created successfully",data: newTask });
   }
   catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
   }
})



router.get('/assignedBy/:id', async(req,res)=>{
   try{
      const id = Number(req.params.id);
      const tasks= await getTasksAssignedBy(id);
      return res.status(200).json({ message: "Data fetched successfully", data: tasks });
   }
   catch(e){
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
      console.log(data,'assigned data')
      const { users, assignedById } = data;
      console.log(taskId,'taskid')
      const taskAssignedData = await multiUserTaskAssign(users, assignedById, taskId);
      return res.status(201).json({ data: taskAssignedData })
   }
   catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
   }
})




module.exports = router;