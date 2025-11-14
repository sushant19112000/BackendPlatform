const prisma = require('../../db/dbConnection');

// Add new campaign info (merge keys from data)
const addCampaignInfo = async (campaignId, data) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        let newInfo = { ...campaign.info, ...data };

        let updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { info: newInfo }
        });

        return updatedCampaign;
    } catch (e) {
        console.log(e);
    }
}

// Update a single info key
const updateCampaignInfo = async (campaignId, infoKey, value) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });

        if (!(infoKey in campaign.info)) return false;

        let newInfo = { ...campaign.info, [infoKey]: value };
        
        let updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { info: newInfo }
        });

        return {updatedCampaign,updatedEntry:value};
    } catch (e) {
        console.log(e);
    }
}

// Delete a single info key
const deleteCampaignInfo = async (campaignId, infoKey) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });

        if (!(infoKey in campaign.info)) return false;

        let newInfo = { ...campaign.info };
        const deletedInfo= newInfo[infoKey];
        delete newInfo[infoKey];
       
        let updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { info: newInfo }
        });

        return {updatedCampaign,deletedEntry:deletedInfo};
    } catch (e) {
        console.log(e);
    }
}

module.exports = { addCampaignInfo, updateCampaignInfo, deleteCampaignInfo };
