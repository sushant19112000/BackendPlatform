const prisma = require("../../db/dbConnection");

const leadCountUpdate = async (campaignId, uploadId, pacingId, volumeId) => {
  try {
    // optional sleep
    // const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // await sleep(60000); // uncomment if you want a 60s delay

    const leadsCountCampaign = await prisma.lead.count({ where: { campaignId } });
    const leadsCountVolume = await prisma.lead.count({ where: { volumeId } });
    const leadsCountPacing = await prisma.lead.count({ where: { pacingId } });

    // campaign lead count
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    const pendingCampaignGoal = campaign.leadgoal - leadsCountCampaign;
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        completed: leadsCountCampaign,
        pending: pendingCampaignGoal,
      },
    });

    // volume
    const volume = await prisma.volume.findUnique({ where: { id: volumeId } });
    const pendingVolumeGoal = volume.leadGoal - leadsCountVolume;
    let status = volume.status;
    if (leadsCountVolume >= volume.leadGoal) {
      status = "IN_REVIEW";
    }
    await prisma.volume.update({
      where: { id: volumeId },
      data: {
        completed: leadsCountVolume,
        pending: pendingVolumeGoal,
        status,
      },
    });

    // pacing
    const pacing = await prisma.pacing.findUnique({ where: { id: pacingId } });
    let statusPacing = pacing.status;
    if (leadsCountPacing >= pacing.leadGoal) {
      statusPacing = "Completed";
    }
    await prisma.pacing.update({
      where: { id: pacingId },
      data: {
        actualLeads: leadsCountPacing,
        status: statusPacing,
      },
    });

    console.log("Campaign:", leadsCountCampaign, "Pacing:", leadsCountPacing, "Volume:", leadsCountVolume);
    return true;
  } catch (e) {
    console.error("Lead count update failed:", e);
    return false;
  }
};

module.exports={leadCountUpdate}

