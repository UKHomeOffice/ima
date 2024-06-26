'use strict';
const dateComponent = require('hof').components.date;
const after1900Validator = { type: 'after', arguments: ['1900'] };
const countries = require('hof').utils.countries();
const familyMemberImmigrationStatus = require('../data/immigration-status');
const UANRef = {
  type: 'regex',
  arguments: /^(\d{4}-\d{4}-\d{4}-\d{4})$/
};
const moment = require('moment');
const PRETTY_DATE_FORMAT = 'DD/MM/YYYY';
const _ = require('lodash');

function notBothOptions(vals) {
  const values = _.castArray(vals);
  return !(values.length > 1 && values.indexOf('do-not-know') > -1);
}

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'helper'],
    validate: 'required'
  },
  'in-the-uk': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  },
  name: {
    labelClassName: 'visuallyhidden',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [200] }],
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'current-email': {
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  'is-your-email': {
    isPageHeading: true
  },
  'phone-number': {
    isPageHeading: true,
    mixin: 'radio-group',
    validate: ['required'],
    options: [{
      value: 'yes',
      toggle: 'phone-number-details',
      child: 'input-text'
    }, {
      value: 'no'
    }]
  },
  'phone-number-details': {
    validate: ['required', 'internationalPhoneNumber', { type: 'maxlength', arguments: [200] }],
    className: ['govuk-input', 'govuk-!-width-two-thirds'],
    dependent: {
      field: 'phone-number',
      value: 'yes'
    }
  },
  'email-address': {
    isPageHeading: true,
    mixin: 'radio-group',
    validate: ['required'],
    options: [{
      value: 'yes',
      toggle: 'email-address-details',
      child: 'input-text'
    }, {
      value: 'no'
    }]
  },
  'email-address-details': {
    validate: ['required', 'email'],
    className: ['govuk-input', 'govuk-!-width-two-thirds'],
    dependent: {
      field: 'email-address',
      value: 'yes'
    }
  },
  'has-address': {
    isPageHeading: true,
    mixin: 'radio-group',
    validate: ['required'],
    options: [{
      value: 'yes'
    },
    {
      value: 'no',
      toggle: 'address-details-fieldset',
      child: 'partials/address-details'
    }]
  },
  'house-number': {
    mixin: 'input-text',
    validate: ['required', 'notUrl'],
    includeInSummary: false,
    validationLink: {
      field: 'has-address',
      value: 'no'
    }
  },
  street: {
    mixin: 'input-text',
    validate: ['notUrl'],
    includeInSummary: false,
    validationLink: {
      field: 'has-address',
      value: 'no'
    }
  },
  townOrCity: {
    mixin: 'input-text',
    validate: ['required', 'notUrl',
      { type: 'regex', arguments: /^([^0-9]*)$/ },
      { type: 'maxlength', arguments: 200 }
    ],
    className: ['govuk-input', 'govuk-!-width-two-thirds'],
    validationLink: {
      field: 'has-address',
      value: 'no'
    }
  },
  county: {
    mixin: 'input-text',
    validate: ['notUrl',
      { type: 'regex', arguments: /^([^0-9]*)$/ },
      { type: 'maxlength', arguments: 200 }
    ],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds'],
    validationLink: {
      field: 'has-address',
      value: 'no'
    }
  },
  postcode: {
    mixin: 'input-text',
    validate: ['required', 'postcode', { type: 'maxlength', arguments: [200] }],
    formatter: ['ukPostcode'],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-input--width-10'],
    validationLink: {
      field: 'has-address',
      value: 'no'
    }
  },
  'immigration-adviser-details': {
    isPageHeading: true
  },
  'legal-representative-phone-number': {
    labelClassName: 'bold',
    validate: ['required', 'internationalPhoneNumber', { type: 'maxlength', arguments: [200] }],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'legal-representative-fullname': {
    labelClassName: 'bold',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [200] }],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'legal-representative-organisation': {
    labelClassName: 'bold',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: [200] }],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'legal-representative-house-number': {
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 200 }],
    includeInSummary: false
  },
  'legal-representative-street': {
    validate: ['notUrl', { type: 'maxlength', arguments: 200 }],
    includeInSummary: false
  },
  'legal-representative-townOrCity': {
    validate: ['required', 'notUrl',
      { type: 'regex', arguments: /^([^0-9]*)$/ },
      { type: 'maxlength', arguments: 200 }
    ],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'legal-representative-county': {
    validate: ['notUrl',
      { type: 'regex', arguments: /^([^0-9]*)$/ },
      { type: 'maxlength', arguments: 200 }
    ],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'legal-representative-postcode': {
    validate: ['required', 'postcode', { type: 'maxlength', arguments: [200] }],
    formatter: ['ukPostcode'],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-input--width-10'],
    validationLink: {
      field: ''
    }
  },
  'is-legal-representative-email': {
    isPageHeading: true,
    mixin: 'radio-group',
    validate: ['required'],
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'legal-representative-email-details-fieldset',
      child: 'partials/legal-representative-email-details'
    }]
  },
  'helper-details': {
    isPageHeading: true
  },
  'helper-fullname': {
    labelClassName: 'bold',
    mixin: 'input-text',
    validate: ['required', 'notUrl'],
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'helper-relationship': {
    labelClassName: 'bold',
    mixin: 'input-text',
    validate: ['required', 'notUrl'],
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'helper-organisation': {
    labelClassName: 'bold',
    mixin: 'input-text',
    className: ['govuk-input', 'govuk-!-width-two-thirds']
  },
  'has-permission-access': {
    legend: {
      className: 'bold'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'response-label',
      child: 'partials/permission-response'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'does-exception-apply': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'exception-details-fieldset',
      child: 'partials/exception-apply'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'does-exception-apply-detail': {
    labelClassName: 'bold',
    mixin: 'textarea',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'does-exception-apply',
      value: 'yes'
    }
  },
  'how-removal-condition-1-applies': {
    mixin: 'checkbox-group',
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'entered-without-permission'
    }, {
      value: 'by-deception'
    }, {
      value: 'deportation-order-applies'
    }, {
      value: 'travel-ban'
    }, {
      value: 'arrived-without-visa'
    }, {
      value: 'arrived-without-eta'
    }]
  },
  'entered-without-permission': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-without-permission-detail-fieldset',
      child: 'partials/entered-without-permission-detail'
    }],
    validate: 'required'
  },
  'entered-without-permission-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-without-permission',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'entered-with-travel-ban': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-with-travel-ban-detail-fieldset',
      child: 'partials/entered-with-travel-ban-detail'
    }],
    validate: 'required'
  },
  'entered-with-travel-ban-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-with-travel-ban',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'entered-by-deception': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'entered-by-deception-detail-fieldset',
      child: 'partials/entered-by-deception-detail'
    }],
    validate: 'required'
  },
  'entered-by-deception-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'entered-by-deception',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'arrived-without-clearance': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'arrived-without-clearance-detail-fieldset',
      child: 'partials/arrived-without-clearance-detail'
    }],
    validate: 'required'
  },
  'arrived-without-clearance-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'arrived-without-clearance',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'without-eta': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'without-eta-detail-fieldset',
      child: 'partials/without-eta-detail'
    }],
    validate: 'required'
  },
  'without-eta-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'without-eta',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'deportation-order-applied': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: 'visuallyhidden'
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'deportation-order-applied-detail-fieldset',
      child: 'partials/deportation-order-applied-detail'
    }],
    validate: 'required'
  },
  'deportation-order-applied-detail': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'deportation-order-applied',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }]
  },
  'arrival-after-date': {
    isPageHeading: true,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'arrival-date-detail-fieldset',
      child: 'partials/arrival-date-detail'
    }],
    validate: 'required'
  },
  'arrived-date': dateComponent('arrived-date', {
    validate: ['required', 'date', after1900Validator, { type: 'before', arguments: '2023-07-20' }],
    validationLink: {
      field: 'arrival-after-date',
      value: 'no'
    }
  }),
  'arrival-details': {
    labelClassName: 'bold',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'arrival-after-date',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'is-life-threatened': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'is-life-threatened-detail-fieldset',
      child: 'partials/threatened-detail'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'life-threatened-detail': {
    mixin: 'textarea',
    labelClassName: 'visuallyhidden',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'is-life-threatened',
      value: 'yes'
    }
  },
  'permission-to-enter-or-stay': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'permission-to-enter-or-stay-detail-fieldset',
      child: 'partials/permission-to-enter-or-stay-detail'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'permission-to-enter-or-stay-detail': {
    labelClassName: 'bold',
    mixin: 'textarea',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'permission-to-enter-or-stay',
      value: 'yes'
    }
  },
  'is-serious-and-irreversible': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  },
  'is-risk-in-country': {
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  'reason-in-sih': {
    labelClassName: 'visuallyhidden',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'why-not-get-protection': {
    isPageHeading: false,
    labelClassName: 'bold',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'country-1': {
    mixin: 'select',
    labelClassName: 'visuallyhidden',
    className: ['js-hidden'],
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.country-1.options.null'
    }].concat(countries)
  },
  countryAddNumber: {
    className: 'visuallyhidden',
    labelClassName: 'visuallyhidden'
  },
  'human-rights-claim': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  },
  'family-member-relation': {
    isPageHeading: false,
    labelClassName: 'bold',
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'input-text',
    validate: 'required'
  },
  'family-member-full-name': {
    isPageHeading: false,
    labelClassName: 'bold',
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'input-text',
    validate: 'required'
  },
  'family-member-dob': dateComponent('family-member-dob', {
    legend: {
      className: 'bold'
    },
    validate: ['required', 'date', 'before', after1900Validator],
    parse: d => d && moment(d).format(PRETTY_DATE_FORMAT)
  }),
  'family-member-nationality': {
    mixin: 'select',
    className: ['js-hidden'],
    labelClassName: 'bold',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.family-member-nationality.options.null'
    }].concat(countries)
  },
  'uk-immigration-status': {
    mixin: 'select',
    className: ['js-hidden'],
    labelClassName: 'bold',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.uk-immigration-status.options.null'
    }].concat(familyMemberImmigrationStatus)
  },
  'immigration-status-other': {
    isPageHeading: false,
    mixin: 'input-text',
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'uk-immigration-status',
      value: 'Other'
    },
    validate: 'required'
  },
  'reference-number-option': {
    mixin: 'checkbox-group',
    legend: {
      className: 'bold'
    },
    validate: ['required', notBothOptions],
    options: [{
      value: 'unique-application-number',
      toggle: 'uan-detail',
      child: 'input-text'
    }, {
      value: 'home-office-reference-number',
      toggle: 'ho-number-detail',
      child: 'input-text'
    }, {
      value: 'do-not-know'
    }]
  },
  'uan-detail': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'reference-number-option',
      value: 'unique-application-number'
    },
    validate: [
      'required',
      UANRef
    ],
    mixin: 'input-text'
  },
  'ho-number-detail': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'reference-number-option',
      value: 'home-office-reference-number'
    },
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[A-Z][0-9]{7}$/ }],
    mixin: 'input-text'
  },
  'other-human-rights-claim': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'other-human-rights-claim-details-fieldset',
      child: 'partials/other-human-rights-claim-details'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'human-rights-claim-details': {
    mixin: 'textarea',
    labelClassName: 'bold',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }]
  },
  'other-human-rights-claim-details': {
    mixin: 'textarea',
    labelClassName: 'visuallyhidden',
    dependent: {
      field: 'other-human-rights-claim',
      value: 'yes'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }]
  },
  'exceptional-circumstances': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'exceptional-circumstances-details': {
    mixin: 'textarea',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }]
  },
  'temporary-permission': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'temporary-permission-detail-fieldset',
      child: 'partials/temporary-permission-detail'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'temporary-permission-reasons': {
    mixin: 'checkbox-group',
    legend: {
      className: 'bold'
    },
    validate: 'required',
    dependent: {
      field: 'temporary-permission',
      value: 'yes'
    },
    options: [{
      value: 'human-rights'
    }, {
      value: 'other-international-obligations'
    }, {
      value: 'exceptional-circumstances'
    }]
  },
  'temporary-permission-details': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'temporary-permission',
      value: 'yes'
    },
    attributes: [{
      attribute: 'rows',
      value: 7
    }]
  },
  'temporary-permission-reasons-ban-only': {
    mixin: 'checkbox-group',
    labelClassName: 'visuallyhidden',
    legend: {
      className: 'visuallyhidden'
    },
    validate: 'required',
    options: [{
      value: 'human-rights'
    }, {
      value: 'other-international-obligations'
    }, {
      value: 'exceptional-circumstances'
    }]
  },
  'temporary-permission-details-ban-only': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    attributes: [{
      attribute: 'rows',
      value: 7
    }]
  },
  image: {
    mixin: 'input-file',
    labelClassName: 'visuallyhidden'
  },
  'are-you-submitting-this-form-late': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: ['visuallyhidden']
    },
    options: [{
      value: 'yes'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'are-you-submitting-this-form-late-extension': {
    isPageHeading: false,
    mixin: 'radio-group',
    legend: {
      className: ['govuk-heading-m']
    },
    options: [{
      value: 'yes',
      toggle: 'late-submission-extension-details-fieldset',
      child: 'partials/late-submission-extension-details'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'late-extension-options-yes-detail':
    dateComponent('late-extension-options-yes-detail', {
      validate: ['required', 'date', 'before', after1900Validator],
      validationLink: {
        field: 'are-you-submitting-this-form-late-extension',
        value: 'yes'
      }
    }),
  'late-submission': {
    labelClassName: 'visuallyhidden',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'language-used': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }]
  },
  'use-interpreter': {
    isPageHeading: false,
    legend: {
      className: ['govuk-heading-m']
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'immigration-adviser-declaration': {
    mixin: 'checkbox',
    validate: 'required'
  },
  'helper-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  },
  'person-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  }
};
