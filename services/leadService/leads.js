const prisma = require('../../db/dbConnection')

const addLead = async (data, campaignId) => {
    try {
        const existingLead = await prisma.lead.findFirst({ where: { linkedin: data.linkedin } });
        if (existingLead) return false;
        const newLead = await prisma.lead.create({ data: data })
    }
    catch (e) {
        console.log(e)
    }
}


const fetchAllLeads = async () => {
    try {
        const leads = await prisma.lead.findMany();
        return leads;
    }
    catch (e) {
        console.log(e)
    }
}

const fetechAllCampaignLeads = async (campaignId) => {
    try {
        const campaignExist = await prisma.campaign.findFirst({ where: { campaignId: campaignId }, include: leads })
        if (!campaignExist) return false;
        return campaignExist.leads;
    }
    catch (e) {
        console.log(e)
    }
}


const fetchPacingLeads = async (pacingId, type) => {
    try {
        // const volumePacingLeads = await prisma.$queryRawUnsafe(`
        // SELECT v.id AS volume_id,
        //  v.name AS volume_name,
        //  v.headers,
        //  p.id AS pacing_id,
        //  l.id AS lead_id,
        //  l*
        //  FROM volume v
        //  JOIN pacing p ON p.volumeId = v.id
        //  JOIN lead l ON l.pacingId = p.id
        //  WHERE p.id = ${pacingId}
        // `);
        let pacing;

        pacing = await prisma.pacing.findFirst({
            where: { id: pacingId },
            include: {
                volume: true,
                leads: true
            }
        });





        const { volume, ...pacingOnly } = pacing;

        let headers = [];

        let leadTemplateFieldRules = volume.leadTemplate["fieldRules"];
        for (let f in leadTemplateFieldRules) {
            headers.push([f, leadTemplateFieldRules[f]['label']]);
        }

        // console.log(leadTemplate,'l')
        console.log(headers, 'headers')
        const data = {
            headers: headers,
            leads: pacing.leads
        };


        // const pacingLeads= await prisma.pacing.findFirst({where:{id:pacingId},include:{leads}});
        return data;
    }
    catch (e) {
        console.log(e)
    }
}


const editLead = async (id, campaignId, data) => {
    try {
        const leadExist = await prisma.lead.findFirst({ where: { id: id, campaignId: campaignId } })
        if (!leadExist) return false;
        const updatedLead = await prisma.lead.update({ where: { id: leadExist.id }, data: data })
        return true;
    }
    catch (e) {
        console.log(e)
    }
}


const deleteLead = async () => {
    try {
        const leadExist = await prisma.lead.findFirst({ where: { email: email, campaignId: campaignId } })
        if (!leadExist) return false;
        const deletedLead = await prisma.lead.delete({ where: { id: leadExist.id } });
        return true;
    }
    catch (e) {
        console.log(e);
    }
}


module.exports = { addLead, fetchAllLeads, editLead, deleteLead, fetechAllCampaignLeads, fetchPacingLeads }

// note all the data operations will be done with csv files 