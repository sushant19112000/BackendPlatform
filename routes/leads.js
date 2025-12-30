var express = require('express');
var router = express.Router();
var { addLead, addMulitpleLeads, fetchAllLeads, editLead, deleteLead, fetechAllCampaignLeads, fetchPacingLeads } = require('../services/leadService/leads');



// Fetch all leads
router.get('/', async (req, res) => {
    try {
        const leads = await fetchAllLeads();
        return res.status(200).json({ message: "Data fetched successfully", data: leads });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/unassigned/pacing/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const pacingLeads = await fetchPacingLeads(id,'unassigned');
        return res.status(200).json({ message: "Data fetched successfully", data: pacingLeads });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/pacing/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const pacingLeads = await fetchPacingLeads(id,'assigned');
        return res.status(200).json({ message: "Data fetched successfully", data: pacingLeads });
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
router.delete('/:campaignId/:id', async (req, res) => {
    try {
        const campaignId = Number(req.params.campaignId);
        const id = Number(req.params.id);

        if (isNaN(campaignId) || isNaN(id)) {
            return res.status(400).json({ message: "Invalid campaign ID or lead ID" });
        }

        const deletedLead = await deleteLead(id, campaignId);
        if (!deletedLead) {
            return res.status(404).json({ message: "Lead not found or already deleted" });
        }

        res.status(200).json({ message: "Lead deleted successfully" });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
