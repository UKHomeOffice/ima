'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
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
  }
};
