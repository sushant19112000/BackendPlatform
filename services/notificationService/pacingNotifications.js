const prisma = require("../../db/dbConnection");

const pacingDueNotification = async () => {
    try {
        const currentDate = new Date().toISOString(); // Format to ISO for SQL compatibility

        const currentDuePacings = await prisma.$queryRaw`
            SELECT p.*, c.*
            FROM pacing p
            JOIN campaign c ON p.campaignId = c.id
            WHERE p.scheduledFor <= ${currentDate}
              AND p.leadGoal > p.actualLeads
        `;
        return currentDuePacings;
    } catch (e) {
        console.log(e);
    }
};



