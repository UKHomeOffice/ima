'use strict';

module.exports = {
  'who-are-you': {
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'helper'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  image: {
    mixin: 'input-file',
    labelClassName: 'visuallyhidden'
  },
  'language-used': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }]
  },
  'use-interpreter': {
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
  'immigration-adviser-declaration': {
    mixin: 'checkbox',
    validate: 'required'
  },
  'language-used1': {
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'maxlength', arguments: 15000 }]
  },
  'use-interpreter1': {
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
  'helper-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  },
  'person-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  }
};
