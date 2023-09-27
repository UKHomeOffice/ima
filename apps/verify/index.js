'use strict';

module.exports = {
  name: 'verify',
  baseUrl: '/',
  pages: {
    '/email-not-recognised': 'email-not-recognised'
  },
  steps: {
    '/your-details': {
      next: '/verify'
    },
    '/not-found': {},
    '/verify': {
      fields: ['user-email'],
      next: '/check-inbox'
    },
    '/check-inbox': {},
    '/team-email-invalid': {
      backLink: 'verify'
    }
  }
};
