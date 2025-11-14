// const prisma = require('../../db/dbConnection');

// // ✅ Add a new update entry
// const addUpdate = async (campaignId, updateData) => {
//     try {
//         if (!updateData.id) {
//             throw new Error("Update data must include an 'id'");
//         }

//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         const newUpdates = [...(campaign.updates || []), updateData];

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { updates: newUpdates }
//         });

//         return updatedCampaign;
//     } catch (e) {
//         console.log(e);
//     }
// };

// // ✅ Edit an update entry (by update id)
// const editUpdate = async (campaignId, updateId, newData) => {
//     try {
//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         const currentUpdates = campaign.updates || [];

//         const updateIndex = currentUpdates.findIndex(u => u.id === updateId);
//         if (updateIndex === -1) {
//             throw new Error("Update with given ID not found");
//         }

//         // Merge existing update with new data
//         currentUpdates[updateIndex] = { ...currentUpdates[updateIndex], ...newData };

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { updates: currentUpdates }
//         });

//         return updatedCampaign.updates;
//     } catch (e) {
//         console.log(e);
//     }
// };

// // ✅ Delete an update entry (by update id)
// const deleteUpdate = async (campaignId, updateId) => {
//     try {
//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         const currentUpdates = campaign.updates || [];

//         const newUpdates = currentUpdates.filter(u => u.id !== updateId);

//         if (newUpdates.length === currentUpdates.length) {
//             throw new Error("Update with given ID not found");
//         }

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { updates: newUpdates }
//         });

//         return updatedCampaign.updates;
//     } catch (e) {
//         console.log(e);
//     }
// };

// module.exports = { addUpdate, editUpdate, deleteUpdate };


const prisma = require('../../db/dbConnection');

// ✅ Add a new update entry
const addUpdate = async (campaignId, updateData) => {
    try {
        if (!updateData.id) {
            throw new Error("Update data must include an 'id'");
        }

        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const newUpdates = [...(campaign.updates || []), updateData];

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { updates: newUpdates }
        });

        return updatedCampaign;

    } catch (e) {
        console.log(e);
    }
};

// ✅ Edit an update entry (by update id)
const editUpdate = async (campaignId, updateId, newData) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const currentUpdates = campaign.updates || [];

        const updateIndex = currentUpdates.findIndex(u => u.id === updateId);
        if (updateIndex === -1) {
            throw new Error("Update with given ID not found");
        }

        // Merge existing update with new data (partial updates allowed)
        currentUpdates[updateIndex] = { ...currentUpdates[updateIndex], ...newData };

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { updates: currentUpdates }
        });

        return { updatedCampaign, updatedEntry: currentUpdates[updateIndex] };

    } catch (e) {
        console.log(e);
    }
};

// ✅ Delete an update entry (by update id)
const deleteUpdate = async (campaignId, updateId) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
        const currentUpdates = campaign.updates || [];

        const newUpdates = currentUpdates.filter(u => u.id !== updateId);
        const deletedEntry = currentUpdates.find(u => u.id === updateId);

        if (!deletedEntry) {
            throw new Error("Update with given ID not found");
        }

        const updatedCampaign = await prisma.campaign.update({
            where: { id: campaign.id },
            data: { updates: newUpdates }
        });

        return { updatedCampaign, deletedEntry };

    } catch (e) {
        console.log(e);
    }
};

module.exports = { addUpdate, editUpdate, deleteUpdate };
