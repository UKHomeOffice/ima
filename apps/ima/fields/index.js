'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'does-exception-apply': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'exception-details-fieldset',
      child: 'partials/exception-apply'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'does-exception-apply-detail': {
    labelClassName: 'bold',
    mixin: 'textarea',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'does-exception-apply',
      value: 'yes'
    }
  },
  'is-life-threatened': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'is-life-threatened-detail-fieldset',
      child: 'partials/threatened-detail'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'life-threatened-detail': {
    mixin: 'textarea',
    labelClassName: 'visuallyhidden',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'is-life-threatened',
      value: 'yes'
    }
  },
  'permission-to-enter-or-stay': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'permission-to-enter-or-stay-detail-fieldset',
      child: 'partials/permission-to-enter-or-stay-detail'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'permission-to-enter-or-stay-detail': {
    labelClassName: 'bold',
    mixin: 'textarea',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'permission-to-enter-or-stay',
      value: 'yes'
    }
  }
};
