'use strict';
const ValidateCaseDetails = require('./behaviours/validate-case-details');
const SendVerificationEmail = require('./behaviours/send-verification-email');

module.exports = {
  name: 'uan',
  baseUrl: '/',
  steps: {
    '/uan': {
      behaviours: [ValidateCaseDetails],
      fields: ['uan', 'date-of-birth'],
      next: '/verify'
    },
    '/not-found': {},
    '/verify': {
      fields: ['user-email'],
      behaviours: [SendVerificationEmail],
      next: '/check-inbox'
    },
    '/check-inbox': {
      behaviours: SendVerificationEmail
    }
  }
};
