const prisma = require("../db/dbConnection")
const { v4: uuidv4 } = require("uuid");
const celery = require("celery-node");
const celeryConfig = require("./config");
const { json } = require("express");
const validation = require("./validations/validation");

const client = celery.createClient(
  celeryConfig.BROKER_URL,
  celeryConfig.CELERY_RESULT_BACKEND,
  celeryConfig.QUEUE
);




// const assignedValidationService = async (
//   data,
//   profiles,
//   campaignId,
//   uploadId,
//   pacingId,
//   volumeId,
//   socket,
//   userId
// ) => {
//   const { basicValidationProfile, templateValidationProfile } = profiles;
//   const batchId = uuidv4(); // unique batch ID for this upload

//   try {
//     const existingLeads = await prisma.lead.findMany({
//       where: { campaignId },
//       select: { email: true },
//     });

//     // 1️⃣ Basic Validation
//     socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Running basic validation...", percentage: 20 });
//     const basicValidationTask = client.createTask("tasks.basicValidation");
//     const basicResult = await (await basicValidationTask.applyAsync([data, basicValidationProfile, existingLeads])).get();
//     if (!basicResult.validRowsCount) {
//       // Update upload with validation results
//       await prisma.leadsUpload.update({
//         where: { id: uploadId },
//         data: { results: JSON.stringify(basicResult) },
//       });
//       socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation failed.", percentage: 25, result: basicResult });
//       return;
//     }
//     socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation completed.", percentage: 25 });


//     // 2️⃣ Template Validation
//     socket.emit("validationProgress", { batchId, userId, step: "templateValidation", message: "Running template validation...", percentage: 40 });
//     const templateValidationTask = client.createTask("tasks.templateValidation");
//     const templateResult = await (await templateValidationTask.applyAsync([basicResult.validData, templateValidationProfile, existingLeads])).get();

//     let totalRows = basicResult.totalRows || data.length;
//     let validRowsCount = 0;
//     let validData = [];
//     let errorRowsCount = basicResult.errorRowsCount || 0;
//     let errors = basicResult.errors || [];

//     // merge results using your logic
//     if (templateResult.validRowsCount && templateResult.validRowsCount > 0) {
//       validRowsCount = templateResult.validRowsCount;
//       validData = templateResult.validData;
//     }

//     if (templateResult.errorRowsCount && templateResult.errorRowsCount > 0) {
//       errorRowsCount += templateResult.errorRowsCount;
//       errors = [
//         ...(basicResult.errors || []),
//         ...(templateResult.errors || [])
//       ];
//     }
//     const mergedErrors = [...(basicResult.errors || []), ...(templateResult.errors || [])];
//     if (templateResult.validRowsCount == 0) {
//       await prisma.leadsUpload.update({
//         where: { id: uploadId },
//         data: { results: JSON.stringify({ validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData }) },
//       });
//       socket.emit("validationProgress", {
//         batchId, userId, step: "templateValidation", message: "Template validation failed.", percentage: 60,
//         result: { validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData }
//       });
//       return;
//     }



//     let leadUploadResult = JSON.stringify({ validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData })

//     // Update upload with validation results
//     await prisma.leadsUpload.update({
//       where: { id: uploadId },
//       data: { results: leadUploadResult },
//     });

//     socket.emit("validationProgress", { batchId, userId, step: "templateValidation", message: "Template validation completed.", percentage: 60, result: { validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, validData: templateResult.validData } });




//     // 3️⃣ Bulk Lead Upload (incremental progress)
//     socket.emit("validationProgress", { batchId, userId, step: "bulkUpload", message: "Uploading leads...", percentage: 60 });
//     const bulkUploadTask = client.createTask("tasks.bulkLeadUpload");

//     const chunkSize = 20; // adjust chunk size for smooth updates
//     const totalLeads = templateResult.validData.length;
//     let inserted = 0, failed = 0;

//     for (let i = 0; i < totalLeads; i += chunkSize) {
//       const chunk = templateResult.validData.slice(i, i + chunkSize);
//       const chunkResult = await (await bulkUploadTask.applyAsync([
//         chunk,
//         campaignId,
//         uploadId,
//         volumeId,
//         pacingId
//       ])).get();
//       inserted += chunkResult.inserted || 0;
//       failed += chunkResult.failed || 0;

//       const progress = 60 + Math.floor(((i + chunk.length) / totalLeads) * 25); // from 60% to 85%
//       socket.emit("validationProgress", {
//         batchId, userId, step: "bulkUpload", message: "Uploading leads...", percentage: progress,
//         result: { inserted, failed, total: totalLeads }
//       });
//     }




