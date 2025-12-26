const prisma = require('../../db/dbConnection');
const transferPhaseValidation = require('../../middelware/validations/transferPhaseValidation/transferPhaseValidation');

const { twoPhaseValidation } = require('../../middelware/validations/twoPhaseValidation/twoPhaseValidation');
const unAssignedBasicValidation = require('../../middelware/validations/unassignedValidation/unassignedBasicValidation');
const { assignedValidationService, unAssignedValidationService, validationService } = require('../../tasks/client');




// const bulkUploadUnassigned = async (filename, uploadedBy, pacingId, leads) => {
//     try {

//         // const campaignData = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         const pacing = await prisma.pacing.findFirst({
//             where: { id: pacingId },
//             include: {
//                 volume: {
//                     include: { campaign: true }
//                 }
//             }
//         })

//         const campaign = pacing.volume.campaign
//         const volume = pacing.volume

//         // create upload 
//         const newleadsUpload = await prisma.leadsUpload.create({
//             data: {
//                 pacingId: Number(pacingId),
//                 uploadedBy: Number(uploadedBy),
//                 filename: filename,
//                 results: {}
//             }
//         })



//         if (Object.keys(volume.validationProfile).length === 0) {
//             return false;
//         }

//         // // Valid leads for campaign Profile && Upload Non duplicate leads
//         // const validateDataAnUpload = await leadValidation(
//         //     leads,
//         //     volume.validationProfile,
//         //     campaign.id,
//         //     newleadsUpload.id,
//         //     pacing.id,
//         //     volume.id,
//         // );
//         const validateDataAnUpload = await unAssignedBasicValidation(leads, volume.validationProfile, campaign.id, newleadsUpload.id, pacingId, volume.id)


//         await prisma.leadsUpload.update({
//             where: {
//                 id: newleadsUpload.id,
//             },
//             data: {
//                 results: JSON.stringify(validateDataAnUpload)
//             }
//         })

//         let newActualLeads = pacing.actualLeads + validateDataAnUpload.validRowsCount;
//         let newVolumeCompleted = volume.completed + + validateDataAnUpload.validRowsCount

//         //update pacing
//         let status = pacing.status;
//         let vStatus = volume.status;
//         if (pacing.actualLeads >= pacing.leadGoal) status = "Completed";
//         else { status = "Active" }
//         const updatedPacing = await prisma.pacing.update({ where: { id: pacing.id }, data: { actualLeads: newActualLeads, status: status } })
//         if (volume.completed >= volume.leadGoal) vStatus = "IN_REVIEW"
//         const updatedVolume = await prisma.volume.update({ where: { id: volume.id }, data: { completed: newVolumeCompleted, status: vStatus } })
//         return validateDataAnUpload;
//     }
//     catch (e) {
//         console.error(e)
//     }
// }


