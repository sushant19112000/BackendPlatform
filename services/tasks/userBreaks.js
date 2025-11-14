const prisma = require('../../db/dbConnection');
const createBreak = async (userId, breakId) => {
    try {
        const existingUserBreak = await prisma.userBreak.findFirst({ where: { userId: userId, breakId: breakId } })
        if (existingUserBreak) {
            return false;
        }
        const newUserBreak = await prisma.userBreak.create({
            data: {
                userId: userId,
                breakId: breakId
            }
        })
        return newUserBreak;
    }
    catch (e) {
        console.log(e);
    }
}

module.exports={createBreak}