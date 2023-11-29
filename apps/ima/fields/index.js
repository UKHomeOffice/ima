'use strict';

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
  'helper-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  },
  'person-declaration': {
    mixin: 'checkbox',
    validate: ['required']
  }
};
