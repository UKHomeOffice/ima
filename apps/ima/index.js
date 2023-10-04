/* eslint max-len: 0 */
'use strict';

const hof = require('hof');
const Summary = hof.components.summary;
const ContinueReport = require('./behaviours/continue-report')
const CheckEmailToken = require('./behaviours/check-email-token');
const ResumeSession = require('./behaviours/resume-form-session');
const SaveFormSession = require('./behaviours/save-form-session');
const SaveAndExit = require('./behaviours/save-and-exit');
const moment = require('moment');

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
      forks: [
      {
        target: '/over-eight-days',
        condition: req => {
          console.log(moment())
          console.log(req.sessionModel.attributes['report-created-at'])
          if(moment().diff(req.sessionModel.attributes['report-created-at'], 'days') > 8){
            return true
          }
          return false
        }
      }
      
    ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/confirm',
      backLink: 'current-progress'
    },
    '/over-eight-days': {
      backLink: 'who-are-you',
      behaviours: SaveFormSession,
      fields: [
        'legal-representative-name',
        'legal-representative-address',
        'legal-representative-house-number',
        'legal-representative-street',
        'legal-representative-townOrCity',
        'legal-representative-county',
        'legal-representative-postcode',
        'legal-representative-phone-number',
        'is-legal-representative-email',
        'legal-representative-email'
      ],
      locals: { showSaveAndExit: true },
      next: '/in-the-uk',
      continueOnEdit: true
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
