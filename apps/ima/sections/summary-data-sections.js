/* eslint max-len: 0 */
const moment = require('moment');
const PRETTY_DATE_FORMAT = 'D MMMM YYYY';

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
      },
      {
        step: 'who-are-you',
        field: 'who-are-you'
      }
    ]
  },
  'legal-representative-details': {
    steps: [
      {
        step: '/has-legal-representative',
        field: 'has-legal-representative'
      },
      {
        step: '/legal-representative-details',
        field: 'legal-representative-name',
        parse: (list, req) => {
          if (req.sessionModel.get('legal-representative-name')) {
            return req.sessionModel.get('legal-representative-name');
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
      'legal-representative-phone-number',
      'legal-representative-house-number',
      'legal-representative-street',
      'legal-representative-townOrCity',
      'legal-representative-county',
      'legal-representative-postcode'
    ]
  },
};
