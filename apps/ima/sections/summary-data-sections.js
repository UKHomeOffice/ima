/* eslint max-len: 0 */
const moment = require('moment');
const fields = require('../fields');
const PRETTY_DATE_FORMAT = 'DD/MM/YYYY';

module.exports = {
  'case-details': {
    steps: [
      {
        step: '/uan',
        field: 'uan',
        omitChangeLink: true
      },
      {
        step: '/date-of-birth',
        field: 'date-of-birth',
        parse: d => d && moment(d).format(PRETTY_DATE_FORMAT),
        omitChangeLink: true
      }
    ]
  },
  'legal-representative-details':{
    steps: [
      {
        step: '/who-are-you',
        field: 'who-are-you'
      },
      {
        step: '/legal-representative-details',
        field: 'legal-representative-fullname',
        parse: (list, req) => {
          if (req.sessionModel.get('legal-representative-fullname')) {
            return req.sessionModel.get('legal-representative-fullname');
          }
          return null;
        }
      },
      {
        step: '/legal-representative-details',
        field: 'legal-representative-email',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/legal-representative-details')) {
            return null;
          }
          return req.sessionModel.get('is-legal-representative-email') === 'yes' ? `${req.sessionModel.get('user-email')}` : `${req.sessionModel.get('legal-representative-email')}`;
        }
      },
      {
        step: '/legal-representative-details',
        field: 'legal-representative-phone-number'
      },
      {
        step: '/legal-representative-details',
        field:'legal-representative-address',
        parse: (list,req)=>{
          return `${req.sessionModel.get('legal-representative-house-number')} \n ${req.sessionModel.get('legal-representative-street')} \n ${req.sessionModel.get('legal-representative-townOrCity')}\n${req.sessionModel.get('legal-representative-county')}\n${req.sessionModel.get('legal-representative-postcode')}`;
        }
      }
    ]},
  'personal-details':{
    steps: [
      {
        step: '/name',
        field: 'name'
      },
      {
        step: '/has-email',
        field: 'email-address-details'
      }
    ]
  }
};