//     // 4️⃣ Lead Count Update (incremental if needed)
//     socket.emit("validationProgress", { batchId, userId, step: "leadCountUpdate", message: "Updating lead counts...", percentage: 85 });
//     const leadCountUpdateTask = client.createTask("tasks.leadCountUpdateTask");
//     const leadCountUpdateResult = await (await leadCountUpdateTask.applyAsync([campaignId, uploadId, pacingId, volumeId])).get();
//     socket.emit("validationProgress", { batchId, userId, step: "leadCountUpdate", message: "Lead counts updated.", percentage: 100, result: { message: "Lead Counts Updated" } });

//     // ✅ Final completed event
//     socket.emit("validationProgress", { batchId, userId, step: "completed", message: "All steps finished successfully.", percentage: 100 });

//   } catch (err) {
//     console.error("Assigned Validation Service Error:", err);
//     socket.emit("validationProgress", { batchId, userId, step: "failed", message: "An unexpected error occurred.", percentage: 0, error: err.message || err });
//   }
// };

// module.exports = { assignedValidationService }



const leadCountUpdateTaskTrigger = async (campaignId, uploadId, pacingId, volumeId) => {
  const leadCountUpdateTask = client.createTask("tasks.leadCountUpdateTask");
  await leadCountUpdateTask.applyAsync([campaignId, uploadId, pacingId, volumeId]);
}

const assignedValidationService = async (
  data,
  profiles,
  campaignId,
  uploadId,
  pacingId,
  volumeId,
  socket,
  userId
) => {
  const { externalRules, leadTemplate } = profiles;
  const batchId = uuidv4(); // unique batch ID for this upload

  try {
    const existingLeads = await prisma.lead.findMany({
      where: { campaignId },
      select: { email: true },
    });

    // 1️⃣ Basic Validation
    socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Running basic validation...", percentage: 20 });
    const basicValidationTask = client.createTask("tasks.basicValidation");
    const basicResult = await (await basicValidationTask.applyAsync([data, basicValidationProfile, existingLeads])).get();

    if (!basicResult.validRowsCount) {
      await prisma.leadsUpload.update({
        where: { id: uploadId },
        data: { results: JSON.stringify(basicResult) },
      });
      socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation failed.", percentage: 25, result: basicResult });
      return;
    }

    socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation completed.", percentage: 25 });

    // 2️⃣ Template Validation
    socket.emit("validationProgress", { batchId, userId, step: "templateValidation", message: "Running template validation...", percentage: 40 });
    const templateValidationTask = client.createTask("tasks.templateValidation");
    const templateResult = await (await templateValidationTask.applyAsync([basicResult.validData, templateValidationProfile, existingLeads])).get();

    let totalRows = basicResult.totalRows || data.length;
    const mergedErrors = [...(basicResult.errors || []), ...(templateResult.errors || [])];

    if (templateResult.validRowsCount == 0) {
      await prisma.leadsUpload.update({
        where: { id: uploadId },
        data: { results: JSON.stringify({ validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData }) },
      });
      socket.emit("validationProgress", {
        batchId, userId, step: "templateValidation", message: "Template validation failed.", percentage: 60,
        result: { validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData }
      });
      return;
    }

    const leadUploadResult = JSON.stringify({ validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, totalRows, validData: templateResult.validData });
    await prisma.leadsUpload.update({
      where: { id: uploadId },
      data: { results: leadUploadResult },
    });

    socket.emit("validationProgress", { batchId, userId, step: "templateValidation", message: "Template validation completed.", percentage: 60, result: { validRowsCount: templateResult.validRowsCount, errorRowsCount: mergedErrors.length, errors: mergedErrors, validData: templateResult.validData } });

    // 3️⃣ Bulk Lead Upload & Lead Count Update (silent, no socket emit)
    const bulkUploadTask = client.createTask("tasks.bulkLeadUpload");
    await bulkUploadTask.applyAsync([templateResult.validData, campaignId, uploadId, volumeId, pacingId, "template"]);



    // ✅ Final completed event
    socket.emit("validationProgress", { batchId, userId, step: "completed", message: "All steps finished successfully.", percentage: 100 });

  } catch (err) {
    console.error("Assigned Validation Service Error:", err);
    socket.emit("validationProgress", { batchId, userId, step: "failed", message: "An unexpected error occurred.", percentage: 0, error: err.message || err });
  }
};


