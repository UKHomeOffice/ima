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
const HarmClaimSummary = require('./behaviours/harm-claim-summary');
const LimitHarmClaims = require('./behaviours/limit-countries');
const ModifyChangeURL = require('./behaviours/modify-change-link');
const ResetHarmClaimSummary = require('./behaviours/reset-harm-claim-summary');
const ResetHumanRightsSummary = require('./behaviours/reset-human-rights-summary');
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
      behaviours: [Summary, ModifyChangeURL, ContinueReport],
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
          target: '/temporary-permission',
          condition: req => {
            if (req.sessionModel.get('has-address') === 'no' && req.sessionModel.get('duty-to-remove-alert').toLowerCase() === 'no') {
              return true;
            }
            return false;
          }
        },
        {
          target: '/exception',
          condition: req => {
            if (req.sessionModel.get('has-address') === 'no' && req.sessionModel.get('duty-to-remove-alert').toLowerCase() === 'yes') {
              return true;
            }
            return false;
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
      backLink: 'phone-number'
    },
    '/medical-records': {
      behaviours: SaveFormSession,
      forks: [
        {
          target: '/temporary-permission',
          condition: req => {
            if (req.sessionModel.get('duty-to-remove-alert').toLowerCase() === 'no') {
              return true;
            }
            return false;
          }
        },
        {
          target: '/exception',
          condition: req => {
            if (req.sessionModel.get('duty-to-remove-alert').toLowerCase() === 'yes') {
              return true;
            }
            return false;
          }
        }
      ],
      fields: ['has-permission-access', 'permission-response'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      backLink: 'immigration-detention'
    },
    '/exception': {
      behaviours: SaveFormSession,
      fields: [
        'does-exception-apply',
        'does-exception-apply-detail'
      ],
      template: 'does-exception-apply',
      locals: { showSaveAndExit: true },
      next: '/removal-condition'
    },
    '/removal-condition': {
      behaviours: SaveFormSession,
      fields: ['how-removal-condition-1-applies'],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/entry-clearance',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-visa') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/travel-ban',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('travel-ban') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/deportation-order',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('deportation-order-applies') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/deception',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('by-deception') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/without-permission',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('entered-without-permission') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date',
      backLink: 'exception'
    },
    '/without-permission': {
      behaviours: SaveFormSession,
      fields: [
        'entered-without-permission',
        'entered-without-permission-detail'
      ],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/entry-clearance',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-visa') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/travel-ban',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('travel-ban') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/deportation-order',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('deportation-order-applies') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/deception',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('by-deception') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/deception': {
      behaviours: SaveFormSession,
      fields: [
        'entered-by-deception',
        'entered-by-deception-detail'
      ],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/entry-clearance',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-visa') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/travel-ban',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('travel-ban') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/deportation-order',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('deportation-order-applies') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/deportation-order': {
      behaviours: SaveFormSession,
      fields: [
        'deportation-order-applied',
        'deportation-order-applied-detail'
      ],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/entry-clearance',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-visa') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/travel-ban',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('travel-ban') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/travel-ban': {
      behaviours: SaveFormSession,
      fields: [
        'entered-with-travel-ban',
        'entered-with-travel-ban-detail'
      ],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        },
        {
          target: '/entry-clearance',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-visa') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/entry-clearance': {
      behaviours: SaveFormSession,
      fields: [
        'arrived-without-clearance',
        'arrived-without-clearance-detail'
      ],
      forks: [
        {
          target: '/electronic-travel-authorisation',
          condition: req => {
            if (req.sessionModel.get('how-removal-condition-1-applies') && req.sessionModel.get('how-removal-condition-1-applies').indexOf('arrived-without-eta') >= 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/electronic-travel-authorisation': {
      behaviours: SaveFormSession,
      fields: [
        'without-eta',
        'without-eta-detail'
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/arrival-date'
    },
    '/arrival-date': {
      behaviours: SaveFormSession,
      fields: ['arrival-after-date', 'arrived-date', 'arrival-details'],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/threatened-life-or-liberty'
    },
    '/threatened-life-or-liberty': {
      behaviours: SaveFormSession,
      fields: [
        'is-life-threatened',
        'life-threatened-detail'
      ],
      template: 'life-or-liberty-threatened',
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/permission'
    },
    '/permission': {
      behaviours: SaveFormSession,
      fields: [
        'permission-to-enter-or-stay',
        'permission-to-enter-or-stay-detail'
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: false,
      next: '/harm-claim'
    },
    '/harm-claim': {
      behaviours: [ResetHarmClaimSummary, SaveFormSession],
      fields: ['is-serious-and-irreversible'],
      forks: [
        {
          target: '/harm-claim-summary',
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
        },
        {
          target: '/harm-claim-countries',
          condition: req => {
            if (req.form.values['is-serious-and-irreversible'] === 'yes' && req.sessionModel.get('sih-countries') && req.sessionModel.get('sih-countries').aggregatedValues.length === 0) {
              return true;
            }
            return false;
          }
        }
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true
    },
    '/harm-claim-countries': {
      behaviours: [LimitHarmClaims, SaveFormSession],
      fields: ['country-1', 'countryAddNumber'],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/risk-of-harm'
    },
    '/risk-of-harm': {
      behaviours: [LimitHarmClaims, SaveFormSession],
      fields: ['is-risk-in-country'],
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
      behaviours: [LimitHarmClaims, SaveFormSession],
      fields: ['reason-in-sih', 'why-not-get-protection'],
      next: '/harm-claim-summary',
      continueOnEdit: true,
      locals: { showSaveAndExit: true }
    },
    '/harm-claim-summary': {
      behaviours: [AggregateSaveUpdate, HarmClaimSummary, LimitHarmClaims, SaveFormSession],
      aggregateTo: 'sih-countries',
      aggregateFrom: [
        'country-1',
        'is-risk-in-country',
        'reason-in-sih',
        'why-not-get-protection'
      ],
      titleField: 'country-1',
      addStep: 'harm-claim-countries',
      addAnotherLinkText: 'country',
      locals: { showSaveAndExit: true },
      continueOnEdit: false,
      template: 'harm-claim-summary',
      next: '/human-rights-claim',
      backLink: 'harm-claim'
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
      next: '/human-rights-family-summary',
      continueOnEdit: true
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
      next: '/exceptional-circumstances-claim'
    },
    '/exceptional-circumstances-claim': {
      behaviours: SaveFormSession,
      fields: ['exceptional-circumstances'],
      locals: { showSaveAndExit: true },
      forks: [
        {
          target: '/exceptional-circumstances-details',
          condition: {
            field: 'exceptional-circumstances',
            value: 'yes'
          }
        }
      ],
      continueOnEdit: true,
      next: '/temporary-permission-to-stay'
    },
    '/exceptional-circumstances-details': {
      behaviours: SaveFormSession,
      fields: ['exceptional-circumstances-details'],
      locals: { showSaveAndExit: true },
      next: '/temporary-permission-to-stay'
    },
    '/temporary-permission': {
      behaviours: SaveFormSession,
      fields: ['temporary-permission-reasons-ban-only', 'temporary-permission-details-ban-only'],
      locals: { showSaveAndExit: true },
      next: '/evidence-upload'
    },
    '/temporary-permission-to-stay': {
      behaviours: SaveFormSession,
      fields: ['temporary-permission', 'temporary-permission-details', 'temporary-permission-reasons'],
      locals: { showSaveAndExit: true },
      next: '/evidence-upload'
    },
    '/evidence-upload': {
      behaviours: [SaveFormSession, SaveImage('image'), RemoveImage, LimitDocument],
      fields: ['image'],
      continueOnEdit: true,
      locals: { showSaveAndExit: true },
      next: '/final-summary'
    },
    '/final-summary': {
      behaviours: [Summary, ModifyChangeURL, SaveFormSession],
      sections: require('./sections/summary-data-sections'),
      locals: { showSaveAndExit: true },
      template: 'confirm',
      next: '/submitting-late'
    },
    '/submitting-late': {
      behaviours: [SaveFormSession],
      locals: { showSaveAndExit: true },
      fields: [
        'are-you-submitting-this-form-late',
        'are-you-submitting-this-form-late-extension',
        'late-extension-options-yes-detail'
      ],
      continueOnEdit: true,
      forks: [
        {
          target: '/declaration',
          condition: req => {
            if (req.sessionModel.get('are-you-submitting-this-form-late') === 'no' &&  req.sessionModel.get('who-are-you') === 'person-named') {
              return true;
            }
            return false;
          }
        },
        {
          target: '/immigration-adviser-declaration',
          condition: req => {
            if (req.sessionModel.get('are-you-submitting-this-form-late') === 'no' &&  req.sessionModel.get('who-are-you') === 'has-legal-representative') {
              return true;
            }
            return false;
          }
        },
        {
          target: '/helper-declaration',
          condition: req => {
            if (req.sessionModel.get('are-you-submitting-this-form-late') === 'no' &&  req.sessionModel.get('who-are-you') === 'helper') {
              return true;
            }
            return false;
          }
        },
        {
          target: '/submitting-late-details',
          condition: {
            field: 'are-you-submitting-this-form-late',
            value: 'yes'
          }
        }
      ]
    },
    '/submitting-late-details': {
      behaviours: [SaveFormSession, SaveImage('image'), RemoveImage, LimitDocument],
      locals: { showSaveAndExit: true },
      fields: ['image', 'late-submission'],
      continueOnEdit: true,
      forks: [
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
      behaviours: [SaveFormSession, Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: [
        'person-declaration'
      ],
      locals: { showSaveAndExit: true },
      next: '/form-submitted'
    },
    '/immigration-adviser-declaration': {
      behaviours: [SaveFormSession, Summary, Submit],
      sections: require('./sections/summary-data-sections'),
      fields: ['use-interpreter',
        'immigration-adviser-declaration', 'language-used'
      ],
      locals: { showSaveAndExit: true },
      next: '/form-submitted'
    },
    '/helper-declaration': {
      behaviours: [SaveFormSession, Summary, Submit],
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
