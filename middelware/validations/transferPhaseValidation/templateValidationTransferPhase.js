const prisma = require("../../../db/dbConnection");

// makeCamelCase and validateValue functions remain the same
const makeCamelCase = str =>
  str
    .split(" ")
    .map((e, i) => (i ? e.charAt(0).toUpperCase() + e.slice(1).toLowerCase() : e.toLowerCase()))
    .join("");

const validateValue = (value, list, mode) => {
  if (typeof value !== 'string' && typeof value !== 'number') return mode !== "inclusion";
  return mode === "inclusion" ? list.includes(value) : !list.includes(value);
};

const validateContactsPerCompany = (domain, value, companyEmailDomainCounter) => {
  if ((companyEmailDomainCounter[domain] ?? 0) >= value) {
    return false; // already reached/exceeded limit
  }
  return true;
}


// ---------------- MAIN VALIDATION ----------------
const templateValidation = async (data, profile, campaignId, uploadId) => {
  try {
    const errors = [];
    const validData = [];
    const totalRows = data.length;

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
          const { regex, error, label, required } = profile.fieldRules[camelField];
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
          const { mode, fieldNames, values, error } = rule;

          if (fieldNames.includes(field)) {
            if (mode == "inclusion" || mode == "exclusion") {
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

      // // Duplicate check (in-memory)
      if (!hasValidationErrors) {
          const { email, ...otherFields } = lead;
          await prisma.lead.update({
            where:{
                campaignId:campaignId,
                email:email,
                leadTemplateValidation:true
            },
            data: {
              uploadId,
              email,
              data: otherFields
            }
          });
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


module.exports = templateValidation;