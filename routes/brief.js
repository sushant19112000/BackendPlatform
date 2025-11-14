var express = require('express');
var router = express.Router();
var { addBrief, getBriefs, getBrief, editBrief } = require('../services/leadService/brief');

// Fetch all briefs
router.get('/', async (req, res) => {
    try {
        const briefs = await getBriefs();
        res.status(200).json({
            message: "Data fetched successfully",
            data: briefs
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

// Edit an existing brief
router.put('/:id', async (req, res) => {
    try {
        const  id  = req.params.id;

        const updatedBrief = await editBrief(id, req.body);
    //   console.log(id,req.body,'bre')
        if (!updatedBrief) {
            return res.status(400).json({ message: "Failed to update brief" });
        }

        res.status(200).json({
            message: "Brief updated successfully",
            data: updatedBrief
        });

    } catch (error) {
        console.error("Error updating brief:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

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

module.exports = router;
