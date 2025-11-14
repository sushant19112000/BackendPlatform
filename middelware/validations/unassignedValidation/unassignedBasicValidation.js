const prisma = require("../../../db/dbConnection");
const XLSX = require("xlsx");
const Papa = require("papaparse");
const axios = require("axios")
// Loader function
async function loadDataFromUrl(url, fileType, valueField = null, field) {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Normalizer function
    const normalize = (val) => {
      if (!val) return null;
      let str = String(val).trim();
      if (field === "email" || field === "domain") {
        str = str.toLowerCase();
      }
      return str || null;
    };

    if (fileType === "json") {
      const jsonData = JSON.parse(Buffer.from(response.data).toString("utf8"));
      if (!Array.isArray(jsonData)) {
        throw new Error("Invalid JSON format: expected an array of values");
      }
      return jsonData.map(normalize).filter(Boolean);

    } else if (fileType === "csv") {
      const csvText = Buffer.from(response.data).toString("utf8");
      const parsed = Papa.parse(csvText, { skipEmptyLines: true });
      const rows = parsed.data;

      if (valueField == null) {
        throw new Error("CSV requires a valueField (column index)");
      }

      return rows.map(row => normalize(row[valueField])).filter(Boolean);

    } else if (fileType === "excel" || fileType === "xlsx") {
      const workbook = XLSX.read(response.data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

      if (valueField == null) {
        throw new Error("Excel requires a valueField (column index)");
      }

      return sheet.map(row => normalize(row[valueField])).filter(Boolean);

    } else {
      throw new Error(`Unsupported fileType: ${fileType}`);
    }
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
}

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
const unAssignedBasicValidation = async (data, profile, campaignId, uploadId, pacingId, volumeId) => {
  try {
    const errors = [];
    const validData = [];
    const totalRows = data.length;

    // 🔹 cache for external sources
    const sourceCache = {};

    // Get all existing emails in one query for this campaign
    const existingLeads = await prisma.lead.findMany({
      where: { campaignId },
      select: { email: true }
    });

    const existingEmailsSet = new Set(existingLeads.map(l => l.email.toLowerCase()));
    const companyEmailDomainCounter = {};
    for (let email of existingEmailsSet) {
      let d = email.split('@')[1]; // domain part
      if (companyEmailDomainCounter.hasOwnProperty(d)) {
        companyEmailDomainCounter[d] += 1;
      } else {
        companyEmailDomainCounter[d] = 1;
      }
    }

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
          const { mode, fieldNames, values, scope, error, source } = rule;

          if (fieldNames.includes(field)) {
            if (mode == "inclusion" || mode == "exclusion") {
              let valueToValidate = value;
              if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                valueToValidate = value.split('@')[1]; // domain part
              }

              if (source.type == "Internal") {
                if (!validateValue(valueToValidate, values, mode)) {
                  currentFieldErrors.push(error || `${mode} rule failed`);
                }
              } else {
                // 🔹 use cache key
                const key = `${source.link}|${source.fileType}|${source.valueField || ''}|${source.fieldType || ''}`;
                if (!sourceCache[key]) {
                  sourceCache[key] = await loadDataFromUrl(
                    source.link,
                    source.fileType,
                    source.valueField,
                    source.fieldType
                  );
                }
                const dataList = sourceCache[key];
                if (!validateValue(valueToValidate, dataList, mode)) {
                  currentFieldErrors.push(error || `${mode} rule failed`);
                }
              }
            }

            if (mode == "contactsPerCompany") {
              let valueToValidate = value;
              if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                valueToValidate = value.split('@')[1]; // domain part
              }
              if (validateContactsPerCompany(valueToValidate, values[0], companyEmailDomainCounter)) {
                companyEmailDomainCounter[valueToValidate] = (companyEmailDomainCounter[valueToValidate] ?? 0) + 1;
              } else {
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
          existingEmailsSet.add(lead.email.toLowerCase());
          const { email, ...otherFields } = lead;
          try {
            let tempLead =
              await prisma.lead.create({
                data: {
                  campaignId,
                  uploadId,
                  email,
                  volumeId: volumeId,
                  pacingId: pacingId,
                  phase1Validation: true,
                  data: otherFields
                }
              });
              console.log(tempLead)
          }
          catch (e) {
            console.log(e)
          }
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
    console.log({ totalRows, validRowsCount, errorRowsCount, errors, validData })
    return { totalRows, validRowsCount, errorRowsCount, errors, validData };
  } catch (e) {
    console.error("An unexpected error occurred during validation:", e);
    return [];
  }
};


module.exports = unAssignedBasicValidation;