const unAssignedValidationService = async (
  data,
  profiles,
  campaignId,
  uploadId,
  pacingId,
  volumeId,
  socket,
  userId
) => {
  const { basicValidationProfile, templateValidationProfile } = profiles;
  const batchId = uuidv4(); // unique batch ID for this upload

  try {
    const existingLeads = await prisma.lead.findMany({
      where: { campaignId },
      select: { email: true },
    });

    // 1️⃣ Basic Validation
    socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Running basic validation...", percentage: 20 });
    const basicValidationTask = client.createTask("tasks.basicValidation");
    const basicResult = await (await basicValidationTask.applyAsync([data, basicValidationProfile, existingLeads])).get();

    if (!basicResult.validRowsCount) {
      await prisma.leadsUpload.update({
        where: { id: uploadId },
        data: { results: JSON.stringify(basicResult) },
      });
      socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation failed.", percentage: 80, result: basicResult });
      return;
    }

    socket.emit("validationProgress", { batchId, userId, step: "basicValidation", message: "Basic validation completed.", percentage: 80, result: basicResult });


    // 3️⃣ Bulk Lead Upload & Lead Count Update (silent, no socket emit)
    const bulkUploadTask = client.createTask("tasks.bulkLeadUpload");
    await bulkUploadTask.applyAsync([basicResult.validData, campaignId, uploadId, volumeId, pacingId, "basic"]);



    // ✅ Final completed event
    socket.emit("validationProgress", { batchId, userId, step: "completed", message: "All steps finished successfully.", percentage: 100 });

  } catch (err) {
    console.error("Assigned Validation Service Error:", err);
    socket.emit("validationProgress", { batchId, userId, step: "failed", message: "An unexpected error occurred.", percentage: 0, error: err.message || err });
  }
};


// const assignedValidationService = async (
//   data,
//   profiles,
//   campaignId,
//   uploadId,
//   pacingId,
//   volumeId,
//   socket,
//   userId
// ) => {
//   const { basicValidationProfile, templateValidationProfile } = profiles;
//   const batchId = uuidv4(); // unique batch ID for this upload

//   try {
//     const existingLeads = await prisma.lead.findMany({
//       where: { campaignId },
//       select: { email: true },
//     });

//     // keep a single result object to accumulate progress
//     let finalResult = {
//       totalRows: data.length,
//       validRowsCount: 0,
//       errorRowsCount: 0,
//       errors: [],
//       validData: [],
//       inserted: 0,
//       failed: 0,
//       leadCount: 0,
//     };

//     // 1️⃣ Basic Validation
//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "basicValidation",
//       message: "Running basic validation...",
//       percentage: 20,
//     });

//     const basicValidationTask = client.createTask("tasks.basicValidation");
//     const basicResult = await (
//       await basicValidationTask.applyAsync([
//         data,
//         basicValidationProfile,
//         existingLeads,
//       ])
//     ).get();

//     if (!basicResult.validRowsCount) {
//       socket.emit("validationProgress", {
//         batchId,
//         userId,
//         step: "basicValidation",
//         message: "Basic validation failed.",
//         percentage: 25,
//         result: basicResult,
//       });
//       return;
//     }

//     finalResult = {

//       totalRows: basicResult.totalRows || data.length,
//     };

//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "basicValidation",
//       message: "Basic validation completed.",
//       percentage: 25,
//       result: basicResult,
//     });

//     // 2️⃣ Template Validation
//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "templateValidation",
//       message: "Running template validation...",
//       percentage: 40,
//     });

//     const templateValidationTask = client.createTask("tasks.templateValidation");
//     const templateResult = await (
//       await templateValidationTask.applyAsync([
//         basicResult.validData,
//         templateValidationProfile,
//         existingLeads,
//       ])
//     ).get();

//     if (templateResult.validRowsCount === 0) {
//       finalResult = {
//         ...templateResult,
//         errorRowsCount:
//           (basicResult.errorRowsCount || 0) +
//           (templateResult.errorRowsCount || 0),
//         errors: [
//           ...(basicResult.errors || []),
//           ...(templateResult.errors || []),
//         ],
//       };

//       socket.emit("validationProgress", {
//         batchId,
//         userId,
//         step: "templateValidation",
//         message: "Template validation failed.",
//         percentage: 60,
//         result: finalResult,
//       });
//       return;
//     }

//     finalResult = {
//       ...finalResult,
//       ...templateResult,
//       errorRowsCount:
//         (basicResult.errorRowsCount || 0) +
//         (templateResult.errorRowsCount || 0),
//       errors: [
//         ...(basicResult.errors || []),
//         ...(templateResult.errors || []),
//       ],
//     };

