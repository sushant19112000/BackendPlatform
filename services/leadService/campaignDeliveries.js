const { json } = require("express");
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



// const addCampaignRejections = async (campaignId, data) => {
//   try {
//     const deliveriesToUpdate = {}
//     const campaign = await prisma.campaign.findFirst({
//       where: {
//         id: campaignId
//       }
//     })

//     if (!campaign) {
//       return false;
//     }
//     let leadsRejected = []
//     for (let rejectedLead of data) {
//       // find the lead by email and campaign
//       const lead = await prisma.lead.findFirst({
//         where: {
//           email: rejectedLead.email,
//           campaignId: campaignId,
//         },
//         include: { campaignDelivery: true },
//       });

//       if (!lead) {
//         console.warn(`Lead not found for email: ${rejectedLead.email}`);
//         continue;
//       }

//       // update only if a campaignDeliveryId exists
//       if (lead.campaignDeliveryId) {

//         let updatedLead = await prisma.lead.update({
//           where: { id: lead.id },
//           data: {
//             rejected: true,
//             rejectedReason: rejectedLead.rejectionReason || "No reason specified",
//             accepted: false,
//             pending: false,
//           },
//         });
//         let temp = `${updatedLead.campaignDeliveryId}-${updatedLead.email}`
//         leadsRejected.push(temp)

//         // optionally increment the rejection count in campaignDeliveries
//         // await prisma.campaignDeliveries.update({
//         //   where: { id: lead.campaignDeliveryId },
//         //   data: {
//         //     rejections: { increment: 1 },
//         //   },
//         // });

//         if (!Object.prototype.hasOwnProperty.call(deliveriesToUpdate, lead.campaignDeliveryId)) {
//           deliveriesToUpdate[lead.campaignDeliveryId] = [rejectedLead]
//         } else {
//           deliveriesToUpdate[lead.campaignDeliveryId].push(rejectedLead)
//         }

//       }
//     }

//     if (Object.keys(deliveriesToUpdate).length > 0) {
//       for (let id of Object.keys(deliveriesToUpdate)) {
//         let del = await prisma.campaignDeliveries.findFirst({
//           where: {
//             id: parseInt(id)
//           }
//         })
//         if (del) {
//           const newAccepted = Math.max(0, del.submitted - deliveriesToUpdate[id].length);
//           let delData = JSON.parse(del.data)
//           if (deliveriesToUpdate[id].length === 0) {
//             delStatus = "ALL_ACCEPTED";
//           } else if (deliveriesToUpdate[id].length === del.submitted) {
//             delStatus = "ALL_REJECTED";
//           } else {
//             delStatus = "PARTIALLY_ACCEPTED";
//           }


//           for (let d of delData) {
//             const findLead = deliveriesToUpdate[id].find(
//               e => e.email === (d.email || d.Email)
//             );

//             if (findLead) {

//               d.Accepted = false;
//               d.Reason = findLead.rejection
//             }
//             else {
//               d.Accepted = true;
//               d.Reason = ""
//             }
//           }

//           let updatedDelivery = await prisma.campaignDeliveries.update({
//             where: {
//               id: parseInt(id)
//             },
//             data: {
//               status: delStatus,
//               accepted: newAccepted,
//               rejections: deliveriesToUpdate[id].length,
//               data: JSON.stringify(delData)
//             }
//           })
//           console.log(updatedDelivery, 'updated delivery')


//         }
//       }
//     }

//     return campaign;
//   } catch (e) {
//     console.error("Error adding campaign rejections:", e);
//     return false;
//   }
// };




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

        // let updatedLead = await prisma.lead.update({
        //   where: { id: lead.id },
        //   data: {
        //     rejected: true,
        //     rejectedReason: rejectedLead.rejectionReason || "No reason specified",
        //     accepted: false,
        //     pending: false,
        //   },
        // });
        // let temp = `${updatedLead.campaignDeliveryId}-${updatedLead.email}`
        // leadsRejected.push(temp)

        // optionally increment the rejection count in campaignDeliveries
        // await prisma.campaignDeliveries.update({
        //   where: { id: lead.campaignDeliveryId },
        //   data: {
        //     rejections: { increment: 1 },
        //   },
        // });

        if (!Object.prototype.hasOwnProperty.call(deliveriesToUpdate, lead.campaignDeliveryId)) {
          deliveriesToUpdate[lead.campaignDeliveryId] = [rejectedLead]
        } else {
          deliveriesToUpdate[lead.campaignDeliveryId].push(rejectedLead)
        }

      }
    }

    if (Object.keys(deliveriesToUpdate).length > 0) {
      for (let id of Object.keys(deliveriesToUpdate)) {
        let del = await prisma.campaignDeliveries.findFirst({
          where: {
            id: parseInt(id)
          },
          include:{leads:true}
        })
        if (del) {
          for (let l of del.leads) {
            const findLead = deliveriesToUpdate[id].find(
              e => e.email === (l.email)
            );
            if (findLead) {
              let updatedLead = await prisma.lead.update({
                where: { id: l.id },
                data: {
                  rejected: true,
                  rejectedReason: findLead.rejectionReason || "No reason specified",
                  accepted: false,
                  pending: false,
                  leadstatus:"CL_REJECTED"
                },
              });
            }
            else{
              let updatedLead = await prisma.lead.update({
                where: { id: l.id },
                data: {
                  rejected: false,
                  rejectedReason:"",
                  accepted: true,
                  pending: false,
                  leadstatus:"CL_ACCEPTED"
                },
              });
            }
          }
          const newAccepted = Math.max(0, del.submitted - deliveriesToUpdate[id].length);
          let delData = JSON.parse(del.data)
          if (deliveriesToUpdate[id].length === 0) {
            delStatus = "ALL_ACCEPTED";
          } else if (deliveriesToUpdate[id].length === del.submitted) {
            delStatus = "ALL_REJECTED";
          } else {
            delStatus = "PARTIALLY_ACCEPTED";
          }


          for (let d of delData) {
            const findLead = deliveriesToUpdate[id].find(
              e => e.email === (d.email || d.Email)
            );

            if (findLead) {

              d.Accepted = false;
              d.Reason = findLead.rejection
            }
            else {
              d.Accepted = true;
              d.Reason = ""
            }
          }

          let updatedDelivery = await prisma.campaignDeliveries.update({
            where: {
              id: parseInt(id)
            },
            data: {
              status: delStatus,
              accepted: newAccepted,
              rejections: deliveriesToUpdate[id].length,
              data: JSON.stringify(delData)
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

    let delData = JSON.parse(delivery.data)


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
        if (delData.length > 0) {
          for (let d of delData) {
            d.Accepted = true;
            d.Reason = ""
          }
        }

        let updated = await prisma.campaignDeliveries.update({
          where: {
            id: delivery.id
          },
          data: {
            status: "ALL_ACCEPTED",
            accepted: delivery.submitted,
            rejections: 0,
            data: JSON.stringify(delData)
          },
          include: { campaign: true, leads: true }
        })
        return updated;
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
        if (delData.length > 0) {
          for (let d of delData) {
            d.Accepted = false;
            d.Reason = "No reason specified"
          }
        }
        let updated = await prisma.campaignDeliveries.update({
          where: {
            id: delivery.id
          },
          data: {
            status: "ALL_REJECTED",
            rejections: delivery.submitted,
            accepted: 0,
            data: JSON.stringify(delData)
          },
          include: { campaign: true, leads: true }
        })
        return updated;
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