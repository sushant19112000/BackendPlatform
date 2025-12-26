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
         const campaign= await prisma.campaign.findFirst({where:{id:campaignId}});
        

        const existingDelivery = await prisma.campaignDeliveries.findFirst({ where: { fileName: data.fileName,campaignId:campaignId } })
        console.log(existingDelivery,'flag')
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
                campaignId:campaignId
            }
        })
      
        //  relate 
        for (let lead of data.leads) {
            const email = lead.email || lead.Email || lead['Email']
            let db_lead = await prisma.lead.findFirst({ where: { campaignId: campaignId, email: email } });
            if (db_lead) {
                console.log(db_lead.email,'email updated')
                await prisma.lead.update({
                    where: { id: db_lead.id }, data: {
                        campaignDeliveryId: newDelivery.id
                    }
                })
            }
        }
        return {newDelivery,campaign};
    }
    catch (e) {
        console.log(e);
        return false;
    }
}



const addCampaignRejections = async (campaignId, data) => {
  try {
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
        await prisma.campaignDeliveries.update({
          where: { id: lead.campaignDeliveryId },
          data: {
            rejections: { increment: 1 },
          },
        });
      }
    }

    return true;
  } catch (e) {
    console.error("Error adding campaign rejections:", e);
    return false;
  }
};

module.exports = { getCampaignDeliveries, getCampaignDelivery, addCampaignDeilvery };