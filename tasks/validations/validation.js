const XLSX = require("xlsx");
const axios = require("axios")
const Papa = require("papaparse");


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
const validation = async (data, profileT, campaignId, uploadId, pacingId, volumeId) => {
    try {

        const profile = profileT;
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
                for (const rule of profile.templateValueRules) {
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

                if (profile.externalValueRules.length > 0) {
                    for (const rule of profile.externalValueRules) {
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

module.exports = validation;