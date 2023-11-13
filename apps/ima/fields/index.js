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
