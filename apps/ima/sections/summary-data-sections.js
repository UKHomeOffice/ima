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
        step: '/removal-condition',
        field: 'how-removal-condition-1-applies',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/removal-condition')) {
            return null;
          }
          return req.sessionModel.get('how-removal-condition-1-applies') !== '' ?
            'Selected' + '\nDetails added' : 'Not selected';
        }
      }
    ]
  }
};
