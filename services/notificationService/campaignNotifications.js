const prisma = require('../../db/dbConnection')

const newCampaignNotification = async (campaignName,code,time) => {
    try {
        const message = `New Campaign added ${campaignName} - ${code}  at ${time}`
        const newNotification = await prisma.notification.create({
            data: {
                notificationPriorityId: 1,
                notificationSubscriberId: 2,
                message: message,
            }
        })
        return newNotification;
    }
    catch (e) {
        console.log(e)
    }
}



const campaignDueNotification = async () => {
    try {
    const currentDueCampaigns = await prisma.$queryRaw`
    SELECT c.*
    FROM campaign c
    LEFT JOIN leads l ON c."campaignId" = l."campaignId"
    WHERE c."dueDate" <= ${currentDate}
    GROUP BY c."campaignId"
    HAVING c."leadGoal" > COUNT(l."id")
    `;
    return currentDueCampaigns;
    }
    catch (e) {
        console.log(e)
    }
}

