var express = require('express');
var router = express.Router();

const prisma = require('../db/dbConnection');
const roles = [1, 2, 3]
const addPacing = async (volumeId, scheduledFor, leadGoal, status) => {
    try {
        const newPacing = await prisma.pacing.create({
            data: {
                scheduledFor: new Date(scheduledFor),
                leadGoal,
                volumeId: volumeId,
                status
            }
        })
        return newPacing;
    }
    catch (e) {
        console.log(e)
    }
}


const urlGenerator = (clientId, campaignId, type) => {
    return `/leadinsights/client/${clientId}/campaigns/${campaignId}/${type}`;
};

function formatContent(rawContent) {
    const formatted = [];
    let idCounter = Date.now(); // unique-ish id base

    for (const [categoryName, assets] of Object.entries(rawContent || {})) {
        const contentList = assets.map((asset) => ({
            id: idCounter++,
            title: asset,
            type: "Whitepaper",
            approveDate: null,
            optinType: "single",
        }));

        formatted.push({
            categoryName,
            content: contentList,
        });
    }

    return formatted;
}

// Helper pacing scheduler
const generateMultipleWeeklySchedule = (startDate, endDate, daysOfWeek, volumes) => {
    const schedule = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let volumesTemp = JSON.parse(volumes);

    volumesTemp.forEach((vol) => {
        const totalLeads = vol.leadGoal;
        if (totalLeads < 10) {
            schedule.push({
                scheduledFor: start.toISOString().split("T")[0],
                leadGoal: totalLeads,
                volumeName: vol.name,
                status: "scheduled",
                actualLeads: 0,
            });
            return;
        }

        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        let weeksBetween = Math.floor((end - start) / msPerWeek) + 1;
        weeksBetween = Math.max(2, Math.min(weeksBetween, 8));
        let parts = Math.floor(totalLeads / 5);
        parts = Math.min(parts, weeksBetween);
        parts = Math.max(parts, 2);

        if (totalLeads > 200) {
            parts = Math.max(parts, 5);
            parts = Math.min(parts, weeksBetween);
        }

        const baseLeadGoal = Math.floor(totalLeads / parts);
        const remainder = totalLeads % parts;

        schedule.push({
            scheduledFor: start.toISOString().split("T")[0],
            leadGoal: baseLeadGoal + (remainder > 0 ? 1 : 0),
            volumeName: vol.name,
            status: "scheduled",
            actualLeads: 0,
        });

        let firstWeeklyDate = new Date(start);
        let found = false;

        for (let offset = 1; offset <= 7; offset++) {
            let candidate = new Date(start);
            candidate.setDate(start.getDate() + offset);
            if (daysOfWeek.some((d) => d.value === candidate.getDay())) {
                firstWeeklyDate = candidate;
                found = true;
                break;
            }
        }

        if (!found) return;

        let tempDate = new Date(firstWeeklyDate);
        let currentDayIndex = 0;

        for (let i = 1; i < parts; i++) {
            schedule.push({
                scheduledFor: tempDate.toISOString().split("T")[0],
                leadGoal: baseLeadGoal + (i < remainder ? 1 : 0),
                volumeName: vol.name,
                status: "scheduled",
                actualLeads: 0,
            });

            let nextDayIndex = (currentDayIndex + 1) % daysOfWeek.length;
            let currentDay = daysOfWeek[currentDayIndex].value;
            let nextDay = daysOfWeek[nextDayIndex].value;

            let increment;
            if (nextDay > currentDay) increment = nextDay - currentDay;
            else increment = 7 - currentDay + nextDay;

            tempDate.setDate(tempDate.getDate() + increment);
            currentDayIndex = nextDayIndex;

            if (tempDate > end) break;
        }
    });

    return schedule;
};

