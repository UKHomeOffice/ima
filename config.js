'use strict';
/* eslint no-process-env: 0 */

const env = process.env.NODE_ENV || 'production';

module.exports = {
  PRETTY_DATE_FORMAT: 'Do MMMM YYYY',
  dateTimeFormat: 'DD MMM YYYY HH:mm:ss',
  env: env,
  dataDirectory: './data',
  aws: {
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    kmsKeyId: process.env.AWS_KMS_KEY_ID,
    region: process.env.AWS_REGION
  },
  casesIds: {
    uanValidLength: 19,
    cronEnabled: process.env.CRON_ENABLED,
    S3Id: process.env.CASES_S3_ID || 'uans-data-2023-11-16',
    testCases: [{
      uan: '0000-0000-0000-0000', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0001', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0002', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0003', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0004', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0005', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0006', 'date-of-birth': '2000-01-01'
    }, {
      uan: '0000-0000-0000-0007', 'date-of-birth': '2000-01-01'
    }]
  },
  csp: {
    imgSrc: ['data:']
  },
  aws: {
    bucket: process.env.AWS_BUCKET,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    kmsKeyId: process.env.AWS_KMS_KEY_ID,
    region: process.env.AWS_REGION
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
    userAuthTemplateId: process.env.USER_AUTHORISATION_TEMPLATE_ID
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
    steps: ['/start', '/cases', '/current-progress', '/who-are-you'],
    fields: ['user-email', 'uan', 'date-of-birth', 'csrf-secret', 'errorValues', 'errors']
  }
};
