const prisma = require("../db/dbConnection");

// makeCamelCase and validateValue functions remain the same
const makeCamelCase = str =>
  str
    .split(" ")
    .map((e, i) => (i ? e.charAt(0).toUpperCase() + e.slice(1).toLowerCase() : e.toLowerCase()))
    .join("");

const validateValue = (value, list, mode) => {
  // Ensure value is a string before calling .includes, prevents errors on null/undefined
  if (typeof value !== 'string' && typeof value !== 'number') return mode !== "inclusion";
  return mode === "inclusion" ? list.includes(value) : !list.includes(value);
};

// // --- CORRECTED leadValidation Function ---
// const leadValidation = async (data, profile, campaignId,uploadId) => {
//   try {
//     const errors = [];
//     const validData = [];
//     const totalRows = data.length;

//     data.forEach(async (lead, index) => {
//       const currentLeadData = { ...lead };
//       let hasValidationErrors = false;
//       const fieldValidationErrors = {};

//       for (let field in currentLeadData) {
//         const value = currentLeadData[field];

//         const camelField = field;

//         const currentFieldErrors = [];

//         // 1. Field regex validation
//         if (profile.fieldRules[camelField]) {

//           const { regex, error } = profile.fieldRules[camelField];
//           try {
//             const regexObject = new RegExp(regex);
//             // Don't test null or undefined values against regex, let required rule handle it
//             if (value && !regexObject.test(value)) {
//               currentFieldErrors.push(error);
//             }
//           } catch (e) {
//             currentFieldErrors.push(`Malformed regex for field '${field}': ${e.message}`);
//           }
//         }

//         // 2. Value rule validation
//         for (const rule of profile.valueRules) {
//           const { mode, fieldNames, values, scope, error } = rule;

//           if (fieldNames.includes(field)) { // Use the original field name to match the rules
//             const leadSplit = currentLeadData.split || null;
//             const validScope = scope === "global" || leadSplit === scope;

//             if (validScope) {
//               let valueToValidate = value;


//               if (field === 'email' && typeof value === 'string' && value.includes('@')) {
//                 valueToValidate = value.split('@')[1]; // Get the domain part
//               }

//               if (!validateValue(valueToValidate, values, mode)) {
//                 currentFieldErrors.push(error || `${mode} rule failed`);
//               }
//             }
//           }
//         }

//         if (currentFieldErrors.length > 0) {
//           fieldValidationErrors[field] = currentFieldErrors;
//           hasValidationErrors = true;
//         }
//       }

//       if (!hasValidationErrors) {
//         // check lead exist in the db and upload the lead
//         const checkLeadExist = await prisma.lead.findFirst({ where: { email: lead.email } })
//         if (checkLeadExist) {
//           hasValidationErrors = true;
//           email=lead.email;
//           fieldValidationErrors[email]=['Duplicate lead'];
//         }
//         else {
//           const { email, ...otherFields } = lead; // Extract email and keep rest
//           await prisma.lead.create({
//             data: {
//               campaignId: campaignId,
//               uploadId: uploadId,
//               email: email,
//               data: otherFields  // All other key-values except email
//             }
//           });
//         }
//       }



//       if (hasValidationErrors) {
//         errors.push({
//           index: index,
//           ...lead, // Use the original lead data
//           _errors: fieldValidationErrors
//         });
//       } else {
//         validData.push(
//           {
//             index: index,
//             ...lead
//           }
//         )
//       }
//     });

//     const validRowsCount = totalRows - errors.length;
//     const errorRowsCount = errors.length;

//     return { totalRows, validRowsCount: validRowsCount, errorRowsCount: errorRowsCount, errors: errors, validData: validData }
//   } catch (e) {
//     console.error("An unexpected error occurred during validation:", e);
//     return []; // Return empty on critical failure
//   }
// };

const leadValidation = async (data, profile, campaignId, uploadId,pacingId,
            volumeId) => {
  try {
    const errors = [];
    const validData = [];
    const totalRows = data.length;

    // Get all existing emails in one query for this campaign
    const existingLeads = await prisma.lead.findMany({
      where: { campaignId },
      select: { email: true }
    });
    const existingEmailsSet = new Set(existingLeads.map(l => l.email.toLowerCase()));

    for (let index = 0; index < data.length; index++) {
      const lead = data[index];
      const currentLeadData = { ...lead };
      let hasValidationErrors = false;
      const fieldValidationErrors = {};

      for (let field in currentLeadData) {
        const value = currentLeadData[field];
        const camelField = field;
        const currentFieldErrors = [];

        // 1. Field regex validation
        if (profile.fieldRules[camelField]) {
          const { regex, error } = profile.fieldRules[camelField];
          try {
            const regexObject = new RegExp(regex);
            if (value && !regexObject.test(value)) {
              currentFieldErrors.push(error);
            }
          } catch (e) {
            currentFieldErrors.push(`Malformed regex for field '${field}': ${e.message}`);
          }
        }

        // 2. Value rule validation
        for (const rule of profile.valueRules) {
          const { mode, fieldNames, values, scope, error } = rule;

          if (fieldNames.includes(field)) {
            const leadSplit = currentLeadData.split || null;
            const validScope = scope === "global" || leadSplit === scope;

            if (validScope) {
              let valueToValidate = value;

              if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                valueToValidate = value.split('@')[1]; // domain part
              }

              if (!validateValue(valueToValidate, values, mode)) {
                currentFieldErrors.push(error || `${mode} rule failed`);
              }
            }
          }
        }

        if (currentFieldErrors.length > 0) {
          fieldValidationErrors[field] = currentFieldErrors;
          hasValidationErrors = true;
        }
      }

      // Duplicate check (in-memory)
      if (!hasValidationErrors) {
        if (existingEmailsSet.has(lead.email.toLowerCase())) {
          hasValidationErrors = true;
          fieldValidationErrors.email = ['Duplicate lead'];
        } else {
          // Add to Set immediately so we catch duplicates within the same upload
          existingEmailsSet.add(lead.email.toLowerCase());

          const { email, ...otherFields } = lead;
          await prisma.lead.create({
            data: {
              campaignId,
              uploadId,
              email,
              volumeId:volumeId,
              pacingId:pacingId,
              data: otherFields
            }
          });
        }
      }

      if (hasValidationErrors) {
        errors.push({
          index,
          ...lead,
          _errors: fieldValidationErrors
        });
      } else {
        validData.push({
          index,
          ...lead
        });
      }
    }

    const validRowsCount = totalRows - errors.length;
    const errorRowsCount = errors.length;

    return { totalRows, validRowsCount, errorRowsCount, errors, validData };
  } catch (e) {
    console.error("An unexpected error occurred during validation:", e);
    return [];
  }
};

module.exports = leadValidation;