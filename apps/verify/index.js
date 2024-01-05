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
      next: '/enter-email'
    },
    '/details-not-found': {},
    '/enter-email': {
      fields: ['user-email'],
      behaviours: [SendVerificationEmail],
      next: '/check-email'
    },
    '/check-email': {
      behaviours: SendVerificationEmail
    }
  }
};
