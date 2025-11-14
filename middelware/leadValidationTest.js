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

// --- CORRECTED leadValidation Function ---
const leadValidation = (data, profile) => {
  try {
    const errors = [];

    data.forEach((lead, index) => {
      const currentLeadData = { ...lead };
      let hasValidationErrors = false;
      const fieldValidationErrors = {};

      for (let field in currentLeadData) {
        const value = currentLeadData[field];
      
        const camelField = makeCamelCase(field);

        const currentFieldErrors = [];

        // 1. Field regex validation
        if (profile.fieldRules[camelField]) {
          const { regex, error } = profile.fieldRules[camelField];
          try {
            const regexObject = new RegExp(regex);
            // Don't test null or undefined values against regex, let required rule handle it
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

          if (fieldNames.includes(field)) { // Use the original field name to match the rules
            const leadSplit = currentLeadData.split || null;
            const validScope = scope === "global" || leadSplit === scope;

            if (validScope) {
              let valueToValidate = value;

              
              if (field === 'email' && typeof value === 'string' && value.includes('@')) {
                valueToValidate = value.split('@')[1]; // Get the domain part
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
          index: index,
          ...lead, // Use the original lead data
          _errors: fieldValidationErrors
        });
      }
    });

    console.log("Lead validation completed");
    return errors;
  } catch (e) {
    console.error("An unexpected error occurred during validation:", e);
    return []; // Return empty on critical failure
  }
};


// --- CORRECTED Validation Profile (changed "jobTitle" to "title") ---
const validationProfile = {
  "fieldRules": {
    "firstName": {
      "regex": "^[A-Za-z ,.'-]{2,}$",
      "error": "First name must contain at least 2 alphabetic characters"
    },
    "lastName": {
      "regex": "^[A-Za-z ,.'-]{2,}$",
      "error": "Last name must contain at least 2 alphabetic characters"
    },
    "email": {
      "regex": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      "error": "Invalid email format"
    },
    "address": {
      "regex": "^(?!\\s*$).+",
      "error": "Address is required"
    },
    "linkedin": {
      "regex": "^https:\\/\\/(www\\.)?linkedin\\.com\\/.*$",
      "error": "LinkedIn URL must start with https://www.linkedin.com/"
    },
    "company": {
      "regex": "^[\\w\\s\\-&',.()]{2,}$",
      "error": "Company name must be at least 2 characters"
    },
    "title": {
      "regex": "^[A-Za-z0-9 ,.'-/]{2,}$",
      "error": "Job title must be at least 2 characters"
    },
    "country": {
      "regex": "^[A-Za-z ,.'-]{2,}$",
      "error": "Invalid country name"
    },
    "uploadType": {
      "regex": "^(manual|automated)$",
      "error": "Upload type must be 'manual' or 'automated'"
    }
  },
  "valueRules": [
    {
      "mode": "exclusion",
      "fieldNames": ["email"], // This will now correctly check the domain
      "values": ["gmail.com", "yahoo.com", "tempmail.com"],
      "scope": "global",
      "error": "Email domain is excluded"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["email"], // This will fail correctly for non-partner domains
      "values": ["regionalpartner.com"],
      "scope": "global",
      "error": "Email domain is not a regional partner"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["title"], // *** FIX: Changed "jobTitle" to "title"
      "values": ["CIO", "CISO", "Security Director"],
      "scope": "SASE SHW UKI",
      "error": "Job title is not valid for SASE SHW UKI"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["title"], // *** FIX: Changed "jobTitle" to "title"
      "values": ["Compliance Manager", "Network Architect"],
      "scope": "SASE PAB NORDICS",
      "error": "Job title is not valid for SASE PAB NORDICS"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["industry"],
      "values": ["Technology", "Finance"],
      "scope": "SASE SHW UKI",
      "error": "Industry is not valid for SASE SHW UKI"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["industry"],
      "values": ["Healthcare", "Energy"],
      "scope": "SASE PAB NORDICS",
      "error": "Industry is not valid for SASE PAB NORDICS"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["country"],
      "values": ["United Kingdom", "Ireland"],
      "scope": "SASE SHW UKI",
      "error": "Country is not valid for SASE SHW UKI"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["country"],
      "values": ["Sweden", "Norway", "Finland"],
      "scope": "SASE PAB NORDICS",
      "error": "Country is not valid for SASE PAB NORDICS"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["employeeSize"],
      "values": ["100-500", "500-1000"],
      "scope": "SASE SHW UKI",
      "error": "Employee size is not valid for SASE SHW UKI"
    },
    {
      "mode": "inclusion",
      "fieldNames": ["employeeSize"],
      "values": ["1000-5000", "5000+"],
      "scope": "SASE PAB NORDICS",
      "error": "Employee size is not valid for SASE PAB NORDICS"
    }
  ]
};

// --- Test Data (Unchanged) ---
const testLeads = [
  // --- Valid Leads ---
  { "firstName": "John", "lastName": "Doe", "email": "john.doe@regionalpartner.com", "company": "Tech Solutions Inc.", "title": "CIO", "country": "United Kingdom", "industry": "Technology", "employeeSize": "500-1000", "split": "SASE SHW UKI", "uploadType": "manual" },
  { "firstName": "Alice", "lastName": "Smith", "email": "alice.smith@anotherpartner.com", "company": "Energy Innovations", "title": "Network Architect", "country": "Sweden", "industry": "Energy", "employeeSize": "1000-5000", "split": "SASE PAB NORDICS", "uploadType": "automated" },
  // --- Invalid Leads ---
  { "firstName": "J", "lastName": "Doe", "email": "invalid@", "company": "ABC Corp", "title": "Engineer", "country": "Germany", "industry": "Retail", "employeeSize": "50-100", "split": "SASE SHW UKI", "uploadType": "manual" },
  { "firstName": "Bob", "lastName": "Builder", "email": "bob@gmail.com", "company": "Construction Co.", "title": "Compliance Manager", "country": "Norway", "industry": "Healthcare", "employeeSize": "5000+", "split": "SASE PAB NORDICS", "uploadType": "invalid" },
  { "firstName": "Charlie", "lastName": "Brown", "email": "charlie@tempmail.com", "company": "Design Studio", "title": "CISO", "country": "Ireland", "industry": "Finance", "employeeSize": "100-500", "split": "SASE SHW UKI", "address": "" },
  { "firstName": "Diana", "lastName": "Prince", "email": "diana.prince@example.com", "company": "Justice League", "title": "Hero", "country": "Finland", "industry": "Technology", "employeeSize": "10000+", "split": "SASE PAB NORDICS", "linkedin": "http://linkedin.com/in/diana" }
];


// --- Execution and Output ---
const validationErrors = leadValidation(testLeads, validationProfile);

if (validationErrors && validationErrors.length > 0) {
  console.log("\n--- Validation Errors Found ---");
  validationErrors.forEach(error => {
    console.log(JSON.stringify(error, null, 2));
    console.log("---");
  });
} else {
  console.log("\nNo validation errors found!");
}
