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
      next: '/evidence-upload', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/evidence-upload': {
      behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      next: '/summary'
    },
    '/summary': {
      behaviours: [Summary, SaveFormSession],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      forks: [ // Update to late submission step
        {
          target: '/declaration',
          condition: {
            field: 'who-are-you',
            value: 'person-named'
          }
        },
        {
          target: '/immigration-adviser-declaration',
          condition: {
            field: 'who-are-you',
            value: 'has-legal-representative'
          }
        },
        {
          target: '/helper-declaration',
          condition: {
            field: 'who-are-you',
            value: 'helper'
          }
        }
      ]
    },
    '/declaration': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: [
        'person-declaration'
      ],
      locals: { showSaveAndExit: true },
      next: '/form-submitted'
    },
    '/immigration-adviser-declaration': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: ['use-interpreter',
        'immigration-adviser-declaration', 'language-used'
      ],
      locals: { showSaveAndExit: true },
      next: '/form-submitted'
    },
    '/helper-declaration': {
      behaviours: [Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: ['use-interpreter',
        'helper-declaration', 'language-used'
      ],
      locals: { showSaveAndExit: true },
      next: '/form-submitted'
    },
    '/form-submitted': {
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
