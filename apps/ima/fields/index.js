'use strict';
const dateComponent = require('hof').components.date;
const after1900Validator = { type: 'after', arguments: ['1900'] };

module.exports = {
  'who-are-you': {
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  image: {
    mixin: 'input-file',
    labelClassName: 'visuallyhidden'
  },
  'are-you-submitting-this-form-late': {
    isPageHeading: false,
    mixin: 'radio-group',
    labelClassName: 'visuallyhidden',
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
    labelClassName: 'visuallyhidden',
    options: [{
      value: 'yes',
      toggle: 'late-submission-extension-details-fieldset',
      child: 'partials/late-submission-extension-details'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'are-you-submitting-this-form-late-extension-options-yes-detail':
    dateComponent('are-you-submitting-this-form-late-extension-options-yes-detail', {
      validate: ['required', after1900Validator],
      validationLink: {
        field: 'are-you-submitting-this-form-late-extension',
        value: 'yes'
      }
    }),
  'declaration-immigration-adviser': {
    isPageHeading: false,
    mixin: 'radio-group',
    labelClassName: 'visuallyhidden',
    options: [{
      value: 'yes'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'declaration-someone-else': {
    isPageHeading: false,
    mixin: 'radio-group',
    labelClassName: 'visuallyhidden',
    options: [{
      value: 'yes'
    }, {
      value: 'no'
    }],
    validate: 'required'
  }
};
