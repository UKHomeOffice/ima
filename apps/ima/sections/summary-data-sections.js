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
        step: '/temporary-permission-to-stay',
        field: 'temporary-permission',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/temporary-permission-to-stay')) {
            return null;
          }
          return req.sessionModel.get('temporary-permission') === 'yes' ?
            list + '\nDetails added' : list;
        }
      }
    ]
  }
};
