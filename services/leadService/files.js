const prisma = require('../../db/dbConnection');

// ✅ Add a new file entry
const addFileInfo = async (campaignId, fileData) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const newFiles = [...(campaign.filesInfo || []), fileData];

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { filesInfo: newFiles }
        });

        return updatedCampaign;
        
    } catch (e) {
        console.log(e);
    }
};

// ✅ Edit an existing file entry (by index)
const updateFileInfo = async (campaignId,fileId, newData) => {
    try {
          const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const currentFiles = campaign.filesInfo || [];

        const fileIndex = currentFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
            throw new Error("File with given ID not found");
        }

        // Merge existing file with new data (so partial updates work)
        currentFiles[fileIndex] = { ...currentFiles[fileIndex], ...newData };

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { filesInfo: currentFiles }
        });
        
        return {updatedCampaign,updatedEntry:newData};
        // return updatedCampaign.filesInfo;
    } catch (e) {
        console.log(e);
    }
};

// ✅ Delete file entry (by index)
const deleteFileInfo = async (campaignId, fileId) => {
    try {
        // return updatedCampaign;
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const currentFiles = campaign.filesInfo || [];

        const newFiles = currentFiles.filter(f => f.id !== fileId);
        const deletedFile= currentFiles.filter(f => f.id==fileId);
        if (newFiles.length === currentFiles.length) {
            throw new Error("File with given ID not found");
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { filesInfo: newFiles }
        });

        // return updatedCampaign.filesInfo;
        return {updatedCampaign,deletedEntry:deletedFile};

    } catch (e) {
        console.log(e);
    }
};

module.exports = { addFileInfo, updateFileInfo, deleteFileInfo };
