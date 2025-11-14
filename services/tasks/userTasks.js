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
            }
        })
        return newUserTask;
    }
    catch (e) {
        console.log(e);
    }
}

const multiUserTaskAssign = async (users, taskId, assignedById) => {
    try {
        let taskAssignedData = { users: [], taskId, assignedById }
        for (let user of users) {
            try {
                let newUserTask = await assignTask(user, taskId, assignedById);
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

// automatically created when a campaign or brief is added 
const reassignTask = async (taskId, status, remark, level, userId, assignedById) => {
    try {
        const existingTask = await prisma.task.findFirst({ where: { id: taskId } })
        if (existingTask) {
            return false;
        }

        const updateTask = await prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                status: status,
                remark: remark,
                level: level,
                reassigned: true
            }
        })
        const userTask = await prisma.userTask.update({
            where: {
                taskId: taskId
            },
            data: {
                userId: userId,
                assignedById: assignedById
            }
        })
        return newTask;
    }
    catch (e) {
        console.log(e);
    }
}

const getTasksAssignedBy = async (userId) => {
    try {
        const assignedTasks = await prisma.userTask.findMany({ where: { assignedById: userId }, include: { user: true, task: true } })
        return assignedTasks;
    }
    catch (e) {
        console.log(e);
    }
}


const getUserTasks = async (userId) => {
    try {
        console.log(userId, 'in tasks')
        const tasks = await prisma.userTask.findMany({ where: { userId: userId }, select: { task: true, assignee: {select:{name:true}} } })

        console.log(tasks, 'tasks')
        const newData = tasks.map(({ task, assignee }) => ({
            ...task,
            assignedBy:assignee.name// flatten or merge as needed
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