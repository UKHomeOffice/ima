'use strict';
const countries = require('hof').utils.countries();

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'is-serious-and-irreversible':{
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  'is-risk-in-country':{
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  'reason-in-sih':{
    labelClassName:'visuallyhidden',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]{1,2000}$/ },
      { type: 'maxlength', arguments: 2000 }],
    attributes: [{
      attribute: 'rows',
      value: 4
    }]
  },
  'has-anything-happened':{
    labelClassName:'visuallyhidden',
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'has-anything-happened-fieldset',
      child: 'partials/has-anything-happened-details'
     }, {
      value: 'no'
      }],
    validate: 'required',
    legend: {
      className: 'visuallyhidden'
    }
  },
  'anything-happened-details':{
    labelClassName:'visuallyhidden',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]{1,2000}$/ },
      { type: 'maxlength', arguments: 2000 }],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'why-not-get-protection':{
    isPageHeading: false,
    labelClassName: 'bold',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]{1,2000}$/ },
      { type: 'maxlength', arguments: 2000 }],
    attributes: [{
      attribute: 'rows',
      value: 4
    }]
  },
  'country-1':{
    mixin: 'select',
    className: ['js-hidden'],
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.country-1.options.null'
    }].concat(countries)
  },
  'country-2':{
    mixin: 'select',
    className: ['js-hidden'],
    options: [{
      value: '',
      label: 'fields.country-2.options.null'
    }].concat(countries)
  },
  'country-3':{
    mixin: 'select',
    className: ['js-hidden'],
    options: [{
      value: '',
      label: 'fields.country-3.options.null'
    }].concat(countries)
  }
};
