
const UploadCSV = require('./behaviours/upload-csv');
const SubmitRecords = require('./behaviours/submit-records');

module.exports = {
  name: 'upload',
  baseUrl: '/upload',
  steps: {
    '/bulk-upload': {
      behaviours: [UploadCSV('bulk-upload-claimants'), SubmitRecords],
      fields: ['bulk-upload-claimants', 'confirm-data-checked', 'shared-mailbox'],
      next: '/complete'
    },
    '/complete': {
      backLink: false,
      clearSession: true
    }
  }
};
