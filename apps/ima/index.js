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
      next: '/confirm', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/evidence-upload': {
      behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      next: '/who-are-you'
      //  next: '/declaration-immigration-adviser'
    },
    // '/evidence-upload1': {
    //   behaviours: [SaveImage('image'), RemoveImage, LimitDocument],
    //   fields: ['image'],
    //   continueOnEdit: true,
    //   next: '/confirm'
    // },
    // '/exception': {
    //   // behaviours: SaveFormSession,
    //   fields: [
    //     'does-exception-apply'
    //   ],
    //   template: 'does-exception-apply',
    //   locals: { showSaveAndExit: true },
    //   //next: '/exploitation'
    //   next: '/confirmation'
    // },
    // '/exploitation': {
    //   //  behaviours: [Summary, Submit],
    //   // behaviours: SaveFormSession,
    //   fields: [
    //     'have-you-been-exploited'
    //   ],
    //   // template: 'have-you-been-exploited',
    //   locals: { showSaveAndExit: true },
    //   next: '/confirmation'
    //   //next: '/declaration'

    // },
    '/who-are-you': {
      fields: [
        'who-are-you'
      ],
      // template: 'declaration-person-named',
      locals: { showSaveAndExit: true },
      next: '/declaration-person-named'
    },
    '/declaration-person-named': {
      fields: [
        'declaration-person-named'
      ],
      // template: 'declaration-person-named',
      locals: { showSaveAndExit: true },
      next: '/declaration-immigration-adviser'
    },
    '/declaration-person-named': {
      fields: [
        'declaration-person-named'
      ],
      // template: 'declaration-person-named',
      locals: { showSaveAndExit: true },
      next: '/declaration-immigration-adviser'
    },
    '/declaration-immigration-adviser': {
      fields: [
        'declaration-immigration-adviser'
      ],
      // template: 'declaration-immigration-adviser',
      locals: { showSaveAndExit: true },
      next: '/confirm'
    },
    '/confirm': {
      behaviours: [Summary, SaveFormSession, Submit],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      //next: '/confirmation'
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
