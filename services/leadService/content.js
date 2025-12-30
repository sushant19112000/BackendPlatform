// const prisma = require('../../db/dbConnection');
// const { v4: uuidv4 } = require('uuid');

// // ✅ Add a new content entry
// const addContent = async (campaignId, data) => {
//     try {
//         if (!data.title || !data.type) {
//             throw new Error("Content must include 'title' and 'type'");
//         }

//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         if (!campaign) throw new Error("Campaign not found");

//         // Normalize new entry
//         const newEntry = {
//             id: data.id || uuidv4(),
//             title: data.title,
//             type: data.type,
//             approveDate: data.approveDate ? new Date(data.approveDate).toISOString() : null,
//             optinType: data.optinType || ""
//         };

//         const categoryName = data.category || "global";
//         let updatedContent = [...(campaign.content || [])];

//         // Find category index
//         const categoryIndex = updatedContent.findIndex(c => c.categoryName === categoryName);

//         if (categoryIndex !== -1) {
//             // ✅ Add to existing category
//             updatedContent[categoryIndex].content.push(newEntry);
//         } else {
//             // ✅ Create new category with content
//             updatedContent.push({
//                 categoryName,
//                 content: [newEntry]
//             });
//         }

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { content: updatedContent }
//         });

//         return updatedCampaign;

//     } catch (e) {
//         console.error("addContent error:", e.message);
//         throw e;
//     }
// };

// // ✅ Update a content entry (by content id)
// const updateContent = async (campaignId, contentId, newData) => {
//     try {
//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         if (!campaign) throw new Error("Campaign not found");

//         const currentContent = campaign.content || [];
//         const index = currentContent.findIndex(c => c.id === contentId);

//         if (index === -1) {
//             throw new Error("Content with given ID not found");
//         }

//         // Merge existing content with new data
//         const updatedEntry = {
//             ...currentContent[index],
//             ...newData,
//             approveDate: newData.approveDate
//                 ? new Date(newData.approveDate).toISOString()
//                 : currentContent[index].approveDate
//         };

//         currentContent[index] = updatedEntry;

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { content: currentContent }
//         });

//         return { updatedCampaign, updatedEntry };

//     } catch (e) {
//         console.error("updateContent error:", e.message);
//         throw e;
//     }
// };

// // ✅ Delete a content entry (by content id)
// const deleteContent = async (campaignId, contentId) => {
//     try {
//         const campaign = await prisma.campaign.findFirst({ where: { id: campaignId } });
//         if (!campaign) throw new Error("Campaign not found");

//         const currentContent = campaign.content || [];
//         const deletedEntry = currentContent.find(c => c.id === contentId);

//         if (!deletedEntry) {
//             throw new Error("Content with given ID not found");
//         }

//         const updatedContent = currentContent.filter(c => c.id !== contentId);

//         const updatedCampaign = await prisma.campaign.update({
//             where: { id: campaign.id },
//             data: { content: updatedContent }
//         });

//         return { updatedCampaign, deletedEntry };

//     } catch (e) {
//         console.error("deleteContent error:", e.message);
//         throw e;
//     }
// };

// module.exports = { addContent, updateContent, deleteContent };


const prisma = require('../../db/dbConnection');
const { v4: uuidv4 } = require('uuid');

/* ----------------------------------------------------
   ✅ ADD CONTENT
---------------------------------------------------- */
const addContent = async (campaignId, data) => {
  try {
    if (!data.title || !data.type) {
      throw new Error("Content must include 'title' and 'type'");
    }

    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId }
    });
    if (!campaign) throw new Error("Campaign not found");

    const newEntry = {
      id: data.id || uuidv4(),
      title: data.title,
      type: data.type,
      approveDate: data.approveDate
        ? new Date(data.approveDate).toISOString()
        : "",
      optinType: data.optinType || ""
    };

    const categoryName = data.category || "global";
    const updatedContent = [...(campaign.content || [])];

    const categoryIndex = updatedContent.findIndex(
      c => c.categoryName === categoryName
    );

    if (categoryIndex !== -1) {
      updatedContent[categoryIndex].content.push(newEntry);
    } else {
      updatedContent.push({
        categoryName,
        content: [newEntry]
      });
    }

    return await prisma.campaign.update({
      where: { id: campaign.id },
      data: { content: updatedContent }
    });

  } catch (e) {
    console.error("addContent error:", e.message);
    throw e;
  }
};


/* ----------------------------------------------------
   ✅ UPDATE CONTENT (FIXED)
---------------------------------------------------- */
const updateContent = async (campaignId, contentId, newData) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId }
    });
    if (!campaign) throw new Error("Campaign not found");

    const categories = campaign.content || [];
    let updatedEntry = null;
    let found = false;

    for (const category of categories) {
      const index = category.content.findIndex(c => c.id === contentId);

      if (index !== -1) {
        updatedEntry = {
          ...category.content[index],
          ...newData,
          approveDate: newData.approveDate
            ? new Date(newData.approveDate).toISOString()
            : category.content[index].approveDate
        };

        category.content[index] = updatedEntry;
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error("Content with given ID not found");
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { content: categories }
    });

    return { updatedCampaign, updatedEntry };

  } catch (e) {
    console.error("updateContent error:", e.message);
    throw e;
  }
};


/* ----------------------------------------------------
   ✅ DELETE CONTENT (FIXED)
---------------------------------------------------- */
const deleteContent = async (campaignId, contentId) => {
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId }
    });
    if (!campaign) throw new Error("Campaign not found");

    const categories = campaign.content || [];
    let deletedEntry = null;
    let found = false;

    for (const category of categories) {
      const index = category.content.findIndex(c => c.id === contentId);

      if (index !== -1) {
        deletedEntry = category.content[index];
        category.content.splice(index, 1);
        found = true;

        // Optional: remove empty category
        if (category.content.length === 0) {
          categories.splice(categories.indexOf(category), 1);
        }
        break;
      }
    }

    if (!found) {
      throw new Error("Content with given ID not found");
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { content: categories }
    });

    return { updatedCampaign, deletedEntry };

  } catch (e) {
    console.error("deleteContent error:", e.message);
    throw e;
  }
};

module.exports = { addContent, updateContent, deleteContent };
