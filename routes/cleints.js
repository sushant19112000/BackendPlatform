var express = require('express');
var router = express.Router();
var { addClient, fetchAllClients, fetchClient, editClient, deleteClient } = require('../services/leadService/clients');


// Fetch all clients
router.get('/', async (req, res) => {
    try {
        const clients = await fetchAllClients();
        res.status(200).json({ message: "Data fetched successfully", data: clients });
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Fetch a single client by ID
router.get('/:id', async (req, res) => {
    try {
        const clientId = Number(req.params.id);
        if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });

        const client = await fetchClient(clientId);
        if (!client) return res.status(404).json({ message: "Client not found" });

        res.status(200).json({ message: "Data fetched successfully", data: client });
    } catch (error) {
        console.error("Error fetching client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new client
router.post('/', async (req, res) => {
    try {
        const newClient = await addClient(req.body);
        if (!newClient) return res.status(400).json({ message: "Failed to add client" });
        
        // emit the notification with type/message payload
        req.io.emit('receiveClientNotification', {
            type: 'added',
            message: `New Client "${newClient.name}" has been created.`,
            payload: newClient
        });

        res.status(201).json({ message: "Client added successfully", data: newClient });
    } catch (error) {
        console.error("Error adding client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update an existing client
router.put('/:id', async (req, res) => {
    try {
        const clientId = Number(req.params.id);
        if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });

        const updatedClient = await editClient(clientId, req.body);
        if (!updatedClient) return res.status(404).json({ message: "Client not found or update failed" });

        res.status(200).json({ message: "Client updated successfully", data: updatedClient });
    } catch (error) {
        console.error("Error updating client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a client
router.delete('/:id', async (req, res) => {
    try {
        const clientId = Number(req.params.id);
        if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });

        const deletedClient = await deleteClient(clientId);
        if (!deletedClient) return res.status(404).json({ message: "Client not found or already deleted" });

        res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        console.error("Error deleting client:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
