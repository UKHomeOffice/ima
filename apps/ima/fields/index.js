'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  image: {
    mixin: 'input-file',
    labelClassName: 'visuallyhidden'
  },
  'does-exception-apply': {
    isPageHeading: false,
    mixin: 'radio-group',
    labelClassName: 'visuallyhidden',
    options: [{
      value: 'yes',
      toggle: 'does-exception-apply-detail',
      child: 'textarea'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'does-exception-apply-detail':{
    mixin: 'textarea',
  },
  'have-you-been-exploited': {
    isPageHeading: false,
    mixin: 'radio-group',
    labelClassName: 'visuallyhidden',
    options: [{
      value: 'yes',
      toggle: 'have-you-been-exploited-options-yes-detail',
      child: 'textarea'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'have-you-been-exploited-options-yes-detail':{
    mixin: 'textarea',
  }
};
