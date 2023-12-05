/* eslint max-len: 0 */
const moment = require('moment');
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
  'human-rights': {
    steps: [
      {
        step: '/human-rights-claim',
        field: 'human-rights-claim',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/human-rights-claim')) {
            return null;
          }
          return list;
        }
      },
      {
        step: '/human-rights-family-summary',
        field: 'family-members',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/human-rights-family-summary') || req.sessionModel.get('human-rights-claim') === 'no') {
            return null;
          }
          return 'Details added';
        }
      },
      {
        step: '/other-human-rights-claims',
        field: 'other-human-rights-claim',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/other-human-rights-claims')) {
            return null;
          }
          return req.sessionModel.get('other-human-rights-claim') === 'yes' ?
            list + '\nDetails added' : list;
        }
      }
    ]
  }
};
