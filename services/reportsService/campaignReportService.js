const prisma = require('../../db/dbConnection')

const getCampaignReportDataFormat = (campaignData) => {
    let tempData = []
    for (let c of campaignData) {
        let currentLeads = c.leads.length || 0;
        let dueLeadCount = c.leadgoal - currentLeads
        let reportDataOb = { campaignId: c.id, campaignName: c.name, leadGoal: c.leadgoal, currentLeadCount: currentLeads, dueLeadCount, dueDate: c.duedate }
        tempData.push(reportDataOb)
    }
    return tempData;
}


const addCampaignReport = async (data) => {
    try {
        await prisma.campaignReport.create({data:data})
        return true;
    }
    catch (e) {
        console.log(e);
    }
}



export const autoGenerateReports = async () => {
    try {
        const currentDate = new Date();

        // todayDueReport
        const todayDueCampaigns = await prisma.campaign.findMany({
            where: { duedate: { equals: currentDate } },
            include: { leads: true }
        })

        const todayDueCampaignReport = {
            type: 'TODAY',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getCampaignReportDataFormat(todayDueCampaigns)
        }

        await addCampaignReport(todayDueCampaignReport)


        // overdue report 
        const overdueCampaigns = await prisma.campaign.findMany({
            where: { duedate: { lt: currentDate } }
        })
        const overdueDueCampaignReport = {
            type: 'OVERDUE',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getCampaignReportDataFormat(overdueCampaigns)
        }
        
        await addCampaignReport(overdueDueCampaignReport)


        // paused campaigns     
        const pausedCampaigns = await prisma.campaign.findMany({
            where: { status: "paused" }
        })

        const pausedCampaignReport = {
            type: 'PAUSED',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getCampaignReportDataFormat(pausedCampaigns)
        }
        await addCampaignReport(pausedCampaignReport);       

        // completedCampaignReport 
        const completedCampaigns = await prisma.campaign.findMany({
            where: { status: 'completed' }
        })
        const completedCampaignReport = {
            type: 'COMPLETED',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getCampaignReportDataFormat(pausedCampaigns)
        }
        await addCampaignReport(completedCampaignReport);

        // all campaign Report 

        const allCampaigns = await prisma.campaign.findMany();
        const allCampaignReport = {
            type: 'ALL',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getCampaignReportDataFormat(allCampaigns)
        }
        await addCampaignReport(allCampaignReport);
        return true;
    }
    catch (e) {
        console.log(e)
    }
}

export const adminGeneratedReports = async (data) => {
    try {
       const newReport=await prisma.campaignReport.create({data:data});
       return newReport;
    }
    catch (e) {
        console.log(e);
    }
}

export const getCampaignsReport = async (generatedType,type) => {
    try {
       const reports=await prisma.campaignReport.findMany({
        where:{type:type,generatedType:generatedType}
       })
    }
    catch (e) {
        console.log(e)
    }
}


export const updatedCampaignReport = async(id,data) => {
    try {
        const updatedReport=await prisma.campaignReport.update({where:{id:id},data:data})
        return updatedReport;
    }
    catch (e) {
        console.log(e);
    }
}