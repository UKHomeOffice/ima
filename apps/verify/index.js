'use strict';
const ValidateCaseDetails = require('./behaviours/validate-case-details');
const SendVerificationEmail = require('./behaviours/send-verification-email');

module.exports = {
  name: 'verify',
  baseUrl: '/',
  steps: {
    '/your-details': {
      behaviours: [ValidateCaseDetails],
      fields: ['uan', 'date-of-birth'],
      next: '/verify'
    },
    '/not-found': {},
    '/verify': {
      fields: ['user-email'],
      // next: '/check-inbox' TO BE REINSTATED ONCE RELEVANT PAGES ADDED
      next: '/ima/evidence-upload' // TO BE REMOVED ONCE RELEVANT PAGES ADDED
    },
    '/check-inbox': {
      behaviours: SendVerificationEmail
    }
  }
};
