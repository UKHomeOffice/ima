'use strict';

const dateComponent = require('hof').components.date;

module.exports = {
  'uan': {
    labelClassName: 'bold',
    validate: [
      'required',
      { type: 'minlength', arguments: [16] }
    ]
  },
  'date-of-birth': dateComponent('date-of-birth', {
    legend: {
      className: 'bold'
    },
    validate: ['required', 'before', 'over18']
  }),
  'user-email': {
    className: ['form-control form-control-3-4'],
    labelClassName: 'visuallyhidden',
    validate: ['required', 'email', {type: 'maxlength', arguments: [15000]}],
    formatter: ['lowercase']
  }
};
