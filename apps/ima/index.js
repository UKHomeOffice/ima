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
      next: '/exceptional-circumstances-claim', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/exceptional-circumstances-claim': {
      behaviours: SaveFormSession,
      fields: ['exceptional-circumstances'],
      locals: { showSaveAndExit: true },
      forks: [
        {
          target: '/exceptional-circumstances-details',
          condition: req => req.sessionModel.get('exceptional-circumstances') === 'yes',
          continueOnEdit: true
        },
        {
          target: '/confirm', // TO BE UPDATED AS STEPS ARE ADDED
          condition: req => req.sessionModel.get('exceptional-circumstances') === 'no',
          continueOnEdit: false
        }
      ],
      next: '/exceptional-circumstances-details'
    },
    '/exceptional-circumstances-details': {
      behaviours: SaveFormSession,
      fields: ['exceptional-circumstances-details'],
      locals: { showSaveAndExit: true },
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