//     await prisma.leadsUpload.update({
//       where: { id: uploadId },
//       data: { results: JSON.stringify(finalResult) },
//     });

//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "templateValidation",
//       message: "Template validation completed.",
//       percentage: 60,
//       result: finalResult,
//     });

//     // 3️⃣ Bulk Lead Upload
//     const bulkUploadTask = client.createTask("tasks.bulkLeadUpload");
//     const chunkSize = 50;
//     const totalLeads = templateResult.validData.length;

//     for (let i = 0; i < totalLeads; i += chunkSize) {
//       const chunk = templateResult.validData.slice(i, i + chunkSize);
//       const chunkResult = await (
//         await bulkUploadTask.applyAsync([
//           chunk,
//           campaignId,
//           uploadId,
//           volumeId,
//           pacingId,
//         ])
//       ).get();

//       finalResult.inserted += chunkResult.inserted || 0;
//       finalResult.failed += chunkResult.failed || 0;

//       const progress =
//         60 + Math.floor(((i + chunk.length) / totalLeads) * 25); // from 60% → 85%

//       socket.emit("validationProgress", {
//         batchId,
//         userId,
//         step: "bulkUpload",
//         message: "Uploading leads...",
//         percentage: progress,
//         result: finalResult,
//       });
//     }

//     // 4️⃣ Lead Count Update
//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "leadCountUpdate",
//       message: "Updating lead counts...",
//       percentage: 85,
//     });

//     const leadCountUpdateTask = client.createTask("tasks.leadCountUpdateTask");
//     const leadCountUpdateResult = await (
//       await leadCountUpdateTask.applyAsync([
//         campaignId,
//         uploadId,
//         pacingId,
//         volumeId,
//       ])
//     ).get();

//     finalResult.leadCount = leadCountUpdateResult.totalLeads || 0;

//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "leadCountUpdate",
//       message: "Lead counts updated.",
//       percentage: 95,
//       result: finalResult,
//     });

//     // ✅ Final completed event
//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "completed",
//       message: "All steps finished successfully.",
//       percentage: 100,
//       result: finalResult,
//     });
//   } catch (err) {
//     console.error("Assigned Validation Service Error:", err);
//     socket.emit("validationProgress", {
//       batchId,
//       userId,
//       step: "failed",
//       message: "An unexpected error occurred.",
//       percentage: 0,
//       error: err.message || err,
//     });
//   }
// };




const validationService = async (
  data,
  profiles,
  campaignId,
  uploadId,
  pacingId,
  volumeId,
  socket,
  userId
) => {
  const batchId = uuidv4(); // unique batch ID for this upload

  try {
    // Fetch existing leads
    const existingLeads = await prisma.lead.findMany({
      where: { campaignId },
      select: { email: true },
    });

    /* -------------------- 1️⃣ Basic Validation -------------------- */
    socket.emit("validationProgress", {
      batchId,
      userId,
      step: "validation",
      message: "Running  validations...",
      percentage: 50,
    });

    const validation = client.createTask("tasks.validation");
    const validationResult = await (
      await validation.applyAsync([data, profiles, existingLeads])
    ).get();

    // If no valid rows, stop here

    await prisma.leadsUpload.update({
      where: { id: uploadId },
      data: { results: validationResult },
    });

    socket.emit("validationProgress", {
      batchId,
      userId,
      step: "validation",
      message: "Validation Result",
      percentage: 65,
      result: validationResult,
    });


    if (!validationResult.validData.length) {
      socket.emit("validationProgress", {
        batchId,
        userId,
        step: "completed",
        message: "No valid leads found.",
        percentage: 100,
      });
      return;
    }
    /* -------------------- 2️⃣ Bulk Lead Upload -------------------- */
    const bulkUploadTask = client.createTask("tasks.bulkLeadUpload");
    if (validationResult.validData.length > 0) {
      await bulkUploadTask.applyAsync([
        validationResult.validData,
        campaignId,
        uploadId,
        volumeId,
        pacingId,
        "template",
      ]);
    }

    /* -------------------- ✅ Completed -------------------- */
    socket.emit("validationProgress", {
      batchId,
      userId,
      step: "completed",
      message: "All steps finished successfully.",
      percentage: 100,
    });
  } catch (err) {
    console.error("Assigned Validation Service Error:", err);

    socket.emit("validationProgress", {
      batchId,
      userId,
      step: "failed",
      message: "An unexpected error occurred.",
      percentage: 0,
      error: err?.message || "Unknown error",
    });
  }
};

module.exports = { assignedValidationService, leadCountUpdateTaskTrigger, unAssignedValidationService, validationService };
