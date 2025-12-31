var express = require('express');
var router = express.Router();
var {
    fetchAllClientCampaigns,
    fetchCampaign,
    addCampaign,
    editCampaign,
    deleteCampaign,
    fetchCampaignFiles,
    fetchCampaignContent,
    fetchCampaignUpdates
} = require('../services/leadService/campaigns');
const { newCampaignNotification } = require('../services/notificationService/campaignNotifications');
const { addContent, updateContent, deleteContent } = require('../services/leadService/content');
const { addFileInfo, updateFileInfo, deleteFileInfo } = require('../services/leadService/files');
const { editUpdate, addUpdate, deleteUpdate } = require('../services/leadService/updates');
const { addCampaignInfo, updateCampaignInfo, deleteCampaignInfo } = require('../services/leadService/info');
const prisma = require('../db/dbConnection');
const { getCampaignDeliveries, getCampaignDelivery, addCampaignDeilvery } = require('../services/leadService/campaignDeliveries');
const roles = [1, 2, 3]
const multer = require('multer');
const storage = multer.memoryStorage();
const { parse } = require('csv-parse');
const { promisify } = require('util');
const parseAsync = promisify(parse); // Convert callback to Promise


const urlGenerator = (clientId, campaignId, type) => {
    return `/leadinsights/client/${clientId}/campaigns/${campaignId}/${type}`;
};

// 🗂 Multer setup for file upload (in memory)
const upload = multer({ storage });

