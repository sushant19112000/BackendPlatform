const prisma = require("../../../db/dbConnection");
const templateValidation = require("./templateValidationTransferPhase");

const transferPhaseValidation = async (transferPhaseData, campaignId, uploadId, pacingId, volumeId) => {
    try {
        const dataChangedLeads = [];
        const leadsForLeadTemplateValidation = [];
        let useTemplateValidation = {};

        // ✅ Fetch all existing leads for this campaign in one go
        const existingLeads = await prisma.lead.findMany({
            where: { campaignId },
            select: {
                email: true,
                data: true, // assuming data.basicValidatedData lives here
            }
        });

        // ✅ Build lookup map { email -> leadExists }
        const leadMap = new Map();
        for (const lead of existingLeads) {
            leadMap.set(lead.email, lead);
        }

        // ✅ Loop through transfer data and compare in-memory
        for (const lead of transferPhaseData) {
            if (lead.email) {
                const leadExists = leadMap.get(lead.email);

                if (leadExists && leadExists.phase1Validation) {
                    const basicValidatedData = leadExists.data
                    const dataError = [];

                    for (let field in lead) {
                        if (basicValidatedData[field] !== lead[field]) {
                            dataError.push({
                                field,
                                old: basicValidatedData[field],
                                new: lead[field]
                            });
                        }
                    }

                    if (dataError.length === 0) {
                        leadsForLeadTemplateValidation.push(lead);
                    } else {
                        dataChangedLeads.push({ ...lead, dataChanged: dataError });
                    }
                } else {
                    dataChangedLeads.push({ ...lead, dataChanged: "Email doesn't exist in campaign" });
                }
            } else {
                dataChangedLeads.push({ ...lead, dataChanged: "Email missing in lead" });
            }
        }

        // ✅ Phase 2 validation (if any leads passed unchanged)
        if (leadsForLeadTemplateValidation.length > 0) {
            const volume = await prisma.volume.findFirst({ where: { id: volumeId } });

            if (volume && volume.leadTemplateValidation) {
                useTemplateValidation = await templateValidation(
                    leadsForLeadTemplateValidation,
                    volume.leadTemplateValidation,
                    campaignId,
                    uploadId
                ) || {};
            }
        }

        return { dataChangedLeads, ...useTemplateValidation };
    } catch (e) {
        console.error("Error in transferPhaseValidation:", e);
        return { error: e.message };
    }
};


module.exports=transferPhaseValidation;