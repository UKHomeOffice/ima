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
      fields: ['who-are-you'],
      locals: { showSaveAndExit: true },
      next: '/removal-condition',
      backLink: 'current-progress'
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
      next: '/confirm', // TO BE UPDATED AS STEPS ARE ADDED
      backLink: '/exception'
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
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
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
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
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
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
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
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
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
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
    },
    '/electronic-travel-authorisation': {
      behaviours: SaveFormSession,
      fields: [
        'without-eta',
        'without-eta-detail'
      ],
      locals: { showSaveAndExit: true },
      continueOnEdit: true,
      next: '/confirm' // TO BE UPDATED AS STEPS ARE ADDED
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
