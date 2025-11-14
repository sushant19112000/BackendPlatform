const prisma = require("../../db/dbConnection");

const getAllTasks = async () => {
    try {
        const tasks = await prisma.task.findMany({ include: { users: true } });
        return tasks;
    }
    catch (e) {
        console.log(e);
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
            user:{select:{name:true}},
            assignee: {
              select: {
                name: true
              }
            },
            sessions:{select:{startTime:true,endTime:true}},
           
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
        const existingTask = await prisma.task.findFirst({ where: { typeId: typeId } })
        if (existingTask) {
            return false;
        }
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


module.exports = { createTask, deleteTask, getAllTasks, getTask }




