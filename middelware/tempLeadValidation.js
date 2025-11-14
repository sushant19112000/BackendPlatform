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
