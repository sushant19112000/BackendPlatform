const prisma = require('../../db/dbConnection')

const getVolumesByCampaignId = async (campaignId, status) => {
    try {

        if (status === "all") {
            const volumes = await prisma.volume.findMany({ where: { campaignId: campaignId } });
            return volumes;
        }

        if (status == "active" || status == "scheduled") {
            const volumes = await prisma.volume.findMany({
                where: {
                    campaignId,
                    pacings: {
                        some: { status }
                    }
                }
            });
            return volumes
        }
        if (status == "today") {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // today at midnight UTC

            const volumes = await prisma.volume.findMany({
                where: { campaignId: campaignId },
                include: {
                    pacings: {
                        where: {
                            scheduledFor: {
                                gte: date,
                                lt: new Date(date.getTime() + 24 * 60 * 60 * 1000), // next day
                            }
                        }
                    }
                }
            });
            return volumes
        }

        if (status == "due") {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // today at midnight UTC

            const volumes = await prisma.volume.findMany({
                where: { campaignId },
                include: { pacings: true }
            });

            const volumesDue = volumes.map(volume => ({
                ...volume,
                pacings: volume.pacings.filter(p => p.scheduledFor < date && p.leadGoal > p.actualLeads)
            }));
            return volumesDue;
        }
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { getVolumesByCampaignId };

