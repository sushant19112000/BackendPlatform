const prisma = require("../../db/dbConnection");

const getCampaignDeliveries = async (campaignId) => {
  try {
    const deliveries = await prisma.campaignDeliveries.findFirst({ where: { campaignId: campaignId } });
    return deliveries;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}

const getCampaignDelivery = async (deliveryId) => {
  try {
    const delivery = await prisma.campaignDeliveries.findFirst({ where: { id: deliveryId } });
    let { data, ...otherData } = delivery;

    const res = {
      ...otherData, data: JSON.parse(data)
    }
    return res;
  }
  catch (e) {
    console.log(e);
    return false;
  }
}


const addCampaignDeilvery = async (campaignId, data) => {
  try {

    const submitted = data.leads.length;
    const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });


    const existingDelivery = await prisma.campaignDeliveries.findFirst({ where: { fileName: data.fileName, campaignId: campaignId } })
    console.log(existingDelivery, 'flag')
    if (existingDelivery) {
      return false;
    }


    // const campaign= await prisma.campaign.findFirst({where:{id:campaignId}});

    const newDelivery = await prisma.campaignDeliveries.create({
      data: {
        fileName: data.fileName,
        date: data.date,
        submitted: submitted,
        data: JSON.stringify(data.leads),
        campaignId: campaignId
      }
    })

    //  relate 
    for (let lead of data.leads) {
      const email = lead.email || lead.Email || lead['Email']
      let db_lead = await prisma.lead.findFirst({ where: { campaignId: campaignId, email: email } });
      if (db_lead) {
        console.log(db_lead.email, 'email updated')
        await prisma.lead.update({
          where: { id: db_lead.id }, data: {
            campaignDeliveryId: newDelivery.id
          }
        })
      }
    }
    console.log({ newDelivery, campaign })
    return { newDelivery, campaign };
  }
  catch (e) {
    console.log(e);
    return false;
  }
}



const addCampaignRejections = async (campaignId, data) => {
  try {
    const deliveriesToUpdate = {}
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId
      }
    })

    if (!campaign) {
      return false;
    }
    for (let rejectedLead of data) {
      // find the lead by email and campaign
      const lead = await prisma.lead.findFirst({
        where: {
          email: rejectedLead.email,
          campaignId: campaignId,
        },
        include: { campaignDelivery: true },
      });

      if (!lead) {
        console.warn(`Lead not found for email: ${rejectedLead.email}`);
        continue;
      }

      // update only if a campaignDeliveryId exists
      if (lead.campaignDeliveryId) {
      
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            rejected: true,
            rejectedReason: rejectedLead.rejectionReason || "No reason specified",
            accepted: false,
            pending: false,
          },
        });

        // optionally increment the rejection count in campaignDeliveries
        // await prisma.campaignDeliveries.update({
        //   where: { id: lead.campaignDeliveryId },
        //   data: {
        //     rejections: { increment: 1 },
        //   },
        // });
        if (!Object.keys(deliveriesToUpdate).includes(lead.campaignDeliveryId)) {
          deliveriesToUpdate[lead.campaignDeliveryId] = 1
        }
        else {
          deliveriesToUpdate[lead.campaignDeliveryId] += 1
        }
      }
    }
    if (Object.keys(deliveriesToUpdate).length > 0) {
      for (let id of Object.keys(deliveriesToUpdate)) {
        let del = await prisma.campaignDeliveries.findFirst({
          where: {
            id: parseInt(id)
          }
        })
        if (del) {
          const newAccepted = Math.max(0, del.submitted - deliveriesToUpdate[id]);
          if (deliveriesToUpdate[id] === 0) {
            delStatus = "ALL_ACCEPTED";
          } else if (deliveriesToUpdate[id] === del.submitted) {
            delStatus = "ALL_REJECTED";
          } else {
            delStatus = "PARTIALLY_ACCEPTED";
          }
          await prisma.campaignDeliveries.update({
            where: {
              id: parseInt(id)
            },
            data: {
              status: delStatus,
              accepted: newAccepted,
              rejections: deliveriesToUpdate[id]
            }
          })
        }
      }
    }
    return campaign;
  } catch (e) {
    console.error("Error adding campaign rejections:", e);
    return false;
  }
};



const updateCampaignDelivery = async (deliveryId, data) => {
  try {
    const delivery = await prisma.campaignDeliveries.findFirst({ where: { id: deliveryId }, include: { campaign: true, leads: true } });
    if (!delivery) {
      return false;
    }

    console.log(data, 'status in function')

    if (data.status) {
      if (data.status === "ALL_ACCEPTED") {
        for (let lead of delivery.leads) {
          await prisma.lead.update({
            where: {
              id: lead.id
            },
            data: {
              leadstatus: "CL_ACCEPTED",
              accepted: true,
              pending: false,
              rejected: false,
              rejectedReason: ""
            }
          })
        }
        await prisma.campaignDeliveries.update({
          where: {
            id: delivery.id
          },
          data: {
            accepted: delivery.submitted,
            rejections: 0
          }
        })
      }
      if (data.status === "ALL_REJECTED") {
        for (let lead of delivery.leads) {
          await prisma.lead.update({
            where: {
              id: lead.id
            },
            data: {
              leadstatus: "CL_REJECTED",
              rejected: true,
              rejectedReason: "No reason specified",
              accepted: false
            }
          })
        }
        await prisma.campaignDeliveries.update({
          where: {
            id: delivery.id
          },
          data: {
            rejections: delivery.submitted,
            accepted: 0
          }
        })
      }
    }

    const updatedDelivery = await prisma.campaignDeliveries.update({
      where: {
        id: delivery.id
      },
      data: data,
      include: { campaign: true, leads: true }
    })

    return updatedDelivery;



  } catch (e) {
    console.error("Error adding campaign rejections:", e);
    return false;
  }
};
module.exports = { getCampaignDeliveries, getCampaignDelivery, addCampaignDeilvery, updateCampaignDelivery, addCampaignRejections };