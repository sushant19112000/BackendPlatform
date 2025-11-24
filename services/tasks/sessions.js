const prisma = require("../../db/dbConnection");

const createSession = async (userId, type, typeId,date,startTime) => {
    try {
        let newSession;
        if (type === "TASK") {
            let taskId = typeId;
            newSession = await prisma.session.create({
                data: {
                    userId: userId,
                    taskId: taskId,
                    date:date,
                    startTime: startTime, // corrected
                    type:"TASK"
                }
            });
        } else {
            let breakId = typeId;
            newSession = await prisma.session.create({
                data: {
                    userId: userId,
                    breakId: breakId,
                    startTime: startTime, // corrected
                    type:"BREAK"
                }
            });
        }
        return newSession;
    } catch (e) {
        console.error("Error creating session:", e);
        throw e;
    }
}

const endSession = async (sessionId,endTime) => {
    try {
        const session = await prisma.session.findFirst({
            where: {
                id: sessionId
            }
        });

        if (!session) {
            return false;
        }

        const updatedSession = await prisma.session.update({
            where: { id: sessionId },
            data: {
                endTime:endTime
            }
        });

        return updatedSession;
    } catch (e) {
        console.error("Error ending session:", e);
        throw e;
    }
}



module.exports = { createSession, endSession };
