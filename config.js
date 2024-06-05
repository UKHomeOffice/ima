'use strict';
/* eslint no-process-env: 0 */

const env = process.env.NODE_ENV || 'production';

module.exports = {
  PRETTY_DATE_FORMAT: 'Do MMMM YYYY',
  dateTimeFormat: 'D MMM YYYY HH:mm:ss',
  env: env,
  queriesEmail: process.env.QUERIES_EMAIL,
  dataDirectory: './data',
  aws: {
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    kmsKeyId: process.env.AWS_KMS_KEY_ID,
    region: process.env.AWS_REGION
  },
  csp: {
    imgSrc: ['data:']
  },
  login: {
    tokenExpiry: 1800,
    appPath: '/ima/start',
    invalidTokenPath: '/ima/token-invalid',
    allowSkip: String(process.env.ALLOW_SKIP) === 'true',
    skipEmail: process.env.SKIP_EMAIL
  },
  govukNotify: {
    notifyApiKey: process.env.NOTIFY_STUB === 'true' ? 'USE_MOCK' : process.env.NOTIFY_KEY,
    userAuthTemplateId: process.env.USER_AUTHORISATION_TEMPLATE_ID,
    caseworkerEmail: process.env.CASEWORKER_EMAIL,
    csvReportEmail: process.env.CASEWORKER_EMAIL,
    submissionTemplateId: process.env.SUBMISSION_TEMPLATE_ID,
    saveAndExitTemplateId: process.env.SAVE_AND_EXIT_TEMPLATE_ID,
    customerReceiptTemplateId: process.env.CUSTOMER_RECEIPT_TEMPLATE_ID,
    submissionFailedTemplateId: process.env.SUBMISSION_FAILED_TEMPLATE_ID,
    csvReportTemplateId: process.env.CSV_REPORT_TEMPLATE_ID
  },
  hosts: {
    acceptanceTests: process.env.ACCEPTANCE_HOST_NAME || `http://localhost:${process.env.PORT || 8080}`
  },
  redis: {
    port: process.env.REDIS_PORT || '6379',
    host: process.env.REDIS_HOST || '127.0.0.1'
  },
  upload: {
    maxFileSize: '25mb',
    hostname: process.env.FILE_VAULT_URL,
    allowedMimeTypes: [
      'application/json',
      'application/msword',
      'application/pdf',
      'application/rtf',
      'application/vnd.ms-excel',
      'application/vnd.ms-outlook',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/xml',
      'application/x-tika-ooxml',
      'audio/vnd.wave',
      'audio/wav',
      'audio/x-wav',
      'image/bmp',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'message/rfc822',
      'text/csv',
      'text/plain',
      'text/xml'
    ]
  },
  keycloak: {
    token: process.env.KEYCLOAK_TOKEN_URL,
    username: process.env.KEYCLOAK_USERNAME,
    password: process.env.KEYCLOAK_PASSWORD,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_SECRET
  },
  saveService: {
    postgresDateFormat: 'YYYY-MM-DD HH:mm:ss',
    port: process.env.DATASERVICE_SERVICE_PORT_HTTPS,
    host: process.env.DATASERVICE_SERVICE_HOST &&
      `https://${process.env.DATASERVICE_SERVICE_HOST}` || 'http://127.0.0.1'
  },
  sessionDefaults: {
    steps: ['/start', '/continue-form', '/summary', '/who-are-you'],
    fields: ['user-email', 'cepr', 'date-of-birth', 'duty-to-remove-alert', 'csrf-secret', 'errorValues', 'errors']
  },
  ceprUpload: {
    recordScanLimit: 1,
    filevaultUpload: true,
    mandatoryColumns: [
      'cepr for banned under the ima2023',
      'dob',
      'duty to remove alert'
    ],
    allowedMimeTypes: [
      'text/csv'
    ]
  }
};