const bulkUploadUnassigned = async (filename, uploadedBy, pacingId, leads) => {
  try {
    // Fetch pacing with volume and campaign details
    const pacing = await prisma.pacing.findFirst({
      where: { id: pacingId },
      include: {
        volume: {
          include: { campaign: true },
        },
      },
    });

    if (!pacing) throw new Error("Pacing not found");

    const campaign = pacing.volume.campaign;
    const volume = pacing.volume;

    // Create a new upload record
    const newLeadsUpload = await prisma.leadsUpload.create({
      data: {
        pacingId: Number(pacingId),
        uploadedBy: Number(uploadedBy),
        filename,
        results: {},
      },
    });

    // Skip if no validation profile
    if (!volume.validationProfile || Object.keys(volume.validationProfile).length === 0) {
      return false;
    }

    // Validate leads
    const validateDataAnUpload = await unAssignedBasicValidation(
      leads,
      volume.validationProfile,
      campaign.id,
      newLeadsUpload.id,
      pacingId,
      volume.id
    );

    // Update the upload with validation results
    await prisma.leadsUpload.update({
      where: { id: newLeadsUpload.id },
      data: { results: JSON.stringify(validateDataAnUpload) },
    });

    // Compute updated counts
    const validCount = Number(validateDataAnUpload.validRowsCount || 0);
    const newActualLeads = Number(pacing.actualLeads || 0) + validCount;
    const newVolumeCompleted = Number(volume.completed || 0) + validCount;

    // Update pacing status
    const pacingStatus = newActualLeads >= pacing.leadGoal ? "Completed" : "Active";
    await prisma.pacing.update({
      where: { id: pacing.id },
      data: {
        actualLeads: newActualLeads,
        status: pacingStatus,
      },
    });

    // Update volume status
    const volumeStatus = newVolumeCompleted >= volume.leadGoal ? "IN_REVIEW" : volume.status;
    await prisma.volume.update({
      where: { id: volume.id },
      data: {
        completed: newVolumeCompleted,
        status: volumeStatus,
      },
    });

    // Update campaign completed leads & status
    // Sum completed leads of all volumes for this campaign
    const volumes = await prisma.volume.findMany({
      where: { campaignId: campaign.id },
    });

    const totalCompletedLeads = volumes.reduce(
      (sum, vol) => sum + Number(vol.completed || 0),
      0
    );

    const campaignStatus = totalCompletedLeads >= campaign.leadgoal ? "Completed" : campaign.status;

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        completed: totalCompletedLeads,
        status: campaignStatus,
      },
    });

    return validateDataAnUpload;
  } catch (e) {
    console.error("bulkUploadUnassigned error:", e);
    throw e;
  }
};

const bulkUploadUnAssigned2 = async (filename, uploadedBy, pacingId, leads, socket) => {
  try {
    // Fetch pacing with volume and campaign details
    // Fetch pacing with volume and campaign details
    const pacing = await prisma.pacing.findFirst({
      where: { id: pacingId },
      include: {
        volume: {
          include: { campaign: true },
        },
      },
    });

    if (!pacing) throw new Error("Pacing not found");

    const campaign = pacing.volume.campaign;
    const volume = pacing.volume;

    // Create a new upload record
    const newLeadsUpload = await prisma.leadsUpload.create({
      data: {
        pacingId: Number(pacingId),
        uploadedBy: Number(uploadedBy),
        filename,
        results: {},
      },
    });

    // Skip if no validation profile
    if (!volume.validationProfile || Object.keys(volume.validationProfile).length === 0) {
      return false;
    }

    // Validate leads
    unAssignedValidationService(
      leads,
      volume.validationProfile,
      campaign.id,
      newLeadsUpload.id,
      pacingId,
      volume.id
    );
    return { message: "Bulk upload started" }


  } catch (e) {
    console.error("bulkUploadAssigned error:", e);
    throw e;
  }
};


const bulkUploadAssign = async (filename, uploadedBy, pacingId, leads) => {
  try {

    // const campaignData = await prisma.campaign.findFirst({ where: { id: campaignId } });
    const pacing = await prisma.pacing.findFirst({
      where: { id: pacingId },
      include: {
        volume: {
          include: { campaign: true }
        }
      }
    })

    const campaign = pacing.volume.campaign
    const volume = pacing.volume

    // create upload 
    const newleadsUpload = await prisma.leadsUpload.create({
      data: {
        pacingId: Number(pacingId),
        uploadedBy: Number(uploadedBy),
        filename: filename
      }
    })


    const validateDataAnUpload = transferPhaseValidation(leads, campaign.id, uploadId, pacingId, volume.id)
    // // Valid leads for campaign Profile && Upload Non duplicate leads
    // const validateDataAnUpload = await leadValidation(
    //     leads,
    //     volume.validationProfile,
    //     campaign.id,
    //     newleadsUpload.id,
    //     pacing.id,
    //     volume.id,
    // );



    await prisma.leadsUpload.update({
      where: {
        id: newleadsUpload.id,
      },
      data: {
        results: JSON.stringify(validateDataAnUpload)
      }
    })

    let newActualLeads = pacing.actualLeads + validateDataAnUpload.validRowsCount;
    let newVolumeCompleted = volume.completed + + validateDataAnUpload.validRowsCount

    //update pacing
    let status = pacing.status;
    let vStatus = volume.status;
    if (pacing.actualLeads >= pacing.leadGoal) status = "Completed";
    else { status = "Active" }
    const updatedPacing = await prisma.pacing.update({ where: { id: pacing.id }, data: { actualLeads: newActualLeads, status: status } })
    if (volume.completed >= volume.leadGoal) vStatus = "IN_REVIEW"
    const updatedVolume = await prisma.volume.update({ where: { id: volume.id }, data: { completed: newVolumeCompleted, status: vStatus } })
    return validateDataAnUpload;
  }
  catch (e) {
    console.error(e)
  }
}