// Campaigns crud
router.get('/', async (req, res) => {
    try {
        let filter = req.query.filter || 'None';
        // Remove surrounding quotes if present
        filter = filter.replace(/^"+|"+$/g, '');



        const campaigns = await fetchAllClientCampaigns(filter);
        return res.status(200).json({ message: "Data fetched successfully", data: campaigns });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});




// Fetch a specific campaign by ID
router.get('/:id', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const campaign = await fetchCampaign(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        return res.status(200).json({ message: "Data fetched successfully", data: campaign });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new campaign
router.post('/', async (req, res) => {
    try {
        const newCampaign = await addCampaign(req.body);

        // const newNotification=newCampaignNotification()
        if (!newCampaign) return res.status(400).json({ message: "Failed to add campaign" });

        let url = urlGenerator(newCampaign.clientId, newCampaign.id, "info")

        const newNotification = await prisma.notification.create({
            data: {
                message: `New Campaign "${newCampaign.name}" has been added.`,
                notificationPriority: {
                    connect: { id: 4 } // adjust priority as needed
                },
                url: url,
                type: "activity",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });
        // Emit the event to all connected clients
        req.io.emit('activity', {
            type: 'activity',
            message: `New Campaign "${newCampaign.name}" has been added.`,
            payload: { url: url, priorityId: 4, type: "activity" }
        });


        return res.status(201).json({ message: "Campaign added successfully", data: newCampaign });
    } catch (error) {
        console.error("Error adding campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update an existing campaign
router.put('/:id', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const updatedCampaign = await editCampaign(campaignId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Campaign not found or update failed" });

        // Emit the event to all connected clients
        req.io.emit('activity', {
            type: 'activity',
            message: `Campaign "${newCampaign.name}" has been updated.`,
            payload: { url: url, priorityId: 5, type: "activity" }
        });

        return res.status(200).json({ message: "Campaign updated successfully", data: updatedCampaign });
    } catch (error) {
        console.error("Error updating campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



// Delete a campaign
router.delete('/:id', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const deletedCampaign = await deleteCampaign(campaignId);
        if (!deletedCampaign) return res.status(404).json({ message: "Campaign not found or already deleted" });

        return res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



// Content crud
router.get('/:id/content', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const campaign = await fetchCampaignContent(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        return res.status(200).json({ message: "Data fetched successfully", data: [...campaign.content] });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



router.post('/:id/content', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        console.log(campaignId, 'cid')
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const updatedCampaign = await addContent(campaignId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Data not found" });

        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/content")

        const newNotification = await prisma.notification.create({
            data: {
                message: `New Asset "${req.body.title}" has been added in the ${updatedCampaign.name} .`,
                notificationPriority: {
                    connect: { id: 3 } // adjust priority as needed
                },
                url: url,
                type: "activity",

            },

        });

        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });


        // Emit the event to all connected clients
        req.io.emit('activity', {
            type: 'activity',
            message: `New Asset "${req.body.title}" has been added in the ${updatedCampaign.name} .`,
            payload: { url: url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Added successfully", data: updatedCampaign.content });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// router.put('/:id/content', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const contentId = Number(req.query.contentId)
//         if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

//         const updatedContent = await updateContent(campaignId, contentId, req.body);
//         if (!updatedContent) return res.status(404).json({ message: "Campaign not found" });

//         return res.status(200).json({ message: "Data fetched successfully", data: updatedContent });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });



router.put('/:id/content', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const contentId = Number(req.query.contentId);
        if (isNaN(campaignId) || isNaN(contentId)) return res.status(400).json({ message: "Invalid campaign ID or content ID" });

        const { updatedCampaign, updatedEntry } = await updateContent(campaignId, contentId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Data not found" });

        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/content");

        const newNotification = await prisma.notification.create({
            data: {
                message: `Asset "${updatedEntry.title}" has been updated in ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        req.io.emit('activity', {
            type: 'activity',
            message: `Asset "${updatedEntry.title}" has been updated in ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Updated successfully", data: updatedCampaign.content });
    } catch (error) {
        console.error("Error updating content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// router.delete('/:id/content', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const contentId = Number(req.query.contentId)
//         if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });
//         const deletedContent = await deleteContent(campaignId, contentId);
//         if (!deletedContent) return res.status(404).json({ message: "Campaign not found" });

//         return res.status(200).json({ message: "Data fetched successfully", data: deletedContent });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });


router.delete('/:id/content', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const contentId = Number(req.query.contentId);
        if (isNaN(campaignId) || isNaN(contentId)) return res.status(400).json({ message: "Invalid campaign ID or content ID" });

        const { updatedCampaign, deletedEntry } = await deleteContent(campaignId, contentId);
        if (!updatedCampaign) return res.status(404).json({ message: "Content not found" });

        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/content");

        const newNotification = await prisma.notification.create({
            data: {
                message: `Asset "${deletedEntry.title}" has been deleted from ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        req.io.emit('activity', {
            type: 'activity',
            message: `Asset "${deletedEntry.title}" has been deleted from ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Deleted successfully", data: updatedCampaign.content });
    } catch (error) {
        console.error("Error deleting content:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// files Crud
router.get('/:id/files', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const campaign = await fetchCampaignFiles(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        return res.status(200).json({ message: "Data fetched successfully", data: [...campaign.filesInfo] });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// files
router.post('/:id/files', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const updatedCampaign = await addFileInfo(campaignId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Campaign not found" });
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/files")

        const newNotification = await prisma.notification.create({
            data: {
                message: `New file "${req.body.name}" has been added in the ${updatedCampaign.name} `,
                notificationPriority: {
                    connect: { id: 3 } // adjust priority as needed
                },
                url: url,
                type: "activity",
            }
        });
        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });
        // Emit the event to all connected clients
        req.io.emit('activity', {
            type: 'activity',
            message: `New file "${req.body.name}" has been added in the ${updatedCampaign.name} .`,
            payload: { url: url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data fetched successfully", data: updatedCampaign.filesInfo });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// router.put('/:id/files', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const fileId = Number(req.query.fileId);
//         if (isNaN(campaignId) || isNaN(fileId)) return res.status(400).json({ message: "Invalid campaign id or file id" });

//         const files = await updateFileInfo(campaignId, fileId, req.body);
//         if (!files) return res.status(404).json({ message: "Data not found" });

//         return res.status(200).json({ message: "Data Updated successfully", data: [...files] });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });

router.put('/:id/files', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const fileId = Number(req.query.fileId);
        if (isNaN(campaignId) || isNaN(fileId)) return res.status(400).json({ message: "Invalid campaign id or file id" });

        const { updatedCampaign, updatedEntry } = await updateFileInfo(campaignId, fileId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Data not found" });

        // Generate URL for notification
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/files");

        // Create notification
        const newNotification = await prisma.notification.create({
            data: {
                message: `File "${updatedEntry.name}" has been updated in ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        // Link notification to roles
        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        // Emit event
        req.io.emit('activity', {
            type: 'activity',
            message: `File "${updatedEntry.name}" has been updated in ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Updated successfully", data: updatedCampaign.filesInfo });
    } catch (error) {
        console.error("Error updating file:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// router.delete('/:id/files', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const fileId = Number(req.query.fileId);
//         if (isNaN(campaignId) || isNaN(fileId)) return res.status(400).json({ message: "Invalid campaign id or file id" });

//         const files = await deleteFileInfo(campaignId, fileId);
//         if (!files) return res.status(404).json({ message: "Data not found" });

//         return res.status(200).json({ message: "Data Deleted successfully", data: [...files] });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });

router.delete('/:id/files', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const fileId = Number(req.query.fileId);
        if (isNaN(campaignId) || isNaN(fileId)) return res.status(400).json({ message: "Invalid campaign id or file id" });

        const { updatedCampaign, deletedEntry } = await deleteFileInfo(campaignId, fileId);
        if (!updatedCampaign) return res.status(404).json({ message: "File not found" });

        // Generate URL for notification
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "resources/files");

        // Create notification
        const newNotification = await prisma.notification.create({
            data: {
                message: `File "${deletedEntry[0].name}" has been deleted from ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        // Link notification to roles
        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        // Emit event
        req.io.emit('activity', {
            type: 'activity',
            message: `File "${deletedEntry[0].name}" has been deleted from ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Deleted successfully", data: updatedCampaign.filesInfo });
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Updates

router.get('/:id/updates', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);

        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const campaign = await fetchCampaignUpdates(campaignId);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });

        return res.status(200).json({ message: "Data fetched successfully", data: [...campaign.updates] });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/:id/updates', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);

        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const updatedCampaign = await addUpdate(campaignId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Campaign not found" });
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "activity")
        const newNotification = await prisma.notification.create({
            data: {
                message: `New Update "${req.body.title}" has been added in the ${updatedCampaign.name} . `,
                notificationPriority: {
                    connect: { id: 3 } // adjust priority as needed
                },
                url: url,
                type: "activity",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        // Emit the event to all connected clients
        req.io.emit('activity', {
            type: 'activity',
            message: `New Update "${req.body.title}" has been added in the ${updatedCampaign.name} .`,
            payload: { url: url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Data Uploaded successfully", data: [...updates] });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// router.put('/:id/updates', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const updateId = Number(req.query.updateId);
//         if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

//         const updates = await editUpdate(campaignId, updateId, req.body);
//         if (!updates) return res.status(404).json({ message: "Data not found" });

//         return res.status(200).json({ message: "Data Updated successfully", data: [...updates] });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });


router.put('/:id/updates', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const updateId = Number(req.query.updateId);

        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const { updatedCampaign, updatedEntry } = await editUpdate(campaignId, updateId, req.body);
        if (!updatedCampaign) return res.status(404).json({ message: "Data not found" });

        // Generate URL for notification
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "updates");

        // Create notification
        const newNotification = await prisma.notification.create({
            data: {
                message: `Update "${updatedEntry.title}" has been edited in ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        // Link notification to roles
        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        // Emit event
        req.io.emit('activity', {
            type: 'activity',
            message: `Update "${updatedEntry.title}" has been edited in ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "updates" }
        });

        return res.status(200).json({ message: "Data Updated successfully", data: updatedCampaign.updates });
    } catch (error) {
        console.error("Error editing update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// router.delete('/:id/updates', async (req, res) => {
//     try {
//         const campaignId = Number(req.params.id);
//         const updateId = Number(req.query.updateId);
//         if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

//         const updates = await deleteUpdate(campaignId, updateId);
//         if (!updates) return res.status(404).json({ message: "Campaign not found" });

//         return res.status(200).json({ message: "Data fetched successfully", data: [...updates] });
//     } catch (error) {
//         console.error("Error fetching campaign:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// });


router.delete('/:id/updates', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const updateId = Number(req.query.updateId);

        if (isNaN(campaignId)) return res.status(400).json({ message: "Invalid campaign ID" });

        const { updatedCampaign, deletedEntry } = await deleteUpdate(campaignId, updateId);
        if (!updatedCampaign) return res.status(404).json({ message: "Update not found" });

        // Generate URL for notification
        let url = urlGenerator(updatedCampaign.clientId, updatedCampaign.id, "updates");

        // Create notification
        const newNotification = await prisma.notification.create({
            data: {
                message: `Update "${deletedEntry.title}" has been deleted from ${updatedCampaign.name}.`,
                notificationPriority: { connect: { id: 3 } },
                url,
                type: "activity",
            }
        });

        // Link notification to roles
        await prisma.roleNotification.createMany({
            data: roles.map(roleId => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        // Emit event
        req.io.emit('activity', {
            type: 'activity',
            message: `Update "${deletedEntry.title}" has been deleted from ${updatedCampaign.name}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        return res.status(200).json({ message: "Update deleted successfully", data: updatedCampaign.updates });
    } catch (error) {
        console.error("Error deleting update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



// campaign info routes

// ➕ Add new info (merge with existing)
router.post('/:id/info', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);

        if (isNaN(campaignId)) {
            return res.status(400).json({ message: "Invalid campaign ID" });
        }

        const info = await addCampaignInfo(campaignId, req.body);
        if (!info) {
            return res.status(404).json({ message: "Campaign not found or update failed" });
        }

        return res.status(200).json({ message: "Campaign info added successfully", data: info });
    } catch (error) {
        console.error("Error adding campaign info:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ✏️ Update a specific info key
router.put('/:id/info', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const infoKey = Object.keys(req.body)[0]
        if (isNaN(campaignId)) {
            return res.status(400).json({ message: "Invalid campaign ID" });
        }

        const updatedInfo = await updateCampaignInfo(campaignId, infoKey, req.body[infoKey]);
        if (!updatedInfo) {
            return res.status(404).json({ message: "Campaign not found or update failed" });
        }

        return res.status(200).json({ message: "Campaign info updated successfully", data: updatedInfo });
    } catch (error) {
        console.error("Error updating campaign info:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// 🗑️ Delete a specific info key
router.delete('/:id/info', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const infoKey = req.query.infoKey;

        if (isNaN(campaignId)) {
            return res.status(400).json({ message: "Invalid campaign ID" });
        }

        const deletedCampaignInfo = await deleteCampaignInfo(campaignId, infoKey);
        if (!deletedCampaignInfo) {
            return res.status(404).json({ message: "Campaign not found or key does not exist" });
        }

        return res.status(200).json({ message: "Campaign info deleted successfully", data: deletedCampaignInfo });
    } catch (error) {
        console.error("Error deleting campaign info:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



// campaignDeliveries for the campaign
router.get('/:id/deliveries', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);

        const campaignDeliveries = await getCampaignDeliveries(campaignId);
        res.status(200).json({
            message: "Data fetched successfully",
            data: campaignDeliveries
        });
    } catch (error) {
        console.error("Error fetching briefs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// campaignDeliveries for the campaign
router.get('/:id/deliveries/:deliveryId', async (req, res) => {
    try {
        const campaignId = Number(req.params.id);
        const deliveryId = Number(req.params.deliveryId);
        const campaignDelivery = await getCampaignDelivery(deliveryId);
        res.status(200).json({
            message: "Data fetched successfully",
            data: campaignDelivery
        });
    } catch (error) {
        console.error("Error fetching briefs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})
// 📦 POST /campaign/:id/deliveries
router.post('/deliveries/:id', upload.single('file'), async (req, res) => {
    try {

        const campaignId = parseInt(req.params.id);

        const file = req.file;
        const csvString = file.buffer.toString();
        const leads = await parseAsync(csvString, {
            columns: true,
            skip_empty_lines: true
        });
        const filename = file.originalname;
        const { date } = req.body;

        if (!req.file || !date) {
            return res.status(400).json({ message: 'Date and file are required.' });
        }


        // 🧠 Prepare delivery data
        const data = {
            fileName: filename,
            date: new Date(date),
            leads,
        };

        // 💾 Save to DB
        const { newDelivery, campaign } = await addCampaignDeilvery(campaignId, data);



        if (!newDelivery) {
            return res.status(400).json({ message: 'Error adding delivery' });
        }


        const newNotification = await prisma.notification.create({
            data: {
                message: `New Delivery ${newDelivery.fileName} has been added for ${campaign.name}`,
                notificationPriority: { connect: { id: 3 } },
                url: "#",
                type: "delivery",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        req.io.emit('delivery', {
            type: 'delivery',
            message: `A new delivery "${newDelivery.fileName}" has been added to ${campaign.name}.`,
            payload: { url: "#", priorityId: 4, type: "delivery", role: "admin" }
        });

        res.status(200).json({
            message: 'Data uploaded successfully ✅',
            data: newDelivery,
        });
    } catch (error) {
        console.error('❌ Error adding delivery:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
