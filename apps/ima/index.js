/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;
const ContinueReport = require('./behaviours/continue-report');
const CheckEmailToken = require('./behaviours/check-email-token');
const ResumeSession = require('./behaviours/resume-form-session');
const SaveFormSession = require('./behaviours/save-form-session');
const SaveAndExit = require('./behaviours/save-and-exit');

module.exports = {
  name: 'ima',
  params: '/:action?/:id?/:edit?',
  baseUrl: '/ima',
  steps: {
    '/start': {
      behaviours: CheckEmailToken,
      next: '/cases'
    },
    '/cases': {
      behaviours: [ResumeSession],
      next: '/current-progress',
      backLink: false
    },
    '/current-progress': {
      behaviours: [Summary, ContinueReport],
      sections: require('./sections/summary-data-sections'),
      backLink: false,
      journeyStart: '/who-are-you'
    },
    '/who-are-you': {
      behaviours: SaveFormSession,
      fields: ['who-are-you'],
      locals: { showSaveAndExit: true },
      next: '/exception', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/exception': {
      behaviours: SaveFormSession,
      fields: [
        'does-exception-apply',
        'does-exception-apply-detail'
      ],
      template: 'does-exception-apply',
      locals: { showSaveAndExit: true },
      next: '/threatened-life-or-liberty' // TO BE UPDATED AS STEPS ARE ADDED
    },
    '/threatened-life-or-liberty': {
      behaviours: SaveFormSession,
      fields: [
        'is-life-threatened',
        'life-threatened-detail'
      ],
      template: 'life-or-liberty-threatened',
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/permission'
    },
    '/permission': {
      behaviours: SaveFormSession,
      fields: [
        'permission-to-enter-or-stay',
        'permission-to-enter-or-stay-detail'
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: false,
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
    },
    '/confirm': {
      behaviours: [Summary, SaveFormSession],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      next: '/confirmation'
    },
    '/confirmation': {
      clearSession: true
    },
    '/save-and-exit': {
      behaviours: SaveAndExit,
      backLink: false
    },
    '/cannot-use-form': {},
    '/token-invalid': {
      clearSession: true
    },
    '/application-expired': {}
  }
};
