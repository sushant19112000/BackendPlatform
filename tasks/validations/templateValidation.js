
const axios = require("axios")
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
const templateValidation = async (data, profileT, campaignId, uploadId, pacingId, volumeId) => {
  try {
   
    const profile=profileT.leadTemplate
    const errors = [];
    const validData = [];
    const totalRows = data.length;
  
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const lead = data[rowIndex];
      if (!lead) continue; // skip undefined rows
      const { index = null, ...rest } = lead;

      // currentLeadData now has all fields except index
      const currentLeadData = { ...rest };
      let hasValidationErrors = false;
      const fieldValidationErrors = {};

      for (let field in currentLeadData) {
        const value = currentLeadData[field];
        const camelField = field;
        const currentFieldErrors = [];
       
        if (profile.fieldRules[camelField]) {
          const { regex, error, label, required } = profile.fieldRules[camelField];
          if (required || (/[a-zA-Z0-9]/.test(value))) {
            try {
              const regexObject = new RegExp(regex);
              if (value && !regexObject.test(value)) {
                currentFieldErrors.push(error);
              }
            } catch (e) {
              currentFieldErrors.push(`Malformed regex for field '${field}': ${e.message}`);
            }
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

      if (hasValidationErrors) {
        errors.push({
          ...lead,            // spread other lead fields
          _errors: fieldValidationErrors
        });
      } else {
        validData.push({
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