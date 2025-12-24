const celery = require("celery-node");
const celeryConfig = require("./config");
const basicValidation = require("./validations/basicValidation");
const templateValidation = require("./validations/templateValidation");
const { bulkLeadUpload } = require("./validations/bulkLeadUpload");
const {leadCountUpdate} = require("./validations/leadCountUpdate");
const validation = require("./validations/validation");

const worker = celery.createWorker(
  celeryConfig.BROKER_URL,
  celeryConfig.CELERY_RESULT_BACKEND,
  celeryConfig.QUEUE
);

worker.register("tasks.add", (a, b) => a + b);


worker.register("tasks.basicValidation",basicValidation);
worker.register("tasks.templateValidation",templateValidation)
worker.register("tasks.bulkLeadUpload",bulkLeadUpload)
worker.register("tasks.leadCountUpdateTask",leadCountUpdate)
worker.register("tasks.validation",validation)
worker.start();
