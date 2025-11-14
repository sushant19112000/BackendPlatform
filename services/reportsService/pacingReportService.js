const prisma = require('../../db/dbConnection')

const addPacingReport = async (data) => {
    try {
        await prisma.pacingReport.create({ data: data })
        return true;
    }
    catch (e) {
        console.log(e);
    }
}

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


const autoGenerateReports = async () => {
    try {
        const currentDate = new Date();

        // todayDueReport
        const todayDuePacings = await prisma.pacing.findMany({
            where: { scheduledFor: { equals: currentDate } }
        })

        const todayDuePacingReport = {
            type: 'TODAY',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getFormatedPacingsData(todayDuePacings)
        }

        await addPacingReport(todayDuePacingReport)


        //overdueReport 
        const overduePacings = await prisma.pacing.findMany({
            where: { scheduledFor: { lt: currentDate } }
        })

        const overdueDuePacingReport = {
            type: 'OVERDUE',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getFormatedPacingsData(overduePacings)
        }

        await addPacingReport(overdueDuePacingReport)


        //pausedPacingReport
        const pausedPacings = await prisma.pacing.findMany({
            where: { status: "paused" }
        })

        const pausedPacingReport = {
            type: 'PAUSED',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getFormatedPacingsData(pausedPacings)
        }
        await addPacingReport(pausedPacingReport);

        // completedPacingReport 
        const completedpacings = await prisma.pacing.findMany({
            where: { status: 'completed' },

        })
        const completedPacingReport = {
            type: 'COMPLETED',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getFormatedPacingsData(completedpacings)
        }
        await addPacingReport(completedPacingReport);

        // all campaign Report 

        const allPacings = await prisma.pacing.findMany();

        const allPacingReport = {
            type: 'ALL',  // must match the enum value
            generatedType: 'AUTO',  // depends on how you define this enum
            data: getFormatedPacingsData(allPacings)
        }
        await addPacingReport(allPacingReport);
        return true;
    }
    catch (e) {
        console.log(e)
    }
}

const adminGeneratedReports = async (data) => {
    try {
        const newReport = await prisma.pacingReport.create({ data: data });
        return newReport;
    }
    catch (e) {
        console.log(e);
    }
}

const getPacingReport = async (type) => {
    try {
        let uppercasetype=type.toUpperCase();
        const reports = await prisma.pacingReport.findMany({
            where: { type: uppercasetype }
        })
        return reports;
    }
    catch (e) {
        console.log(e)
    }
}

const updatePacingReport = async (id, data) => {
    try{
        const updatedReport = await prisma.pacingReport.update({ where: { id: id }, data: data })
        return updatedReport;
    }
    catch (e) {
        console.log(e);
    }
}

const deletePacingReport=async(id)=>{
    try{
      
        const deletePacingReport= await prisma.pacingReport.delete({where:{id:pacingReportId}});
        return true;
    }
    catch(e){
        console.log(e);
    }
}

module.exports = { getPacingReport, updatePacingReport, adminGeneratedReports, autoGenerateReports,deletePacingReport }