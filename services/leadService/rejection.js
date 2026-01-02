const prisma = require("../../db/dbConnection");

const internalRejection = async (campaignId, rejections) => {
    try {
        if (rejections.length == 0) return false;
        let res = []
        for (let lead of rejections) {
            const leadExists = await prisma.lead.findFirst(
                {
                    where: {
                        email: lead.email
                    }
                }
            )
            if (leadExists) {
                const dataUpdated = await prisma.lead.update({
                    where: {
                        id: leadExists.id
                    },
                    data: {
                        qcResult: false,
                        qcReason: lead.reason
                    }
                })
                res.push(dataUpdated)
            }
        }
        return res;
    }
    catch (e) {
        console.log(e);
    }
}