// const bulkUploadAssigned = async (filename, uploadedBy, pacingId, leads) => {
//     try {

//         // const campaignData = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         const pacing = await prisma.pacing.findFirst({
//             where: { id: pacingId },
//             include: {
//                 volume: {
//                     include: { campaign: true }
//                 }
//             }
//         })

//         const campaign = pacing.volume.campaign
//         const volume = pacing.volume

//         // create upload 
//         const newleadsUpload = await prisma.leadsUpload.create({
//             data: {
//                 pacingId: Number(pacingId),
//                 uploadedBy: Number(uploadedBy),
//                 filename: filename,
//                 results:{}
//             }
//         })
//         let twoPhaseValidationUpload;
//         if (volume.leadTemplate === "template") {
//             return false;
//         }
//         if (volume.leadTemplate != "template") {
//             const leadTemplateProfile = JSON.parse(volume.leadTemplate);
//             const profiles = { basicValidationProfile: volume.validationProfile, templateValidationProfile: leadTemplateProfile }
//             twoPhaseValidationUpload = await twoPhaseValidation(leads, profiles, campaign.id, newleadsUpload.id, pacingId, volume.id)
//         }

//         // // Valid leads for campaign Profile && Upload Non duplicate leads
//         // const validateDataAnUpload = await leadValidation(
//         //     leads,
//         //     volume.validationProfile,
//         //     campaign.id,
//         //     newleadsUpload.id,
//         //     pacing.id,
//         //     volume.id,
//         // );



//         await prisma.leadsUpload.update({
//             where: {
//                 id: newleadsUpload.id,
//             },
//             data: {
//                 results: JSON.stringify(twoPhaseValidationUpload)
//             }
//         })

//         let newActualLeads = pacing.actualLeads + twoPhaseValidationUpload.validRowsCount;
//         let newVolumeCompleted = volume.completed + + twoPhaseValidationUpload.validRowsCount

//         //update pacing
//         let status = pacing.status;
//         let vStatus = volume.status;
//         if (pacing.actualLeads >= pacing.leadGoal) status = "Completed";
//         else { status = "Active" }
//         const updatedPacing = await prisma.pacing.update({ where: { id: pacing.id }, data: { actualLeads: newActualLeads, status: status } })
//         if (volume.completed >= volume.leadGoal) vStatus = "IN_REVIEW"
//         const updatedVolume = await prisma.volume.update({ where: { id: volume.id }, data: { completed: newVolumeCompleted, status: vStatus } })
//         return twoPhaseValidationUpload;
//     }
//     catch (e) {
//         console.error(e)
//     }
// }


