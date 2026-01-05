var express = require('express');
var router = express.Router();
var { addBrief, getBriefs, getBrief, editBrief, addQuote, getBriefsFilterCounts, updateQuote, deleteQuote } = require('../services/leadService/brief');
const { message } = require('../db/dbConnection');
const prisma = require('../db/dbConnection');
const roles = [1, 2, 3]
const url="#"
// Fetch all briefs
router.get('/', async (req, res) => {
    try {
        const briefs = await getBriefs();
        if(!briefs){
            return res.status(400).json({message:"Error fetching Briefs"})
        }
        res.status(200).json({
            message: "Data fetched successfully",
            data: briefs
        });
    } catch (error) {
        console.error("Error fetching briefs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/counts', async (req, res) => {
    try {
        const briefsFilterCounts = await getBriefsFilterCounts();
        if(!briefsFilterCounts){
            return res.status(400).json({message:"Error fetching briefs counts"})
        }
        res.status(200).json({
            message: "Data fetched successfully",
            data: briefsFilterCounts
        });
    } catch (error) {
        console.error("Error fetching briefs Counts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Fetch a single brief by ID
router.get('/:id', async (req, res) => {
    try {
        const briefId = Number(req.params.id);
        if (isNaN(briefId)) {
            return res.status(400).json({ message: "Invalid brief ID" });
        }

        const brief = await getBrief(briefId);
        if (!brief) {
            return res.status(404).json({ message: "Brief not found" });
        }

        res.status(200).json({
            message: "Data fetched successfully",
            data: brief
        });
    } catch (error) {
        console.error("Error fetching brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// // Add a new brief
// router.post('/', async (req, res) => {
//     try {
//         const newBrief = await addBrief(req.body);

//         if (!newBrief) {
//             return res.status(400).json({ message: "Failed to add brief" });
//         }
        

        
//         const newNotification = await prisma.notification.create({
//             data: {
//                 message: `Asset "${newBrief.name}" has been updated in ${updatedCampaign.name}.`,
//                 notificationPriority: { connect: { id: 3 } },
//                 url,
//                 type: "activity",
//             }
//         });

//         await prisma.roleNotification.createMany({
//             data: roles.map(roleId => ({
//                 notificationId: newNotification.id,
//                 roleId,
//             })),
//         });

//         req.io.emit('activity', {
//             type: 'activity',
//             message: `Asset "${updatedEntry.title}" has been updated in ${updatedCampaign.name}.`,
//             payload: { url, priorityId: 3, type: "activity" }
//         });
//         res.status(201).json({
//             message: "Brief added successfully",
//             data: newBrief
//         });
//     } catch (error) {
//         console.error("Error adding brief:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// router.post('/:id/quotes', async (req, res) => {
//     try {
//         const  id  = req.params.id;

//         const updatedBrief = await addQuote(id, req.body);
//     //   console.log(id,req.body,'bre')
//         if (!updatedBrief) {
//             return res.status(400).json({ message: "Failed to update brief" });
//         }

//         res.status(200).json({
//             message: "Brief updated successfully",
//             data: updatedBrief
//         });

//     } catch (error) {
//         console.error("Error updating brief:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// // Edit an existing brief
// router.put('/:id', async (req, res) => {
//     try {
//         const  id  = req.params.id;

//         const updatedBrief = await editBrief(id, req.body);
//     //   console.log(id,req.body,'bre')
//         if (!updatedBrief) {
//             return res.status(400).json({ message: "Failed to update brief" });
//         }

//         res.status(200).json({
//             message: "Brief updated successfully",
//             data: updatedBrief
//         });

//     } catch (error) {
//         console.error("Error updating brief:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


// // Edit an existing brief
// router.put('/:id/quotes/:quoteId', async (req, res) => {
//     try {
//         const  id  = Number(req.params.id);
//         const quoteId= Number(req.params.quoteId);
   
//         const updatedBriefQuote = await updateQuote(id,quoteId,req.body);
//     //   console.log(id,req.body,'bre')
//         if (!updatedBriefQuote) {
//             return res.status(400).json({ message: "Failed to update brief quote" });
//         }

//         res.status(200).json({
//             message: "Brief quote updated successfully",
//             data: updatedBriefQuote
//         });

//     } catch (error) {
//         console.error("Error updating brief:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });



// // Edit an existing brief
// router.delete('/:id/quotes/:quoteId', async (req, res) => {
//     try {
//         const  id  = Number(req.params.id);
//         const quoteId= Number(req.params.quoteId);
        
//         const updatedBriefQuote = await deleteQuote(id,quoteId);
//        console.log(id,quoteId,'delete brief')
//         if (!updatedBriefQuote) {
//             return res.status(400).json({ message: "Failed to update brief quote" });
//         }

//         res.status(200).json({
//             message: "Brief quote updated successfully",
//             data: updatedBriefQuote
//         });

//     } catch (error) {
//         console.error("Error updating brief:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


// // Update an existing client
// router.put('/:id', async (req, res) => {
//     try {
//         const clientId = Number(req.params.id);
//         if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });

//         const updatedClient = await editClient(clientId, req.body);
//         if (!updatedClient) return res.status(404).json({ message: "Client not found or update failed" });

//         res.status(200).json({ message: "Client updated successfully", data: updatedClient });
//     } catch (error) {
//         console.error("Error updating client:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });

// // Delete a client
// router.delete('/:id', async (req, res) => {
//     try {
//         const clientId = Number(req.params.id);
//         if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });

//         const deletedClient = await deleteClient(clientId);
//         if (!deletedClient) return res.status(404).json({ message: "Client not found or already deleted" });

//         res.status(200).json({ message: "Client deleted successfully" });
//     } catch (error) {
//         console.error("Error deleting client:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });



// Add a new brief
router.post('/', async (req, res) => {
    try {
        const newBrief = await addBrief(req.body);

        if (!newBrief) {
            return res.status(400).json({ message: "Failed to add brief" });
        }

        const newNotification = await prisma.notification.create({
            data: {
                message: `Brief "${newBrief.name}" has been added.`,
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
            message: `Brief "${newBrief.name}" has been added.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        res.status(201).json({
            message: "Brief added successfully",
            data: newBrief
        });

    } catch (error) {
        console.error("Error adding brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Add quote to brief
router.post('/:id/quotes', async (req, res) => {
    try {
        const id = req.params.id;

        const updatedBrief = await addQuote(id, req.body);
        if (!updatedBrief) {
            return res.status(400).json({ message: "Failed to update brief" });
        }

        const newNotification = await prisma.notification.create({
            data: {
                message: `A new quote has been added to Brief #${id}.`,
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
            message: `A new quote has been added to Brief #${id}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        res.status(200).json({
            message: "Brief updated successfully",
            data: updatedBrief
        });

    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Edit an existing brief
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const updatedBrief = await editBrief(id, req.body);
        if (!updatedBrief) {
            return res.status(400).json({ message: "Failed to update brief" });
        }

        const newNotification = await prisma.notification.create({
            data: {
                message: `Brief "${updatedBrief.name}" has been updated.`,
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
            message: `Brief "${updatedBrief.name}" has been updated.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        res.status(200).json({
            message: "Brief updated successfully",
            data: updatedBrief
        });

    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update quote in brief
router.put('/:id/quotes/:quoteId', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const quoteId = Number(req.params.quoteId);

        const updatedBriefQuote = await updateQuote(id, quoteId, req.body);
        if (!updatedBriefQuote) {
            return res.status(400).json({ message: "Failed to update brief quote" });
        }

        const newNotification = await prisma.notification.create({
            data: {
                message: `Quote #${quoteId} has been updated in Brief #${id}.`,
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
            message: `Quote #${quoteId} has been updated in Brief #${id}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        res.status(200).json({
            message: "Brief quote updated successfully",
            data: updatedBriefQuote
        });

    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Delete quote from brief
router.delete('/:id/quotes/:quoteId', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const quoteId = Number(req.params.quoteId);
        console.log('briefid',id,'quoteid',quoteId)
        const updatedBriefQuote = await deleteQuote(id, quoteId);
        if (!updatedBriefQuote) {
            return res.status(400).json({ message: "Failed to update brief quote" });
        }

        const newNotification = await prisma.notification.create({
            data: {
                message: `Quote #${quoteId} has been deleted from Brief #${id}.`,
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
            message: `Quote #${quoteId} has been deleted from Brief #${id}.`,
            payload: { url, priorityId: 3, type: "activity" }
        });

        res.status(200).json({
            message: "Brief quote updated successfully",
            data: updatedBriefQuote
        });

    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
