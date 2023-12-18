'use strict';
const dateComponent = require('hof').components.date;
const after1900Validator = { type: 'after', arguments: ['1900'] };

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'helper'],
    validate: 'required'
  },
  image: {
    mixin: 'input-file',
    labelClassName: 'visuallyhidden'
  },
  'language-used': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }]
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
