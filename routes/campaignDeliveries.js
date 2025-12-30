var express = require('express');
const { getCampaignDeliveries } = require('../services/leadService/campaignDeliveries');
var router = express.Router();


// Fetch all campaignDeliveries for the campaign
router.get('/', async (req, res) => {
    try {
        const campaignId= await req.params.campaignId;
        const campaignDeliveries = await getCampaignDeliveries(campaignId);
        if(!campaignDeliveries){
            return res.status(400).json({   message: "Error fetching campaign deliveriels"})
        }
        res.status(200).json({
            message: "Data fetched successfully",
            data: campaignDeliveries
        });
    } catch (error) {
        console.error("Error fetching briefs:", error);
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

// Add a new brief
router.post('/', async (req, res) => {
    try {
        const newBrief = await addBrief(req.body);

        if (!newBrief) {
            return res.status(400).json({ message: "Failed to add brief" });
        }

        res.status(201).json({
            message: "Brief added successfully",
            data: newBrief
        });
    } catch (error) {
        console.error("Error adding brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

