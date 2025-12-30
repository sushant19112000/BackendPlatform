var express = require('express');
var router = express.Router();
const prisma = require('../db/dbConnection');
const { fetchUserMessages } = require('../services/chatService/chat');


// Fetch all leads
router.get('/:userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const messages=await fetchUserMessages(userId)
        return res.status(200).json(messages);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});


// Add a new lead
router.post('/', async (req, res) => {
    try {
        const newLead = await addLead(req.body);
        if (!newLead) return res.status(400).json({ message: "Failed to add lead" });
        res.status(201).json({ message: "Lead added successfully", data: newLead });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Update a lead
router.put('/:campaignId/:id', async (req, res) => {
    try {
        const campaignId = Number(req.params.campaignId);
        const id = Number(req.params.id);
        const data = req.body;

        if (isNaN(campaignId) || isNaN(id)) {
            return res.status(400).json({ message: "Invalid campaign ID or lead ID" });
        }

        const updatedLead = await editLead(id, campaignId, data);
        if (!updatedLead) {
            return res.status(404).json({ message: "Lead not found or update failed" });
        }

        res.status(200).json({ message: "Lead updated successfully", data: updatedLead });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a lead
router.delete('/userId', async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        if (isNaN(campaignId) || isNaN(id)) {
            return res.status(400).json({ message: "Invalid userID or lead ID" });
        }
        
        res.status(200).json({ message: "Lead deleted successfully" });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
