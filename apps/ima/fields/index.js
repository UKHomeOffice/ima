'use strict';

const dateComponent = require('hof').components.date;
const after1900Validator = { type: 'after', arguments: ['1900'] };
const countries = require('hof').utils.countries();
const familyMemberImmigrationStatus = require('../data/immigration-status');
const UANRef = {
  type: 'regex',
  arguments: /^(\d{4}-\d{4}-\d{4}-\d{4})$/
};
const moment = require('moment');
const PRETTY_DATE_FORMAT = 'DD/MM/YYYY';
const _ = require('lodash');

function notBothOptions(vals) {
  const values = _.castArray(vals);
  return !(values.length > 1 && values.indexOf('do-not-know') > -1);
}

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'human-rights-claim': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  },
  'family-member-relation': {
    isPageHeading: false,
    labelClassName: 'bold',
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'input-text',
    validate: 'required'
  },
  'family-member-full-name': {
    isPageHeading: false,
    labelClassName: 'bold',
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'input-text',
    validate: 'required'
  },
  'family-member-dob': dateComponent('family-member-dob', {
    legend: {
      className: 'bold'
    },
    validate: ['required', 'date', 'before', after1900Validator],
    parse: d => d && moment(d).format(PRETTY_DATE_FORMAT)
  }),
  'family-member-nationality': {
    mixin: 'select',
    className: ['js-hidden'],
    labelClassName: 'bold',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.family-member-nationality.options.null'
    }].concat(countries)
  },
  'uk-immigration-status': {
    mixin: 'select',
    className: ['js-hidden'],
    labelClassName: 'bold',
    validate: ['required'],
    options: [{
      value: '',
      label: 'fields.uk-immigration-status.options.null'
    }].concat(familyMemberImmigrationStatus)
  },
  'immigration-status-other': {
    isPageHeading: false,
    mixin: 'input-text',
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'uk-immigration-status',
      value: 'Other'
    },
    validate: 'required'
  },
  'reference-number-option': {
    mixin: 'checkbox-group',
    legend: {
      className: 'bold'
    },
    validate: ['required', notBothOptions],
    options: [{
      value: 'unique-application-number',
      toggle: 'uan-detail',
      child: 'input-text'
    }, {
      value: 'home-office-reference-number',
      toggle: 'ho-number-detail',
      child: 'input-text'
    }, {
      value: 'do-not-know'
    }]
  },
  'uan-detail': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'reference-number-option',
      value: 'unique-application-number'
    },
    validate: [
      'required',
      UANRef
    ],
    mixin: 'input-text'
  },
  'ho-number-detail': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    dependent: {
      field: 'reference-number-option',
      value: 'home-office-reference-number'
    },
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[A-Z][0-9]{7}$/ }],
    mixin: 'input-text'
  },
  'other-human-rights-claim': {
    isPageHeading: false,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes',
      toggle: 'other-human-rights-claim-details-fieldset',
      child: 'partials/other-human-rights-claim-details'
    }, {
      value: 'no'
    }],
    validate: 'required'
  },
  'human-rights-claim-details': {
    mixin: 'textarea',
    labelClassName: 'bold',
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }]
  },
  'other-human-rights-claim-details': {
    mixin: 'textarea',
    labelClassName: 'visuallyhidden',
    dependent: {
      field: 'other-human-rights-claim',
      value: 'yes'
    },
    attributes: [{
      attribute: 'rows',
      value: 5
    }],
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }]
  }
};
