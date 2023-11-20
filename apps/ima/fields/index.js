'use strict';

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
      toggle: 'are-you-submitting-this-form-late-extension-options-yes-detail',
      child: 'textarea'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'are-you-submitting-this-form-late-extension-options-yes-detail':{
    label: 'When did you ask for an extension?',
    mixin: 'textarea',
  },
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
