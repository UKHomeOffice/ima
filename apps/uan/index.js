
const UploadCSV = require('./behaviours/upload-csv');

module.exports = {
  name: 'uan',
  baseUrl: '/uan',
  steps: {
    '/upload': {
      behaviours: [UploadCSV],
      fields: ['bulk-upload-uan', 'confirm-data-checked'],
<<<<<<< HEAD
      next: '/complete'
    },
    '/complete': {
=======
      next: '/confirmation'
    },
    '/confirmation': {
>>>>>>> master
      backLink: false,
      clearSession: true
    }
  }
};
