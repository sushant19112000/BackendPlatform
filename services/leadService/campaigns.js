const prisma = require('../../db/dbConnection')
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



// const fetchAllClientCampaigns = async (filter = 'None') => {
//     try {
//         let campaigns = [];


//         if (filter == "None") {
//             // with due date , lead goal , lead count , lead due , latest pacing and all pacings
//             campaigns = await prisma.campaign.findMany({ include: { client: { select: { name: true } } } });
//             for (let c of campaigns) {
//                 let task = await prisma.task.findFirst(
//                     {
//                         where:
//                         {
//                             type: { equals: "Campaign" },
//                             typeId: c.id
//                         },
//                         select: { name: true, users: { select: { user: { select: { name: true } } } } }
//                     }
//                 )

//                 console.log(task, 'task')

//                 if (task == null) {
//                     c.task = "";
//                     c.assignTo = []
//                 }
//                 else {
//                     c.task = task.name;
//                     // ✅ Destructure users out, keep rest              
//                     c.assignTo = task.users.map(u => u.user.name);
//                 }
//             }
//         }




//         return campaigns;
//     }
//     catch (e) {
//         console.log(e);
//     }
// }


const fetchAllClientCampaigns = async (filter = 'None') => {
  try {
    let campaigns = [];
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    let where = {};

    switch (filter) {
      case "New":
        where = { status: "New" };
        break;

      case "Due Today":
       
        where = {
          duedate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
        break;

      case "Overdue":
        where = {
          duedate: {
            lt: new Date(),
          },
          status: { notIn: ["Completed", "Paused"] },
        };
        break;

      case "Upcoming":
        where = {
          duedate: {
            gt: new Date(),
          },
          status: { notIn: ["Completed", "Paused"] },
        };
        break;

      case "Recently Updated":
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        where = {
          updated_at: {
            gte: sevenDaysAgo,
          },
        };
        break;

      case "Active":
        where = { status: "Active" };
        break;

      case "Completed":
        where = { status: "Completed" };
        break;

      case "Paused":
        where = { status: "Paused" };
        break;

      case "All":
      case "None":
      default:
        where = {};
        break;
    }

    // Fetch campaigns with client
    campaigns = await prisma.campaign.findMany({
      where,
      include: {
        client: { select: { name: true } },
      },
      orderBy: { created_at: "desc" },
    });

    // Attach related task info
    await Promise.all(
      campaigns.map(async (c) => {
        const task = await prisma.task.findFirst({
          where: {
            type: "Campaign",
            typeId: c.id,
          },
          select: {
            name: true,
            users: {
              select: {
                user: { select: { name: true } },
              },
            },
          },
        });

        if (!task) {
          c.task = "";
          c.assignTo = [];
        } else {
          c.task = task.name;
          c.assignTo = task.users.map((u) => u.user.name);
        }
      })
    );

    return campaigns;
  } catch (e) {
    console.error("Error fetching campaigns:", e);
    return [];
  }
};







const fetchCampaign = async (id) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: id }, include: { volumes: { include: { pacings: true } }, campaignDeliveries: true } });
        if (!campaign) return false;
        return campaign;
    }
    catch (e) {
        console.log(e);
    }
}

const fetchCampaignContent = async (id) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: id }, select: { content: true } });
        if (!campaign) return false;
        return campaign;
    }
    catch (e) {
        console.log(e);
    }
}

const fetchCampaignFiles = async (id) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: id }, select: { filesInfo: true } });
        if (!campaign) return false;
        return campaign;
    }

    catch (e) {
        console.log(e);
    }
}

const fetchCampaignUpdates = async (id) => {
    try {
        const campaign = await prisma.campaign.findFirst({ where: { id: id }, select: { updates: true } });
        if (!campaign) return false;
        return campaign;
    }

    catch (e) {
        console.log(e);
    }
}


const addCampaign = async (data) => {
    try {

        let stringCode = String(data.code);

        // Check if campaign exists
        const existingCampaign = await prisma.campaign.findFirst({
            where: { code: stringCode }
        });
        if (existingCampaign) return false;

        // Create new campaign
        const newCampaign = await prisma.campaign.create({
            data: {
                code: stringCode,
                name: data.name,
                clientId: data.clientId,
                leadgoal: data.leadGoal,
                duedate: data.duedate,
                info: data.info,
                content: data.content,
                filesInfo: data.filesInfo,
                updates: data.updates,
                completed: 0,
                pending: 0,
            },
            include: {
                volumes: true
            }
        });

        // Create volumes
        for (let v of data.volumeGoals) {
            let vExists = newCampaign.volumes.find((e) => e.name === v.name);
            if (vExists) {
                continue;
            } else {
                await prisma.volume.create({
                    data: {
                        campaignId: newCampaign.id,
                        name: v.name,
                        leadGoal: v.leadGoal,
                        completed: v.completed ?? 0,
                        pending: v.pending ?? 0,
                        status: "PENDING_APPROVAL",
                        validationProfile: {},
                        headers: {}
                    }
                });
            }
        }

        // Re-fetch campaign with updated volumes
        const campaignWithVolumes = await prisma.campaign.findUnique({
            where: { id: newCampaign.id },
            include: { volumes: true }
        });

        // Create pacings
        for (let pc of data.pacingInfo) {
            let vol = campaignWithVolumes.volumes.find((e) => pc.volumeName === e.name);
            if (!vol) {
                console.warn(`No volume found for pacing: ${pc.volumeName}`);
                continue;
            }
            let newPacing = await addPacing(
                vol.id,
                pc.scheduledFor,
                pc.leadGoal,
                pc.status,
                vol.id
            );
            console.log(newPacing);
        }

        return campaignWithVolumes;
    }
    catch (e) {
        console.log(e)
    }
}


const editCampaign = async (campaignId, data) => {
    try {
        const existingCampaign = await prisma.campaign.findFirst({ where: { id: campaignId } })
        if (!existingCampaign) return false;
        const updatedCampaign = await prisma.campaign.update({ where: { id: campaignId }, data: data })
        return true;

    }
    catch (e) {
        console.log(e)
    }
}

const deleteCampaign = async (campaignId) => {
    try {
        console.log('delete Campaign')
        const campaignExist = await prisma.campaign.delete({
            where: { id: campaignId }
        })
    }
    catch (e) {
        console.log(e);
    }
}

module.exports = { fetchAllClientCampaigns, fetchCampaign, addCampaign, editCampaign, deleteCampaign, fetchCampaignContent, fetchCampaignFiles, fetchCampaignUpdates };