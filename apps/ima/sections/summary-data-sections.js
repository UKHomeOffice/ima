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
  'immigration-detention':{
    steps: [
      {
        step: '/immigration-detention',
        field: 'immigration-detention'
      },
     
    ]
  },
  'personal-details':{
    steps: [
      {
        step: '/who-are-you',
        field: 'who-are-you'
      },
     
    ]
  }
};
