/* eslint max-len: 0 */
const moment = require('moment');
const PRETTY_DATE_FORMAT = 'DD MMMM YYYY';

module.exports = {
  'case-details': {
    steps: [
      {
        step: '/cepr',
        field: 'cepr',
        omitChangeLink: true
      },
      {
        step: '/date-of-birth',
        field: 'date-of-birth',
        parse: d => d && moment(d).format(PRETTY_DATE_FORMAT),
        omitChangeLink: true
      },
      {
        step: '/who-are-you',
        field: 'who-are-you'
      }
    ]
  },
  'immigration-adviser-details': {
    steps: [
      {
        step: '/immigration-adviser-details',
        field: 'legal-representative-fullname',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/immigration-adviser-details')) {
            return null;
          }
          return list;
        }
      },
      {
        step: '/immigration-adviser-details',
        field: 'legal-representative-email',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/immigration-adviser-details')) {
            return null;
          }
          return req.sessionModel.get('is-legal-representative-email') === 'yes' ? `${req.sessionModel.get('user-email')}` : `${req.sessionModel.get('legal-representative-email')}`;
        }
      },
      {
        step: '/immigration-adviser-details',
        field: 'legal-representative-phone-number'
      },
      {
        step: '/immigration-adviser-details',
        field: 'legal-representative-address',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/immigration-adviser-details')) {
            return null;
          }
          return `${req.sessionModel.get('legal-representative-house-number')} \n` +
            `${req.sessionModel.get('legal-representative-street')} \n` +
            `${req.sessionModel.get('legal-representative-townOrCity')}\n` +
            `${req.sessionModel.get('legal-representative-county')}\n` +
            `${req.sessionModel.get('legal-representative-postcode')}`;
        }
      }
    ]
  },
  'helper-details': {
    steps: [
      {
        step: '/helper-details',
        field: 'helper-fullname'
      },
      {
        step: '/helper-details',
        field: 'helper-relationship'
      },
      {
        step: '/helper-details',
        field: 'helper-organisation'
      }
    ]
  },
  'personal-details': {
    steps: [
      {
        step: '/full-name',
        field: 'name'
      },
      {
        step: '/your-email',
        field: 'current-email',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/your-email')) {
            return null;
          } else if (req.sessionModel.get('current-email') === 'yes') {
            return `${req.sessionModel.get('user-email')}`;
          }
          return req.sessionModel.get('email-address') === 'no' ? 'None' : `${req.sessionModel.get('email-address-details')}`;
        }
      },
      {
        step: '/phone-number',
        field: 'phone-number',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/phone-number')) {
            return null;
          }
          return req.sessionModel.get('phone-number') === 'no' ? 'None' : `${req.sessionModel.get('phone-number-details')}`;
        }
      },
      {
        step: '/immigration-detention',
        field: 'address-details',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/immigration-detention') || req.sessionModel.get('has-address') === 'yes') {
            return null;
          }
          return `${req.sessionModel.get('house-number')}\n` +
            `${req.sessionModel.get('street')}\n` +
            `${req.sessionModel.get('townOrCity')}\n` +
            `${req.sessionModel.get('county')}\n` +
            `${req.sessionModel.get('postcode')}`;
        }
      }
    ]
  },
  'immigration-detention': {
    steps: [
      {
        step: '/immigration-detention',
        field: 'has-address',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/immigration-detention')) {
            return null;
          }
          return list;
        }
      },
      {
        step: '/medical-records',
        field: 'has-permission-access',
        parse: (list, req) => {
          if (req.sessionModel.get('has-address') === 'no') {
            return null;
          }
          return list;
        },
        dependsOn: 'has-address'
      }
    ]
  },
  'exception-to-duty-to-remove': {
    steps: [
      {
        step: '/exception',
        field: 'does-exception-apply',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/exception')) {
            return null;
          }
          return req.sessionModel.get('does-exception-apply') === 'yes' ?
            'Yes' + '\nDetails added' : 'No';
        }
      }
    ]
  },
  'removal-conditions': {
    steps: [
      {
        step: '/removal-condition',
        field: 'how-removal-condition-1-applies',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/removal-condition')) {
            return null;
          } else if (req.sessionModel.get('how-removal-condition-1-applies') !== '') {
            const removalConditionsArray = req.sessionModel.get('how-removal-condition-1-applies').toString().split(',');
            return removalConditionsArray.length > 1 ?
              removalConditionsArray.length + ' reasons selected' : '1 reason selected';
          }
          return 'Not selected';
        }
      },
      {
        step: '/without-permission',
        field: 'entered-without-permission',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/without-permission')) {
            return null;
          }
          return req.sessionModel.get('entered-without-permission') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/deception',
        field: 'entered-by-deception',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/deception')) {
            return null;
          }
          return req.sessionModel.get('entered-by-deception') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/deportation-order',
        field: 'deportation-order-applied',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/deportation-order')) {
            return null;
          }
          return req.sessionModel.get('deportation-order-applied') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/travel-ban',
        field: 'entered-with-travel-ban',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/travel-ban')) {
            return null;
          }
          return req.sessionModel.get('entered-with-travel-ban') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/entry-clearance',
        field: 'arrived-without-clearance',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/entry-clearance')) {
            return null;
          }
          return req.sessionModel.get('arrived-without-clearance') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/electronic-travel-authorisation',
        field: 'without-eta',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/electronic-travel-authorisation')) {
            return null;
          }
          return req.sessionModel.get('without-eta') === 'no' ?
            list + '\nDetails added' : list;
        }
      },
      {
        step: '/arrival-date',
        field: 'arrival-after-date',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/arrival-date')) {
            return null;
          }
          return req.sessionModel.get('arrival-after-date') === 'no' ?
            list + '\n' + req.sessionModel.get('arrived-date') + '\nDetails added' : list;
        }
      },
      {
        step: '/threatened-life-or-liberty',
        field: 'is-life-threatened',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/threatened-life-or-liberty')) {
            return null;
          }
          return req.sessionModel.get('is-life-threatened') === 'yes' ?
            list + '\n' + 'Details added' : list;
        }
      },
      {
        step: '/permission',
        field: 'permission-to-enter-or-stay',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/permission')) {
            return null;
          }
          return req.sessionModel.get('permission-to-enter-or-stay') === 'yes' ?
            list + '\n' + 'Details added' : list;
        }
      }
    ]
  },
  'exception-duty-to-remove': {
    steps: [
      {
        step: '/exception',
        field: 'does-exception-apply',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/exception')) {
            return null;
          }
          return req.sessionModel.get('does-exception-apply') === 'yes' ?
            'Yes' + '\nDetails added' : 'No';
        }
      }
    ]
  },
  'removal-condition': {
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
  },
  'harm-claim': {
    steps: [
      {
        step: '/harm-claim',
        field: 'is-serious-and-irreversible',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/harm-claim')) {
            return null;
          }
          return req.sessionModel.get('is-serious-and-irreversible') === 'yes' ?
            'Yes' : 'No';
        }
      },
      {
        step: '/harm-claim-summary',
        field: 'sih-countries',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/harm-claim-summary')) {
            return null;
          }
          return req.sessionModel.get('is-serious-and-irreversible') === 'yes' ?
            'Details added' : null;
        }
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
            'Details added' : list;
        }
      }
    ]
  },
  'exceptional-circumstances': {
    steps: [
      {
        step: '/exceptional-circumstances-claim',
        field: 'exceptional-circumstances',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/exceptional-circumstances-claim')) {
            return null;
          }
          return req.sessionModel.get('exceptional-circumstances') === 'yes' ?
            'Yes' : 'No';
        }
      },
      {
        step: '/exceptional-circumstances-details',
        field: 'exceptional-circumstances-details',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/exceptional-circumstances-details')) {
            return null;
          }
          return 'Details added';
        }
      }
    ]
  },
  'temporary-permission': {
    steps: [
      {
        step: '/temporary-permission',
        field: 'temporary-permission-details-ban-only',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/temporary-permission')) {
            return null;
          }
          return (typeof req.sessionModel.get('temporary-permission-details-ban-only') !== 'undefined') ?
            'Details added' : list;
        }
      }
    ]
  },
  'temporary-permission-to-stay': {
    steps: [
      {
        step: '/temporary-permission-to-stay',
        field: 'temporary-permission',
        parse: (list, req) => {
          if (!req.sessionModel.get('steps').includes('/temporary-permission-to-stay')) {
            return null;
          }
          return req.sessionModel.get('temporary-permission') === 'yes' ?
            'Yes' + '\nDetails added' : 'No';
        }
      }
    ]
  },
  'evidence-documents': [
    {
      step: '/evidence-upload',
      field: 'images',
      parse: (list, req) => {
        if (!req.sessionModel.get('steps').includes('/evidence-upload')) {
          return null;
        }
        if (req.sessionModel.get('images')) {
          return req.sessionModel.get('images').length > 0 ? list && list.map(i => i.name).join('\n') : 'None uploaded';
        }
        return 'None uploaded';
      }
    }
  ]
};
