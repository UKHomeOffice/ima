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
      next: '/serious-and-irreversible-harm'
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
      next: '/confirm', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
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
    '/serious-and-irreversible-harm':{
      behaviours: SaveFormSession,
      fields: ['is-serious-and-irreversible'],
      forks: [
        {
          target: '/country-claim-against',
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
      next: '/country-claim-against',
      backLink: 'current-progress'
    },
    '/country-claim-against':{
      backLink: 'serious-and-irreversible-harm',
      behaviours: [SaveFormSession],
      next: '/risk-in-sih-country'
    },
    '/add-countries':{
      behaviours: [SaveFormSession],
      template: 'country-repeater',
      locals: { showSaveAndExit: true },
      fields: [
        'country-1',
        'country-2',
        'country-3'
      ],
      next: '/applied-for-any-other-permission'
    },
    '/risk-in-sih-country':{
      behaviours: SaveFormSession,
      fields: ['is-risk-in-country'],
      forks: [
        {
          target: '/has-sih-details',
          condition: {
            field: 'is-risk-in-country',
            value: 'yes'
          }
        },
        {
          target: '/sih-summary',
          condition: {
            field: 'is-risk-in-country',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/has-sih-details',
      backLink: 'country-claim-against'

    },
    '/has-sih-details':{
      behaviours: SaveFormSession,
      fields: ['reason-in-sih','has-anything-happened','anything-happened-details','why-not-get-protection'],
      next: '/sih-summary',
      backLink: 'risk-in-sih-country'
    },
    '/sih-summary':{
      behaviours: [Summary, ContinueReport],
      sections: require('./sections/sih-summary'),
      backLink: false,
      journeyStart: '/who-are-you'
    },
    '/human-rights-claim':{
      
    }
  }
};
