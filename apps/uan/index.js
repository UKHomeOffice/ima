
const UploadCSV = require('./behaviours/upload-csv');

module.exports = {
  name: 'uan',
  baseUrl: '/uan',
  steps: {
    '/upload': {
      behaviours: [UploadCSV('bulk-upload-uan')],
      fields: ['bulk-upload-uan', 'confirm-data-checked'],
      next: '/complete'
    },
    '/complete': {
      backLink: false,
      clearSession: true
    }
  }
};
