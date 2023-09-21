'use strict';
/* eslint no-process-env: 0 */

const env = process.env.NODE_ENV || 'production';

module.exports = {
  PRETTY_DATE_FORMAT: 'Do MMMM YYYY',
  dateTimeFormat: 'DD MMM YYYY HH:mm:ss',
  env: env,
  dataDirectory: './data',
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
    notifyApiKey: process.env.NOTIFY_KEY
  },
  govukNotify: {
    notifyApiKey: process.env.NOTIFY_KEY,
    submissionTemplateId: process.env.CASEWORKER_SUBMISSION_TEMPLATE_ID,
    caseworkerEmail: process.env.CASEWORKER_EMAIL,
    csvReportEmail: process.env.CSV_REPORT_EMAIL,
    customerReceiptTemplateId: process.env.APPLICANT_RECEIPT_TEMPLATE_ID,
    userAuthTemplateId: process.env.USER_AUTHORISATION_TEMPLATE_ID,
    csvReportTemplateId: process.env.CSV_REPORT_TEMPLATE_ID,
    submissionFailedTemplateId: process.env.SUBMISSION_FAILED_TEMPLATE_ID
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
    hostname: process.env.FILE_VAULT_URL
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
      `https://${process.env.DATASERVICE_SERVICE_HOST}`
  }
};
