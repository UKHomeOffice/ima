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
  },
  'is-risk-in-country':{
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
    validate: ['required', 'notUrl'],
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  },
  'why-not-get-protection':{
    isPageHeading: false,
    labelClassName: 'bold',
    mixin: 'textarea',
    validate: ['required', 'notUrl'],
    attributes: [{
      attribute: 'rows',
      value: 6
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
