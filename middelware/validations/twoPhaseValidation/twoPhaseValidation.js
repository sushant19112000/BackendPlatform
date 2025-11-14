const prisma = require("../../../db/dbConnection");
const basicValidation = require("./basicValidation");
const templateValidation = require('./templateValidation');
const twoPhaseValidation = async (data, profiles, campaignId, uploadId, pacingId, volumeId) => {
    try {
        // Get all existing emails in one query for this campaign
        const existingLeads = await prisma.lead.findMany({
            where: { campaignId },
            select: { email: true }
        });

        const { basicValidationProfile, templateValidationProfile } = profiles;


        // const useBasicValidation = await basicValidation(data, basicValidationProfile, existingLeads);

        // let useTemplateValidation = {
        //     totalRows: 0,
        //     validRowsCount: 0,
        //     errorRowsCount: 0,
        //     errors: [],
        //     validData: []
        // };

        // if (useBasicValidation.validRowsCount > 0) {
        //     useTemplateValidation = await templateValidation(useBasicValidation.validData,templateValidationProfile, campaignId, uploadId, pacingId, volumeId)
        // }

        //  console.log(templateValidationProfile[contentTitle],'profile')
        // const totalRows = useBasicValidation[totalRows];
        // let validRowsCount = 0;
        // let validData = [];
        // let errorRowsCount = useBasicValidation[errorRowsCount];
        // let errors=useBasicValidation[errors];
        // if (useTemplateValidation[validRowsCount] && useTemplateValidation[validRowsCount] > 0) {
        //     validRowsCount = useTemplateValidation[validRowsCount];
        //     validData = useTemplateValidation[validData];
        // }
        // if (useTemplateValidation.errorRowsCount && useTemplateValidation.errorRowsCount > 0) {
        //     errorRowsCount += useTemplateValidation[errorRowsCount]
        //     errors = [
        //         ...(useBasicValidation[errors] || []),
        //         ...(useTemplateValidation[errors] || [])
        //     ];
        // }


        // return { totalRows, validRowsCount, errorRowsCount, errors, validData };
        const useBasicValidation = await basicValidation(data, basicValidationProfile, existingLeads);

        let useTemplateValidation = {
            totalRows: 0,
            validRowsCount: 0,
            errorRowsCount: 0,
            errors: [],
            validData: []
        };

        if (useBasicValidation.validRowsCount > 0) {
           
            useTemplateValidation = await templateValidation(
                useBasicValidation.validData,
                templateValidationProfile,
                campaignId,
                uploadId,
                pacingId,
                volumeId
            );
        }

       

        const totalRows = useBasicValidation.totalRows;
        let validRowsCount = 0;
        let validData = [];
        let errorRowsCount = useBasicValidation.errorRowsCount;
        let errors = useBasicValidation.errors;

        if (useTemplateValidation.validRowsCount && useTemplateValidation.validRowsCount > 0) {
            validRowsCount = useTemplateValidation.validRowsCount;
            validData = useTemplateValidation.validData;
        }

        if (useTemplateValidation.errorRowsCount && useTemplateValidation.errorRowsCount > 0) {
            errorRowsCount += useTemplateValidation.errorRowsCount;
            errors = [
                ...(useBasicValidation.errors || []),
                ...(useTemplateValidation.errors || [])
            ];
        }

        return { totalRows, validRowsCount, errorRowsCount, errors, validData };
    }
    catch (e) {
        console.log(e);
    }
}


module.exports = { twoPhaseValidation };