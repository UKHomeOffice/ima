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
  confirmStep: '/final-summary',
  steps: {
    '/start': {
      behaviours: CheckEmailToken,
      next: '/continue-form'
    },
    '/continue-form': {
      behaviours: [ResumeSession],
      next: '/summary',
      backLink: false
    },
    '/summary': {
      behaviours: [Summary, ContinueReport],
      sections: require('./sections/summary-data-sections'),
      backLink: false,
      locals: { showSaveAndExit: true },
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
            value: 'helper'
          }
        }
      ],
      fields: ['who-are-you'],
      locals: { showSaveAndExit: true },
      next: '/your-location',
      backLink: 'summary'
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
        'helper-fullname',
        'helper-relationship',
        'helper-organisation'
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
          target: '/medical-records',
          condition: {
            field: 'has-address',
            value: 'yes'
          }
        },
        {
        // TODO - TARGET AND CONDITION MUST BE CHANGED BASED ON BAN-ONLY CONDITION
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
      next: '/medical-records', // TODO - URL MUST BE CHANGED BASED ON BAN-ONLY CONDITION
      backLink: 'phone-number'
    },
    '/medical-records': {
      behaviours: SaveFormSession,
      fields: ['has-permission-access', 'permission-response'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/evidence-upload', // TODO a url needs to be Changed
      backLink: 'immigration-detention'
    },
    '/evidence-upload': {
      behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      next: '/final-summary'
    },
    '/final-summary': {
      behaviours: [Summary, SaveFormSession],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      template: 'confirm',
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
    '/token-invalid': {
      clearSession: true
    },
    '/cannot-use-form': {},
    '/application-expired': {}
  }
};
