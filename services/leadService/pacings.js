const prisma = require('../../db/dbConnection')

const getFormatedPacingsData = (data) => {
    let ob = {};
    for (let pacing of data) {
        if (!ob[pacing.campaignId]) {
            ob[pacing.campaignId] = [pacing]
        }
        else {
            ob[pacing.campaignId].push(pacing)
        }
    }
    return ob;
}


const getAllPacings = async () => {
    try {
        const pacings = await prisma.pacing.findMany();
        const data = getFormatedPacingsData(pacings);
        return data;
    }
    catch (e) {
        console.log(e);
    }

}



const getPacing = async (id) => {
    try {
        const pacings = await prisma.pacing.findFirst({ where: { id: id } });
        return pacings;
    }
    catch (e) {
        console.log(e);
    }

}


const getPacingsByVolumeId = async (volumeId) => {
    try {

        //   const pacings= await prisma.pacing.findMany({ where: { volumeId:volumeId }});
        const volume = await prisma.volume.findFirst({ where: { id: volumeId }, include: { pacings: true } });

        return volume;
    }
    catch (e) {
        console.log()
    }
}

const getPacingsByVolumeIdAndStatus = async (volumeId, status) => {
    try {
       
        if (status === "all") {
            const volume = await prisma.volume.findFirst({ where: { id: volumeId }, include: { pacings: true } });
            return volume;
        }
        if (status == "active" || status == "scheduled" || status=="completed") {
            
            const volume = await prisma.volume.findFirst({ where: { id: volumeId }, include: { pacings: { where: { status: {equals:status} } } } });
            return volume
        }
        if (status == "today") {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // today at midnight UTC

            const volume = await prisma.volume.findFirst({
                where: { id: volumeId },
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
            return volume
        }

        if (status == "due") {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // today at midnight UTC

            const volume = await prisma.volume.findFirst({
                where: { id: volumeId },
                include: {
                    pacings: {
                        where: {
                            scheduledFor: {
                                lt: date, // all before today
                            }
                        }
                    }
                }
            });
            return volume;
        }
        //   const pacings= await prisma.pacing.findMany({ where: { volumeId:volumeId }});



    }
    catch (e) {
        console.log()
    }
}
const getCampaignPacings = async (campaignId) => {
    try {
        const pacings = await prisma.pacing.findMany({ where: { campaignId: campaignId }, include: { uploads: true } });


        return pacings;
    }
    catch (e) {
        console.log(e);
    }
}

const createPacing = async (data) => {
    try {
        const newPacing = await prisma.pacing.create({ data: data });
        return newPacing;
    }
    catch (e) {
        console.log(e)
    }
}

const deletePacing = async (pacingId) => {
    try {
        await prisma.pacing.delete({ where: { id: pacingId } });
        return true;
    }
    catch (e) {
        console.log(e);
    }
}


const editPacing = async (campaignId, data) => {
    try {
        const pacingExist = await prisma.pacing.findFirst({ where: { id: campaignId } })
        if (!pacingExist) {
            return false;
        }
        await prisma.pacing.update({ where: { id: id }, data: data })

    }
    catch (e) {
        console.log(e);
    }
}

module.exports = { getAllPacings, getCampaignPacings, createPacing, deletePacing, editPacing, getPacing, getPacingsByVolumeId,getPacingsByVolumeIdAndStatus }