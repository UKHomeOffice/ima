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
      forks: [
        {
          target: '/your-location',
          condition: {
            field: 'who-are-you',
            value: 'person-named'
          }
        },
        {
          target: '/immigration-adviser-details',
          condition: {
            field: 'who-are-you',
            value: 'has-legal-representative'
          }
        },
        {
          target: '/helper-details',
          condition: {
            field: 'who-are-you',
            value: 'someone-else'
          }
        }
      ],
      fields: ['who-are-you'],
      locals: { showSaveAndExit: true },
      next: '/your-location',
      backLink: 'current-progress'
    },
    '/immigration-adviser-details': {
      behaviours: SaveFormSession,
      fields: [
        'legal-representative-fullname',
        'legal-representative-organisation',
        'legal-representative-house-number',
        'legal-representative-street',
        'legal-representative-townOrCity',
        'legal-representative-county',
        'legal-representative-postcode',
        'legal-representative-phone-number',
        'is-legal-representative-email',
        'legal-representative-email'
      ],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/your-location'
    },
    '/helper-details': {
      behaviours: SaveFormSession,
      fields: [
        'someone-else-fullname',
        'someone-else-relationship',
        'someone-else-organisation'
      ],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/your-location'
    },
    '/your-location': {
      behaviours: SaveFormSession,
      forks: [
        {
          target: '/full-name',
          condition: {
            field: 'in-the-uk',
            value: 'yes'
          }
        },
        {
          target: '/cannot-use-form',
          condition: {
            field: 'in-the-uk',
            value: 'no'
          }
        }
      ],
      fields: ['in-the-uk'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/full-name'
    },
    '/full-name': {
      behaviours: SaveFormSession,
      fields: ['name'],
      locals: { showSaveAndExit: true },
      next: '/your-email'
    },
    '/your-email': {
      behaviours: SaveFormSession,
      fields: ['current-email'],
      forks: [
        {
          target: '/phone-number',
          condition: {
            field: 'current-email',
            value: 'yes'
          }
        },
        {
          target: '/email',
          condition: {
            field: 'current-email',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/phone-number',
      backLink: 'full-name'
    },
    '/email': {
      behaviours: SaveFormSession,
      fields: ['email-address', 'email-address-details'],
      locals: { showSaveAndExit: true },
      next: '/phone-number'
    },
    '/phone-number': {
      behaviours: SaveFormSession,
      fields: ['phone-number', 'phone-number-details'],
      locals: { showSaveAndExit: true },
      next: '/immigration-detention'
    },
    '/immigration-detention': {
      behaviours: SaveFormSession,
      forks: [
        {
          target: '/medical-records', // TODO target url will be added by next TASK
          condition: {
            field: 'has-address',
            value: 'yes'
          }
        },
        {
          target: '/',
          condition: {
            fields: 'has-address',
            value: 'no'
          }
        }
      ],
      fields: [
        'has-address',
        'house-number',
        'street',
        'townOrCity',
        'county',
        'postcode'
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/medical-records',
      backLink: 'phone-number'
    },
    '/medical-records': {
      behaviours: SaveFormSession,
      fields: ['has-permission-access', 'permission-response'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/confirm', // TODO a url needs to be Changed
      backLink: 'immigration-detention'
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
    '/token-invalid': {
      clearSession: true
    },
    '/cannot-use-form': {},
    '/application-expired': {}
  }
};
