'use strict';

const dateComponent = require('hof').components.date;
const after1900Validator = { type: 'after', arguments: ['1900'] };

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['person-named', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'arrival-after-date': {
    isPageHeading: true,
    legend: {
      className: 'visuallyhidden'
    },
    mixin: 'radio-group',
    options: [{
      value: 'yes'
    }, {
      value: 'no',
      toggle: 'arrival-date-detail-fieldset',
      child: 'partials/arrival-date-detail'
    }],
    validate: 'required'
  },
  'arrived-date': dateComponent('arrived-date', {
    validate: ['required', 'date', after1900Validator, { type: 'before', arguments: '2023-07-20' }],
    validationLink: {
      field: 'arrival-after-date',
      value: 'no'
    }
  }),
  'arrival-details': {
    labelClassName: 'bold',
    mixin: 'textarea',
    validate: ['required', 'notUrl', { type: 'regex', arguments: /^[^\[\]\|<>]*$/ },
      { type: 'maxlength', arguments: 15000 }],
    dependent: {
      field: 'arrival-after-date',
      value: 'no'
    },
    attributes: [{
      attribute: 'rows',
      value: 6
    }]
  }
};
