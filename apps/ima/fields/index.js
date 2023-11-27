'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
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
  }
};
