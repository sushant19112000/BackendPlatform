const XLSX = require("xlsx");
const axios = require("axios")
const Papa = require("papaparse");
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

const validateEmail = (value, firstName, lastName) => {
    if (value.includes(firstName.toLowerCase()) || value.includes(lastName.toLowerCase())) {
        if (value == "mruber@zeb.de" || value == "giaranco.falco@akb.ch") {
            console.log(firstName, lastName, 'firstName', 'lastName')
            console.log({ flag: true, error: "None" })
        }
        return { flag: true, error: "None" };
    }
    else {
        if (value == "mruber@zeb.de") {
            console.log(firstName.toLowerCase(), lastName.toLowerCase(), 'firstName', 'lastName')
            console.log({ flag: false, error: "Emails must refer either to the First Name or the Last Name or both the first and last name." })
        }

        return { flag: false, error: "Emails must refer either to the First Name or the Last Name or both the first and last name." }
    }
}

const validateContactsPerCompany = (domain, maxCount, companyEmailDomainCounter) => {
    const currentCount = companyEmailDomainCounter[domain] ?? 0;

    // Return false if already reached max
    return currentCount < maxCount;
};

// ---------------- MAIN VALIDATION ----------------
const validation = async (data, profiles, existingLeads) => {
    try {

        // const profile = profileT;
        const { externalRules, leadTemplate } = profiles
        const errors = [];
        const validData = [];
        const totalRows = data.length;
        const sourceCache = {};


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

                if (leadTemplate.fieldRules[camelField]) {
                    const { regex, error, label, required } = leadTemplate.fieldRules[camelField];
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

                if (field == "email") {
                    let emailValidateResponse = validateEmail(value, currentLeadData['firstName'], currentLeadData['lastName']);
                    if (!emailValidateResponse.flag) {
                        currentFieldErrors.push(emailValidateResponse.error);
                    }
                }

                // 2. Value rule validation
                // for (const rule of profile.valueRules) {
                //   const { mode, fieldNames, values, error } = rule;

                //   if (fieldNames.includes(field)) {
                //     if (mode == "inclusion" || mode == "exclusion") {
                //       let valueToValidate = value;
                //       if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                //         valueToValidate = value.split('@')[1]; // domain part
                //       }
                //       if (!validateValue(valueToValidate, values, mode)) {
                //         currentFieldErrors.push(error || `${mode} rule failed`);
                //       }
                //     }
                //   }
                // }
                for (const rule of leadTemplate.valueRules) {
                    const { mode, fieldNames, values, scope, error, source } = rule;

                    if (fieldNames.includes(field)) {
                        if (mode == "inclusion" || mode == "exclusion") {
                            let valueToValidate = value;
                            if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                                console.log(value, 'email')
                                valueToValidate = value.split('@')[1]; // domain part
                            }
                            if (!validateValue(valueToValidate, values, mode)) {
                                currentFieldErrors.push(error || `${mode} rule failed`);
                            }
                        }

                        if (mode == "contactsPerCompany") {
                            let valueToValidate = value;
                            if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                                valueToValidate = value.split('@')[1]; // domain part
                            }

                            if (validateContactsPerCompany(valueToValidate, values[0], companyEmailDomainCounter)) {
                                if (field === "email") {
                                    domainToIncrement = valueToValidate;
                                }
                                // ✅ increment AFTER validation passes
                                // companyEmailDomainCounter[valueToValidate] = (companyEmailDomainCounter[valueToValidate] ?? 0) + 1;
                            } else {
                                currentFieldErrors.push(error || `${mode} rule failed`);
                            }
                        }
                    }
                }

                if (externalRules.length > 0) {
                    for (const rule of externalRules) {
                        const { mode, fieldNames, values, scope, error, source } = rule;

                        if (fieldNames.includes(field)) {
                            if (mode == "inclusion" || mode == "exclusion") {
                                let valueToValidate = value;
                                if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                                    console.log(value, 'email')
                                    valueToValidate = value.split('@')[1]; // domain part
                                }

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


        console.log(errorRowsCount, 'errorRowCount')

        return { totalRows, validRowsCount, errorRowsCount, errors, validData };
    } catch (e) {
        console.error("An unexpected error occurred during validation:", e);
        return [];
    }
};

module.exports = validation;