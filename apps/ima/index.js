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
      forks:[
        {
          target:'/in-the-uk',
          condition:{
            field:'who-are-you',
            value: 'person-named'
          }
        },
        {
          target:'/legal-representative-details',
          condition:{
            field:'who-are-you',
            value: 'has-legal-representative'
          }
        },
        {
          target:'/someone-else',
          condition:{
            field:'who-are-you',
            value: 'someone-else'
          }
        }
      ],
      fields: ['who-are-you'],
      locals: { showSaveAndExit: true },
      next: '/confirm', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/in-the-uk':{
      behaviours: SaveFormSession,
      forks: [
        {
          target: '/name',
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
      next: '/name',
      backLink: 'who-are-you'
    },
    
    '/name':{
      behaviours: SaveFormSession,
      fields: ['name'],
      locals: { showSaveAndExit: true },
      next: '/is-your-email'
    },
    '/is-your-email':{
      behaviours: SaveFormSession,
      fields: ['is-your-email'],
      forks: [
        {
          target: '/phone-number',
          condition: {
            field: 'is-your-email',
            value: 'yes'
          }
        },
        {
          target: '/has-email',
          condition: {
            field: 'is-your-email',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/phone-number',
      backLink: 'name'
    },
    '/phone-number': {
      behaviours: SaveFormSession,
      fields: ['phone-number', 'phone-number-details'],
      locals: { showSaveAndExit: true },
      next: '/immigration-detention'
    },
    '/has-email':{
      behaviours: SaveFormSession,
      fields: ['email-address', 'email-address-details'],
      locals: { showSaveAndExit: true },
      next:'/phone-number'
    },
    '/immigration-detention':{
      behaviours: SaveFormSession,
      fields: [
        'has-address',
        'house-number',
        'street',
        'townOrCity',
        'county',
        'postcode'
      ],
      locals: { showSaveAndExit: true },
      next: '/life-or-liberty-threatened'
    },
    '/exception':{
      behaviours: SaveFormSession,
      fields: [
        'does-exception-apply'
      ],
      template: 'does-exception-apply',
      locals: { showSaveAndExit: true },
    },
    '/life-or-liberty-threatened': {
      behaviours: SaveFormSession,
      fields: [
        'is-life-threatened'
      ],
      locals: { showSaveAndExit: true },
    },
    '/cannot-use-form':{},
   
    '/someone-else':{
      behaviours: SaveFormSession,
      fields:[
        'someone-else',
        'someone-else-fullname',
        'someone-else-relationship',
        'someone-else-organisation'
      ],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next:'/in-the-uk'
    },
    '/legal-representative-details':{
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
        'legal-representative-email',
        'representative-email-detail'
              ],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next:'/in-the-uk'
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
    '/application-expired': {},
    '/medical-record':{
      behaviours: SaveFormSession,
      fields: ['has-permission-access'],
      locals: { showSaveAndExit: true },
      forks: [
        {
          target: '/',
          condition: {
            field: 'has-permission-access',
            value: 'yes'
          }
        },
        {
          target: '/',
          condition: {
            field: 'has-permission-access',
            value: 'no'
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/',
      backLink: 'immigration-detention'
    }
  }
};
