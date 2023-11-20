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
      next: '/harm-claim', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/harm-claim':{
      behaviours: SaveFormSession,
      fields: ['is-serious-and-irreversible'],
      forks: [
        {
          target: '/harm-claim-countries',
          condition: {
            field: 'is-serious-and-irreversible',
            value: 'yes'
          }
        },
        {
          target: '/human-rights-claim',
          condition: {
            field: 'is-serious-and-irreversible',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/harm-claim-countries',
      backLink: 'harm-claim'
    },
    '/harm-claim-countries': {
      behaviours: [SaveFormSession],
      fields: ['country-1'],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/risk-of-harm',
      backLink: 'harm-claim'
    },
    '/risk-of-harm':{
      behaviours: SaveFormSession,
      fields: ['is-risk-in-country'],
      forks: [
        {
          target: '/harm-claim-details',
          condition: {
            field: 'is-risk-in-country',
            value: 'yes'
          }
        },
        {
          target: '/harm-claim-summary',
          condition: {
            field: 'is-risk-in-country',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/harm-claim-details'
    },
    '/harm-claim-details':{
      behaviours: SaveFormSession,
      fields: ['reason-in-sih', 'why-not-get-protection'],
      next: '/harm-claim-summary',
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      backLink: 'risk-of-harm'
    },
    '/harm-claim-summary': {
      behaviours: [SaveFormSession],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/human-rights-claim',
    },
    '/human-rights-claim': {
      behaviours: SaveFormSession,
      fields: ['human-claim'],
      locals: { showSaveAndExit: true },
      backLink: 'harm-claim-summary',
      next: '/confirm' // TODO a url needs to be Changed
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
    '/application-expired': {},
  }
};
