const prisma = require("../db/dbConnection");

const deleteCampaign = async (campaignId) => {
  try {
    // 1️⃣ Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        volumes: {
          include: {
            pacings: {
              include: { leads: true, uploads: true },
            },
            leads: true,
          },
        },
        leads: true,
      },
    });

    if (!campaign) {
      console.log("Campaign not found");
      return;
    }

    // 2️⃣ Delete all related pacing leads and uploads
    for (const volume of campaign.volumes) {
      for (const pacing of volume.pacings) {
        await prisma.leadsUpload.deleteMany({
          where: { id: { in: pacing.uploads.map((u) => u.id) } },
        });

        await prisma.lead.deleteMany({
          where: { id: { in: pacing.leads.map((l) => l.id) } },
        });
      }

      // Delete pacings
      await prisma.pacing.deleteMany({
        where: { id: { in: volume.pacings.map((p) => p.id) } },
      });

      // Delete volume leads
      await prisma.lead.deleteMany({
        where: { id: { in: volume.leads.map((l) => l.id) } },
      });
    }

    // 3️⃣ Delete volumes
    await prisma.volume.deleteMany({
      where: { campaignId },
    });

    // 4️⃣ Delete campaign leads (direct leads of campaign)
    await prisma.lead.deleteMany({
      where: { campaignId },
    });

    // 5️⃣ Delete the campaign
    await prisma.campaign.delete({
      where: { id: campaignId },
    });

    console.log(`Campaign ${campaignId} and related data deleted successfully.`);
  } catch (e) {
    console.error("Error deleting campaign:", e);
  }
};

// Usage
deleteCampaign();
