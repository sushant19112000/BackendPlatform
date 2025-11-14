const prisma = require("../../db/dbConnection");
const { leadCountUpdateTaskTrigger } = require("../client");

const bulkLeadUpload = async (
  leads,
  campaignId,
  uploadId,
  volumeId,
  pacingId,
  type
) => {
  const chunkSize = 10; // chunk size for efficiency
  let inserted = 0;
  let failed = 0;

  // 1️⃣ Deduplicate inside the file
  const uniqueLeads = Array.from(
    new Map(leads.map((lead) => [lead.email, lead])).values()
  );

  // 2️⃣ Fetch existing leads in DB for this campaign
  const existing = await prisma.lead.findMany({
    where: { campaignId },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((e) => e.email));

  // 3️⃣ Filter only brand-new leads
  const newLeads = uniqueLeads.filter((lead) => !existingEmails.has(lead.email));
  const totalLeads = newLeads.length;

  // 4️⃣ Insert leads individually in chunks
  for (let i = 0; i < totalLeads; i += chunkSize) {
    const chunk = newLeads.slice(i, i + chunkSize);

    // Insert in parallel with error handling
    const results = await Promise.allSettled(
      chunk.map(async (lead) => {
        const { email, ...otherFields } = lead;
        try {
          await prisma.lead.create({
            data: {
              campaignId,
              uploadId,
              volumeId,
              pacingId,
              email,
              data: otherFields,
              phase1Validation: true,
              leadTemplateValidation: type=="template"?true:false,
            },
          });
          inserted++;
        } catch (err) {
          console.error(`Lead insert failed for ${email}:`, err.message);
          failed++;
        }
      })
    );
  }
  leadCountUpdateTaskTrigger(campaignId, uploadId, pacingId, volumeId);
  return { total: totalLeads, inserted, failed };
};

module.exports = { bulkLeadUpload };
