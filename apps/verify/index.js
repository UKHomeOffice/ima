'use strict';
const MaxCaseIDLength = require('./behaviours/max-case-id-length');
const ValidateCaseDetails = require('./behaviours/validate-case-details');
const SendVerificationEmail = require('./behaviours/send-verification-email');
module.exports = {
  name: 'verify',
  baseUrl: '/',
  steps: {
    '/your-details': {
      behaviours: [MaxCaseIDLength, ValidateCaseDetails],
      fields: ['uan', 'date-of-birth'],
      next: '/verify'
    },
    '/not-found': {},
    '/verify': {
      fields: ['user-email'],
      behaviours: [SendVerificationEmail],
      next: '/check-inbox'
    },
    '/check-inbox': {},
    '/team-email-invalid': {
      backLink: 'verify'
    }
  }
};
