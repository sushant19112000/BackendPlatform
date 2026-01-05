const prisma = require('../../db/dbConnection');
const assignTask = async (userId, taskId, assignedById) => {
    try {
        const existingUserTask = await prisma.userTask.findFirst({ where: { userId: userId, taskId: taskId } })
        if (existingUserTask) {
            return false;
        }
        const newUserTask = await prisma.userTask.create({
            data: {
                userId: userId,
                taskId: taskId,
                assignedById: assignedById,
                totalTime: 0
            },
            include:{user:true}
        })
        return newUserTask;
    }
    catch (e) {
        console.log(e);
    }
}

const multiUserTaskAssign = async (users, assignedById, taskId) => {
    try {
       
        const task= await prisma.task.findFirst({where:{id:taskId}});
        const assignedBy= await prisma.user.findFirst({where:{id:assignedById}})

        let taskAssignedData = { assignedUsers: [], taskId, assignedById,task,assignedBy }
        for (let user of users) {
            try {
                let newUserTask = await assignTask(user, taskId, assignedById);
                taskAssignedData.assignedUsers.push(newUserTask.user)
            }
            catch (e) {
                console.log(e, `failed to assign task ${taskId} to the user ${user}`)
            }

        }
        return taskAssignedData;
    }
    catch (e) {
        console.log(e);
    }
}

// automatically created when a campaign or brief is added 
const reassignTask = async (users, assignedById, taskId) => {
    try {
        console.log(users, 'users')
        let taskAssignedData = { users: [], taskId, assignedById }
        for (let user of users) {
            try {
                let newUserTask = await assignTask(user, taskId, assignedById);
                console.log(taskId, 'taskId')
                console.log(newUserTask, 'task assigned')
                taskAssignedData.users.push(user)
            }
            catch (e) {
                console.log(e, `failed to assign task ${taskId} to the user ${user}`)
            }

        }
        return taskAssignedData;
    }
    catch (e) {
        console.log(e);
    }
}

const getTasksAssignedBy = async (userId) => {
    try {
        const assignedTasks = await prisma.userTask.findMany({ where: { assignedById: userId }, include: { user: true, task: true } })
        const groupedTasks = assignedTasks.reduce((acc, userTask) => {
            const taskId = userTask.taskId;

            // Extract the task details and the current user's info
            const { task, user } = userTask;

            // The user object only needs id and name
            const assignedUser = { id: user.id, name: user.name };

            // Initialize the entry for this taskId if it doesn't exist
            if (!acc[taskId]) {
                // Start with all the task details and an empty array for users
                acc[taskId] = {
                    ...task,
                    assignedUsers: []
                };
            }

            // Add the current assigned user to the array
            acc[taskId].assignedUsers.push(assignedUser);

            return acc;
        }, {});

        // If you want the final result as an array of tasks (instead of an object keyed by taskId)
        const finalResult = Object.values(groupedTasks);
        return finalResult;
    }
    catch (e) {
        console.log(e);
    }
}


const getUserTasks = async (userId) => {
    try {
        console.log(userId, 'in tasks')
        const tasks = await prisma.userTask.findMany({ where: { userId: userId }, select: { task: true, assignee: { select: { name: true } } } })

        console.log(tasks, 'tasks')
        const newData = tasks.map(({ task, assignee }) => ({
            ...task,
            assignedBy: assignee.name// flatten or merge as needed
        }));

        return newData;
    }
    catch (e) {
        console.log(e)
    }
}


const getUserTask = async (userId, taskId) => {
    try {
        if (userId == null || taskId == null) {
            return false;
        }

        const task = await prisma.userTask.findFirst({ where: { userId: userId, taskId: taskId }, include: { task: true, assignee: true } })
        // const userTask=await prisma.userTask.findFirst({where:{userId:userId,taskId:taskId},include:{task:true,user:true}});

        // return userTask.task;



        // const exampleTask = {
        //     id: 1,
        //     name: "Email Campaign - Q4 Outreach",
        //     type: "Campaign",         // from TaskType enum
        //     typeId: 42,               // linked record ID (e.g., campaign ID)
        //     status: "In Progress",    // could be "Pending", "Completed", etc.
        //     level: "Medium",          // from TaskLevel enum (e.g., Low, Medium, High)
        //     remark: "Initial leads uploaded and validation in progress.",
        //     reassigned: false,        // not reassigned yet
        //     users: [
        //         {
        //             userId: 3,
        //             taskId: 1,
        //             role: "Validator",
        //             assignedAt: new Date("2025-11-05T10:30:00Z"),
        //         },
        //         {
        //             userId: 5,
        //             taskId: 1,
        //             role: "Uploader",
        //             assignedAt: new Date("2025-11-05T09:00:00Z"),
        //         },
        //     ],
        // };
        return task
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { assignTask, getUserTasks, getTasksAssignedBy, getUserTask, multiUserTaskAssign }