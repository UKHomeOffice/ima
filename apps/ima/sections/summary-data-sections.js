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
  'claim-details': {
    steps: [
      {
        step: '/exceptional-circumstances-claim',
        field: 'exceptional-circumstances',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/exceptional-circumstances-claim')) {
            return null;
          }
          return req.sessionModel.get('exceptional-circumstances') === 'yes' ?
            'Yes' + '\nDetails added' : 'No';
        }
      }
    ]
  }
};
