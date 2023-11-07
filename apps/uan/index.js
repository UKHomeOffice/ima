
const UploadCSV = require('./behaviours/upload-csv');
const SubmitRecords = require('./behaviours/submit-records');

module.exports = {
  name: 'uan',
  baseUrl: '/uan',
  steps: {
    '/dashboard': {
      behaviours: [],
      fields: [],
      next: '/bulk-upload'
    },
    '/bulk-upload': {
      behaviours: [UploadCSV('bulk-upload-uan'), SubmitRecords],
      fields: ['bulk-upload-uan', 'confirm-data-checked'],
      next: '/complete'
    },
    '/complete': {
      backLink: false,
      clearSession: true
    }
  }
};
