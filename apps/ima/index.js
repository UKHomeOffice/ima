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
const FamilyMembersLocals = require('./behaviours/family-members-locals');
const ModifyChangeURL = require('./behaviours/modify-change-link');
const ResetHumanRightsSummary = require('./behaviours/reset-human-rights-summary');

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
      next: '/human-rights-claim', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: 'current-progress'
    },
    '/human-rights-claim': {
      behaviours: [ResetHumanRightsSummary, SaveFormSession],
      fields: ['human-rights-claim'],
      locals: { showSaveAndExit: true },
      forks: [
        {
          target: '/human-rights-family',
          condition: {
            field: 'human-rights-claim',
            value: 'yes'
          }
        }
      ],
      continueOnEdit: true,
      next: '/other-human-rights-claims'
    },
    '/human-rights-family': {
      behaviours: SaveFormSession,
      fields: ['family-member-relation',
        'family-member-full-name',
        'family-member-dob',
        'family-member-nationality',
        'uk-immigration-status',
        'immigration-status-other',
        'reference-number-option',
        'uan-detail',
        'ho-number-detail',
        'human-rights-claim-details'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/human-rights-family-summary'
    },
    '/human-rights-family-summary': {
      behaviours: [AggregateSaveUpdate, FamilyMembersLocals, SaveFormSession],
      aggregateTo: 'family-members',
      aggregateFrom: [
        'family-member-full-name',
        'family-member-relation',
        'family-member-dob',
        'family-member-nationality',
        'uk-immigration-status',
        'immigration-status-other',
        'reference-number-option',
        'uan-detail',
        'ho-number-detail',
        'human-rights-claim-details'
      ],
      titleField: 'family-member-full-name',
      addStep: 'human-rights-family',
      addAnotherLinkText: 'family member',
      template: 'family-members-summary',
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/other-human-rights-claims'
    },
    '/other-human-rights-claims': {
      behaviours: [SaveFormSession],
      fields: ['other-human-rights-claim', 'other-human-rights-claim-details'],
      locals: { showSaveAndExit: true },
      continueOnEdit: false,
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
    },
    '/confirm': {
      behaviours: [Summary, ModifyChangeURL, SaveFormSession],
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
