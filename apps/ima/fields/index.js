'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'in-the-uk': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  },
  'name':{
    isPageHeading: true
  },
  'is-your-email': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
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
    validate: ['required', 'internationalPhoneNumber', {type: 'maxlength', arguments: [200]}],
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
  'has-legal-representative':{
    isPageHeading: true,
  },

  'legal-representative-phone-number': {
    labelClassName: 'visuallyhidden',
    validate: ['required', 'internationalPhoneNumber', {type: 'maxlength', arguments: [200]}]
  },
  'legal-representative-fullname': {
    isPageHeading: true,
    validate: ['required', 'notUrl', {type: 'maxlength', arguments: [200]}]
  },
  'legal-representative-organisation':{
    isPageHeading: true,
    validate: ['required', 'notUrl', {type: 'maxlength', arguments: [200]}]
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
    validate: ['required', 'postcode', {type: 'maxlength', arguments: [200]}],
    formatter: ['ukPostcode'],
    includeInSummary: false,
    className: ['govuk-input', 'govuk-input--width-10'],
    validationLink: {
      field: ''
    }
  },
  'someone-else':{
    isPageHeading: true
  },
  'helper-fullname':{
    mixin: 'input-text',
    validate: ['required', 'notUrl']
  },
  'helper-relationship' :{
    mixin: 'input-text',
    validate: ['required', 'notUrl']
  }, 
  'helper-organisation':{
    mixin: 'input-text'
  }
};