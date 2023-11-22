/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;
const ContinueReport = require('./behaviours/continue-report');
const CheckEmailToken = require('./behaviours/check-email-token');
const ResumeSession = require('./behaviours/resume-form-session');
const SaveFormSession = require('./behaviours/save-form-session');
const SaveAndExit = require('./behaviours/save-and-exit');
const SaveImage = require('./behaviours/save-image');
const RemoveImage = require('./behaviours/remove-image');
const LimitDocument = require('./behaviours/limit-documents');
const Submit = require('./behaviours/submit');


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
      backLink: 'current-progress',
      next: '/evidence-upload'
    },
    '/evidence-upload': {
      behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      next: '/are-you-submitting-this-form-late'
    },
    '/are-you-submitting-this-form-late': {
      behaviours: [SaveFormSession],
      locals: { showSaveAndExit: true },
      fields: [
        'are-you-submitting-this-form-late',
        'are-you-submitting-this-form-late-extension',
        'are-you-submitting-this-form-late-extension-options-yes-detail'
      ],
      continueOnEdit: true,
      next: '/why-are-you-submitting-late'
    },
    '/why-are-you-submitting-late': {
      behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      next: '/confirm'
    },
    '/confirm': {
      behaviours: [Summary, SaveFormSession],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      forks: [ // Update to late submission step
        {
          target: '/declaration-person-named',
          condition: {
            field: 'who-are-you',
            value: 'person-named'
          }
        },
        {
          target: '/declaration-immigration-adviser',
          condition: {
            field: 'who-are-you',
            value: 'has-legal-representative'
          }
        },
        {
          target: '/declaration-someone-else',
          condition: {
            field: 'who-are-you',
            value: 'someone-else'
          }
        }
      ]
    },
    '/declaration-person-named': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: [
        'declaration-person-named'
      ],
      locals: { showSaveAndExit: true },
      next: '/confirmation'
    },
    '/declaration-immigration-adviser': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: [
        'declaration-immigration-adviser'
      ],
      locals: { showSaveAndExit: true },
      next: '/confirmation'
    },
    '/declaration-someone-else': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: [
        'declaration-someone-else'
      ],
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