const addCampaign = async (data) => {
    try {
        const stringCode = String(data.code);

        // Check if campaign exists
        const existingCampaign = await prisma.campaign.findFirst({
            where: { code: stringCode },
        });
        if (existingCampaign) return false;

        // Prepare structured info, content & filesInfo
        const formattedInfo = data.info ? JSON.stringify(data.info) : "{}";
        const formattedContent = data.content ? JSON.stringify(data.content) : "[]";

        const formattedUpdates = data.updates ? data.updates : [];


        let counter = Date.now();
        let filesWithId = []
        for (let file of data.filesInfo) {
            let newData = { ...file, id: counter++ }
            filesWithId.push(newData)
        }
        // Create new campaign
        const newCampaign = await prisma.campaign.create({
            data: {
                code: stringCode,
                name: data.name,
                clientId: 1,
                leadgoal: data.leadGoal,
                duedate: data.duedate,
                info: {},
                content: JSON.parse(formattedContent),
                filesInfo: filesWithId,
                updates: formattedUpdates,
                completed: 0,
                pending: 0,
                additionalInfo: data.additionalInfo,
                descriptionOfFilesAttached: data.descriptionOfFilesAttached,
                firstUploadDate:data.firstUploadDate,
                weeklyUploadDays:JSON.stringify(data.weeklyUploadDay),
                cpc:data.cpc
            },
            include: {
                volumes: true,
            },
        });

        // Create volumes
        for (const v of data.volumeGoals) {
            const vExists = newCampaign.volumes.find((e) => e.name === v.name);
            if (!vExists) {
                await prisma.volume.create({
                    data: {
                        campaignId: newCampaign.id,
                        name: v.name,
                        leadGoal: v.leadGoal,
                        completed: v.completed ?? 0,
                        pending: v.pending ?? 0,
                        status: "PENDING_APPROVAL",
                      leadTemplate:{},
                        headers: {},
                        externalRules:{}

                    },
                });
            }
        }

        // Re-fetch with all volumes
        const campaignWithVolumes = await prisma.campaign.findUnique({
            where: { id: newCampaign.id },
            include: { volumes: true },
        });

        // Generate pacing data automatically (if pacingInfo not provided)
        let pacingData = data.pacingInfo;
        if (!pacingData || pacingData.length === 0) {
            // const daysOfWeek = [
            //     {
            //         label: data.weeklyUploadDay,
            //         value: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(data.weeklyUploadDay),
            //     },
            // ];

            const daysOfWeek = (
                Array.isArray(data.weeklyUploadDay)
                    ? data.weeklyUploadDay
                    : [data.weeklyUploadDay]
            ).map(day => ({
                label: day,
                value: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day),
            }));
            const volumeMap = campaignWithVolumes.volumes.map((v) => ({
                name: v.name,
                leadGoal: v.leadGoal,
            }));

            pacingData = generateMultipleWeeklySchedule(
                data.firstUploadDate,
                data.duedate,
                daysOfWeek,
                JSON.stringify(volumeMap)
            );
        }

        // Create pacing for each volume
        for (const pc of pacingData) {
            const vol = campaignWithVolumes.volumes.find((e) => pc.volumeName === e.name);
            if (!vol) {
                console.warn(`⚠️ No volume found for pacing: ${pc.volumeName}`);
                continue;
            }
            await addPacing(vol.id, pc.scheduledFor, pc.leadGoal, pc.status, vol.id);
        }

        return campaignWithVolumes;
    } catch (e) {
        console.error("❌ Error creating campaign:", e);
        throw e;
    }
};

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        console.log(body['Files'], 'files')

        // Transform input keys to match addCampaign expectations
        const formattedData = {
            name: body["CampaignName"],
            code: body["Code"],
            leadGoal: Number(body["LeadGoal"]),
            duedate: new Date(body["Deadline"]).toISOString(),
            firstUploadDate: new Date(body["FirstUploadDate"]).toISOString(),
            weeklyUploadDay: body["WeeklyUploadDay"],
            pacing: body["Pacing"],
            clientId: body["ClientId"] ?? 1, // example default; replace with actual
            content: body["Content"],
            info: {},
            additionalInfo: body['AdditionalInformation'],
            descriptionOfFilesAttached: body['DescriptionOfFilesAttached'],
            filesInfo: body["Files"],
            updates: [
                {
                    id: 1759426433102,
                    type: "Campaign Intialized",
                    title: "Campaign Intialized",
                    description: "Campaign Intialized",
                    date: new Date().toISOString()
                }
            ],
            volumeGoals: body.Volumes.map((v) => ({
                name: v.key,
                leadGoal: Number(v.value)
            })),
            cpc:Number(body['ContactsPerCompany']) || 0
        };






        const newCampaign = await addCampaign(formattedData);
        let url = urlGenerator(newCampaign.clientId, newCampaign.id, "info")
        if (!newCampaign) {
            return res.status(400).json({ message: "Failed to add campaign" });
        }







        const newNotification = await prisma.notification.create({
            data: {
                message: `New Campaign "${newCampaign.name}" has been added.`,
                notificationPriority: {
                    connect: { id: 4 } // adjust priority as needed
                },
                url: url,
                type: "info",
            }
        });
        await prisma.roleNotification.createMany({
            data: roles.map((roleId) => ({
                notificationId: newNotification.id,
                roleId,
            })),
        });
        res.status(201).json({ message: "Campaign added successfully", data: newCampaign });
    } catch (err) {
        console.error("Error adding campaign:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;
