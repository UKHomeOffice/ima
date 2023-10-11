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
      // next: '/check-inbox' TO BE REINSTATED ONCE RELEVANT PAGES ADDED
      next: '/ima/evidence-upload' // TO BE REMOVED ONCE RELEVANT PAGES ADDED
    },
    '/check-inbox': {},
    '/team-email-invalid': {
      backLink: 'verify'
    }
  }
};
