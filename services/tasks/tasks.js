const prisma = require("../../db/dbConnection");

const getAllTasks = async () => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                users: {
                    // Assuming 'users' relation is the UserTask model
                    include: {
                        // 1. Fetch the ASSIGNED user's ID and Name
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        // 2. Fetch the ASSIGNING user's ID and Name (Corrected relation name)
                        assignee: true
                    }
                }
            }
        });

        // Map over the tasks fetched from the database
        const transformedTasks = tasks.map(task => {

            // Extract the ASSIGNED user's ID and Name
            const assignedUsers = task.users.map(userTask => ({
                id: userTask.user.id,
                name: userTask.user.name,
            }));

            // Extract the ASSIGNING user's ID and Name 
            // The assignedBy user is the same for all UserTask records related to this Task.
            const assignedBy = task.users.length > 0
                ? {
                    id: task.users[0].assignee.id,
                    name: task.users[0].assignee.name,
                }
                : null; // Handle tasks with no assignments
            //  const assignedBy={name:"sushant",id:1}
            // Destructure the task object to exclude the raw 'users' array 
            const { users, ...taskDetails } = task;

            // Return the new object with assignedBy and assignedUsers
            return {
                ...taskDetails,
                assignedBy: assignedBy,
                assignedUsers: assignedUsers,
            };
        });

        return transformedTasks;
    }
    catch (e) {
        console.error("Error fetching or transforming tasks:", e);
        throw new Error("Could not retrieve tasks.");
    }
}



const getAllUnassignedTasks = async () => {
    try {
        const unassignedTasks = await prisma.task.findMany({
            where: {
                // Filter to find tasks where the 'users' relation (UserTask records) is empty.
                users: {
                    none: {}
                }
            },
            // Since we are looking for unassigned tasks, we don't strictly need to include 'users'
            // But if you include it, the 'users' array will be empty:
            /* include: {
                users: true 
            }
            */
        });

        // Since these tasks are unassigned, the transformation is minimal.
        // We can optionally map to standardize the output structure with empty arrays/nulls.
        const transformedTasks = unassignedTasks.map(task => {
            return {
                ...task,
                assignedBy: null,
                assignedUsers: [],
            };
        });

        return transformedTasks;
    }
    catch (e) {
        console.error("Error fetching unassigned tasks:", e);
        // Optionally throw the error or return a specific response structure on failure
        throw new Error("Could not retrieve unassigned tasks.");
    }
}


const getTask = async (taskId) => {
    try {
        const task = await prisma.task.findFirst({
            where: { id: taskId },
            include: {
                users: {
                    // 👇 select fields from the "users" relation itself
                    select: {
                        totalTime: true,
                        user: { select: { name: true } },
                        assignee: {
                            select: {
                                name: true
                            }
                        },
                        sessions: { select: { startTime: true, endTime: true } },

                    }
                }
            }
        });

        return task; // includes assigned users + their assignee details
    } catch (e) {
        console.error(e);
        throw e;
    }
};
 



// automatically created when a campaign or brief is added 
const createTask = async (type, typeId, name, status, remark, level) => {
    try {

        const existingTask = await prisma.task.findFirst({ where: { typeId: typeId, type: type } })
        if (existingTask) {
            return false;
        }
        try {
            const newTask = await prisma.task.create({
                data: {
                    type: type,
                    typeId: typeId,
                    name: name,
                    status: status,
                    remark: remark,
                    level: level
                }

            })
            return newTask;
        }
        catch (e) {
            console.log(e)
            return false

        }
    }
    catch (e) {
        console.log(e);
    }
}



const deleteTask = async (taskId) => {
    try {
        const deletedTask = await prisma.task.findFirst({
            where: { id: taskId }
        })

        if (!deletedTask) {
            return false;
        }

        await prisma.task.delete({ where: { id: taskId } })
        return deletedTask;
    }
    catch (e) {
        console.log(e);
    }
}


module.exports = { createTask, deleteTask, getAllTasks, getTask, getAllUnassignedTasks }




