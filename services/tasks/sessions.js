const prisma = require("../../db/dbConnection");

const createSession = async (userId, type, typeId) => {
    try {
        let newSession;
        if (type === "TASK") {
            let taskId = typeId;
            newSession = await prisma.session.create({
                data: {
                    userId: userId,
                    taskId: taskId,
                    startTime: new Date(), // corrected
                    type:"TASK"
                }
            });
        } else {
            let breakId = typeId;
            newSession = await prisma.session.create({
                data: {
                    userId: userId,
                    breakId: breakId,
                    startTime: new Date(), // corrected
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

const endSession = async (userId, sessionId) => {
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
                endTime: new Date() // corrected
            }
        });

        return updatedSession;
    } catch (e) {
        console.error("Error ending session:", e);
        throw e;
    }
}



module.exports = { createSession, endSession };
