
const UploadCSV = require('./behaviours/upload-csv');

module.exports = {
  name: 'uan',
  baseUrl: '/uan',
  steps: {
    '/upload': {
      behaviours: [UploadCSV],
      fields: ['bulk-upload-uan', 'confirm-data-checked'],
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false,
      clearSession: true
    }
  }
};
