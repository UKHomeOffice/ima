'use strict';

const dateComponent = require('hof').components.date;
const UANRef = {
  type: 'regex',
  arguments: /^([0-9]{6,10}?)$/
};
const after1900Validator = { type: 'after', arguments: ['1900'] };

module.exports = {
  cepr: {
    labelClassName: 'visuallyhidden',
    validate: [
      'required',
      UANRef
    ]
  },
  'date-of-birth': dateComponent('date-of-birth', {
    legend: {
      className: 'bold'
    },
    validate: ['required', 'before', after1900Validator]
  }),
  'user-email': {
    labelClassName: 'visuallyhidden',
    validate: ['required', 'email'],
    formatter: ['lowercase']
  }
};
