/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;
const ContinueReport = require('./behaviours/continue-report');
const CheckEmailToken = require('./behaviours/check-email-token');
const ResumeSession = require('./behaviours/resume-form-session');
const SaveFormSession = require('./behaviours/save-form-session');
const SaveAndExit = require('./behaviours/save-and-exit');
const AggregateSaveUpdate = require('./behaviours/aggregator-save-update');
const HarmCountryRepeater = require('./behaviours/harm-country-repeater');
const HarmClaimCountries = require('./behaviours/harm-countries-name');
const HarmCountryFormLoop = require('./behaviours/harm-country-form-loop');
const HarmClaimSummary = require('./behaviours/harm-claim-summary');
const FormUpdate = require('./behaviours/form-update');


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
    '/harm-claim': {
      behaviours: [SaveFormSession],
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
      behaviours: [SaveFormSession, HarmCountryRepeater],
      fields: ['country-1', 'country-2', 'country-3', 'country-4', 'country-5'],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/risk-of-harm',
      backLink: 'harm-claim'
    },
    '/risk-of-harm': {
      behaviours: [SaveFormSession, FormUpdate, HarmClaimCountries],
      fields: ['is-risk-in-country', 'countryAddNumber'],
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
    '/harm-claim-details': {
      behaviours: [SaveFormSession, FormUpdate, HarmClaimCountries],
      fields: ['reason-in-sih', 'why-not-get-protection'],
      next: '/harm-claim-summary',
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      backLink: 'risk-of-harm'
    },
    '/harm-claim-summary': {
      behaviours: [AggregateSaveUpdate, HarmCountryFormLoop, HarmClaimSummary,  SaveFormSession],
      aggregateTo: 'sih-countries',
      aggregateFrom: [
        'countryAddNumber',
        'is-risk-in-country',
        'reason-in-sih',
        'why-not-get-protection'
      ],
      titleField: 'countryAddNumber',
      addStep: 'harm-claim-countries',
      addAnotherLinkText: 'country',
      template: 'add-another',
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/human-rights-claim',
      backLink: 'harm-claim-countries'
    },
    '/human-rights-claim': {
      behaviours: SaveFormSession,
      fields: ['human-claim'],
      locals: { showSaveAndExit: true },
      // backLink: 'harm-claim-summary',
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
    '/application-expired': {}
  }
};
