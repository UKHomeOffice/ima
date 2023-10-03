/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;
const ContinueReport = require('./behaviours/continue-report')
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
      forks: [{
        target: '/in-the-uk',
        condition: {
          field: 'who-are-you',
          value: 'asylum-seeker'
        }
      },
      {
        target: '/legal-representative-details',
        condition: {
          field: 'who-are-you',
          value: 'has-legal-representative'
        }
      },
      {
        target: '/in-the-uk',
        condition: {
          field: 'who-are-you',
          value: 'someone-else'
        }
      }],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/in-the-uk',
      backLink: 'current-progress'
    },
    // '/in-the-uk': {
    //   behaviours: SaveFormSession,
    //   fields: ['in-the-uk'],
    //   forks: [
    //     {
    //       target: '/name',
    //       condition: {
    //         field: 'in-the-uk',
    //         value: 'yes'
    //       }
    //     },
    //     {
    //       target: '/cannot-use-form',
    //       condition: {
    //         field: 'in-the-uk',
    //         value: 'no'
    //       }
    //     }
    //   ],
    //   locals: { showSaveAndExit: true },
    //   continueOnEdit: true,
    //   next: '/name',
    // },
    // '/legal-representative-details': {
    //   backLink: 'who-are-you',
    //   behaviours: SaveFormSession,
    //   fields: [
    //     'legal-representative-name',
    //     'legal-representative-address',
    //     'legal-representative-house-number',
    //     'legal-representative-street',
    //     'legal-representative-townOrCity',
    //     'legal-representative-county',
    //     'legal-representative-postcode',
    //     'legal-representative-phone-number',
    //     'is-legal-representative-email',
    //     'legal-representative-email'
    //   ],
    //   locals: { showSaveAndExit: true },
    //   next: '/in-the-uk',
    //   continueOnEdit: true
    // },
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
