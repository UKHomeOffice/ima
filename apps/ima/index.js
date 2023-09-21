/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;

module.exports = {
  name: 'ima',
  params: '/:action?/:id?/:edit?',
  baseUrl: '/ima',
  steps: {
    '/start': {
      next: '/cases'
    },
    '/cases': {
      next: '/current-progress',
      backLink: false
    },
    '/current-progress': {
      behaviours: [Summary],
      sections: require('./sections/summary-data-sections'),
      backLink: false,
      journeyStart: '/who-are-you'
    },
    '/save-and-exit': {
      backLink: false
    },
    '/confirm': {
      behaviours: [Summary],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      next: '/confirmation'
    },
    '/confirmation': {
      clearSession: true
    },
    '/cannot-use-form': {},
    '/token-invalid': {
      clearSession: true
    },
    '/application-expired': {}
  }
};