const bulkUploadAssigned = async (filename, uploadedBy, pacingId, leads) => {
  try {
    // Fetch pacing with volume and campaign details
    const pacing = await prisma.pacing.findFirst({
      where: { id: pacingId },
      include: {
        volume: {
          include: { campaign: true },
        },
      },
    });

    if (!pacing) throw new Error("Pacing not found");

    const campaign = pacing.volume.campaign;
    const volume = pacing.volume;

    // Create a new upload record
    const newLeadsUpload = await prisma.leadsUpload.create({
      data: {
        pacingId: Number(pacingId),
        uploadedBy: Number(uploadedBy),
        filename,
        results: {},
      },
    });

    let twoPhaseValidationUpload;

    // Skip if lead template is "template"
    if (volume.leadTemplate === "template") return false;

    // Two-phase validation if template exists
    if (volume.leadTemplate !== "template") {
      const leadTemplateProfile = JSON.parse(volume.leadTemplate);
      const profiles = {
        basicValidationProfile: volume.validationProfile,
        templateValidationProfile: leadTemplateProfile,
      };
      twoPhaseValidationUpload = await twoPhaseValidation(
        leads,
        profiles,
        campaign.id,
        newLeadsUpload.id,
        pacingId,
        volume.id
      );
    }

    // Update upload with validation results
    await prisma.leadsUpload.update({
      where: { id: newLeadsUpload.id },
      data: { results: JSON.stringify(twoPhaseValidationUpload) },
    });

    // Safely calculate numeric updates
    const validCount = Number(twoPhaseValidationUpload?.validRowsCount || 0);

    const newActualLeads = Number(pacing.actualLeads || 0) + validCount;
    const newVolumeCompleted = Number(volume.completed || 0) + validCount;
    const newCampaignCompleted = Number(campaign.completed || 0) + validCount;

    // Determine pacing status
    let pacingStatus = newActualLeads >= pacing.leadGoal ? "Completed" : "Active";

    // Update pacing
    await prisma.pacing.update({
      where: { id: pacing.id },
      data: { actualLeads: newActualLeads, status: pacingStatus },
    });

    // Determine volume status
    let volumeStatus = newVolumeCompleted >= volume.leadGoal ? "IN_REVIEW" : volume.status;

    // Update volume
    await prisma.volume.update({
      where: { id: volume.id },
      data: { completed: newVolumeCompleted, status: volumeStatus },
    });

    // Update campaign lead counts
    let campaignStatus = newCampaignCompleted >= campaign.leadgoal ? "Completed" : campaign.status;
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { completed: newCampaignCompleted, status: campaignStatus },
    });

    return twoPhaseValidationUpload;
  } catch (e) {
    console.error("bulkUploadAssigned error:", e);
    throw e;
  }
};



const bulkUploadAssigned2 = async (filename, uploadedBy, pacingId, leads, socket) => {
  try {

    // Fetch pacing with volume and campaign details

    const user = await prisma.user.findFirst({ where: { id: uploadedBy } });
    const pacing = await prisma.pacing.findFirst({
      where: { id: pacingId },
      include: {
        volume: {
          include: { campaign: true },
        },
      },
    });

    if (!pacing) throw new Error("Pacing not found");

    const campaign = pacing.volume.campaign;
    const volume = pacing.volume;

    // Create a new upload record
    const newLeadsUpload = await prisma.leadsUpload.create({
      data: {
        pacingId: Number(pacingId),
        uploadedBy: Number(uploadedBy),
        filename,
        results: {},
      },
    });


    // Skip if lead template is "template"
    if (Object.keys(volume.leadTemplate).length == 0) return false;


    // Two-phase validation if template exists



    if (leads.length > 0) {
      const headers = Object.keys(leads[0]);
      const templateHeaders = Object.keys(volume.leadTemplate.fieldRules);
      const isValid = headers.every(h => templateHeaders.includes(h));
      console.log(isValid, 'is valid')
      if (!isValid) {
        return false;
      }
    }

    const profiles = {
      externalRules: volume.externalRules,
      leadTemplate: volume.leadTemplate,
    };

    console.log(profiles, 'volume profiles')
    validationService(
      leads,
      profiles,
      campaign.id,
      newLeadsUpload.id,
      pacingId,
      volume.id,
      socket,
      Number(uploadedBy)
    );
    return { message: "Bulk upload started", campaign: campaign.name, pacing: pacing.updated_at, volume: volume.name, user: user.name }


  } catch (e) {
    console.error("bulkUploadAssigned error:", e);
    throw e;
  }
};

module.exports = { bulkUploadUnassigned, bulkUploadAssigned, bulkUploadAssign, bulkUploadAssigned2, bulkUploadUnAssigned2 };

