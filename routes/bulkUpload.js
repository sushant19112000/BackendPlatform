const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const { promisify } = require('util');
const parseAsync = promisify(parse); // Convert callback to Promise
const { bulkUploadAssigned, bulkUploadAssign, bulkUploadAssigned2, bulkUploadUnassigned, bulkUploadUnAssigned2 } = require('../services/leadService/bulkUpload');
const prisma = require('../db/dbConnection');
const router = express.Router();
const roles = [1, 2, 3]
const storage = multer.memoryStorage(); // Use memory or diskStorage if needed
const upload = multer({ storage });


// --- convert to camelCase ---
const toCamelCase = (str) =>
    str
        .replace(/\u00A0/g, " ")
        .replace(/[^a-zA-Z0-9 ]/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((word, index) =>
            index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");


router.post('/unassigned-template', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { pacingId, uploadedBy } = req.body;
        console.log(req.body)
        if (!file || !pacingId || !uploadedBy) {
            console.log(file, pacingId, uploadedBy);
            return res.status(400).json({ message: "Missing required fields or file" });
        }

        // // ✅ Move parsing logic here
        // const csvString = file.buffer.toString();
        // const leads = parse(csvString, {
        //     columns: true,
        //     skip_empty_lines: true
        // });
        const csvString = file.buffer.toString();

        const leads = await parseAsync(csvString, {
            columns: true,
            skip_empty_lines: true
        });
        const filename = file.originalname;



        const uploadOb = await bulkUploadUnAssigned2(
            filename,
            Number(uploadedBy),
            Number(pacingId),
            leads,
            req.io
        );


        if (!uploadOb) {
            return res.status(400).json({ message: "Failed to add leads" });
        }

        res.status(201).json({ message: uploadOb.message });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/assign-template', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { pacingId, uploadedBy } = req.body;

        if (!file || !pacingId || !uploadedBy) {
            console.log(file, campaignId, pacingId, uploadedBy);
            return res.status(400).json({ message: "Missing required fields or file" });
        }

        // // ✅ Move parsing logic here
        // const csvString = file.buffer.toString();
        // const leads = parse(csvString, {
        //     columns: true,
        //     skip_empty_lines: true
        // });
        const csvString = file.buffer.toString();

        const leads = await parseAsync(csvString, {
            columns: true,
            skip_empty_lines: true
        });
        const filename = file.originalname;



        const uploadOb = await bulkUploadAssigned2(
            filename,
            Number(uploadedBy),
            Number(pacingId),
            leads,
            req.io
        );


        if (!uploadOb) {
            return res.status(400).json({ message: "Failed to add leads" });
        }

        res.status(201).json({ message: uploadOb.message });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.post('/assigned-template', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { pacingId, uploadedBy } = req.body;

        if (!file || !pacingId || !uploadedBy) {
            console.log(file, pacingId, uploadedBy);
            return res.status(400).json({ message: "Missing required fields or file" });
        }

        // // ✅ Move parsing logic here
        // const csvString = file.buffer.toString();
        // const leads = parse(csvString, {
        //     columns: true,
        //     skip_empty_lines: true
        // });
        const csvString = file.buffer.toString();

        const rawLeads = await parseAsync(csvString, {
            columns: true,          // use first row as headers
            skip_empty_lines: true,
            trim: true
        });
        // Step 3: Map each row to use camelCase keys
        const leads = rawLeads.map(row =>
            Object.fromEntries(
                Object.entries(row)
                    .filter(([key]) => key && key.trim() !== "") // skip empty headers
                    .map(([key, value]) => [toCamelCase(key), value])
            )
        );


        console.log(leads[0])

        const filename = file.originalname;



        const uploadOb = await bulkUploadAssigned2(
            filename,
            Number(uploadedBy),
            Number(pacingId),
            leads,
            req.io
        );


        if (!uploadOb) {
            return res.status(400).json({ message: "Failed to add leads" });
        }

        res.status(201).json({ message: uploadOb.message });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});




router.post('/leads', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { pacingId, uploadedBy } = req.body;
        if (!file || !pacingId || !uploadedBy) {
            console.log(file, pacingId, uploadedBy);
            return res.status(400).json({ message: "Missing required fields or file" });
        }

        // // ✅ Move parsing logic here
        // const csvString = file.buffer.toString();
        // const leads = parse(csvString, {
        //     columns: true,
        //     skip_empty_lines: true
        // });
        const csvString = file.buffer.toString();

        const rawLeads = await parseAsync(csvString, {
            columns: true,          // use first row as headers
            skip_empty_lines: true,
            trim: true
        });
        // Step 3: Map each row to use camelCase keys
        const leads = rawLeads.map(row =>
            Object.fromEntries(
                Object.entries(row)
                    .filter(([key]) => key && key.trim() !== "") // skip empty headers
                    .map(([key, value]) => [toCamelCase(key), value])
            )
        );


        // console.log(leads)

        const filename = file.originalname;



        const uploadOb = await bulkUploadAssigned2(
            filename,
            Number(uploadedBy),
            Number(pacingId),
            leads,
            req.io
        );


        if (!uploadOb) {
            return res.status(400).json({ message: "Failed to add leads" });
        }



        const newNotification = await prisma.notification.create({
            data: {
                message: `Leads have been uploaded by ${uploadOb.user} for the  ${uploadOb.volume}/${uploadOb.pacing} has been added to ${uploadOb.campaign}`,
                notificationPriority: { connect: { id: 3 } },
                url:"#",
                type: "bulkUpload",
            }
        });

        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });

        req.io.emit('bulkUpload', {
            type: 'bulkUpload',
            message: `Leads have been uploaded by ${uploadOb.user} for the  ${uploadOb.volume}/${uploadOb.pacing} has been added to ${uploadOb.campaign}.`,
            payload: { url: "#", priorityId: 4, type: "bulkUpload", role: "admin" }
        });


        res.status(201).json({ message: uploadOb.message });

        // res.status(201).json({ leads:leads});
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
