
const UploadCSV = require('./behaviours/upload-csv');

module.exports = {
  name: 'cepr',
  baseUrl: '/cepr',
  steps: {
    '/upload': {
      behaviours: [UploadCSV],
      fields: ['bulk-upload-cepr', 'confirm-data-checked'],
      next: '/confirmation'
    },
    '/confirmation': {
      backLink: false,
      clearSession: true
    }
  }
};
