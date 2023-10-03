'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['asylum-seeker', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  },
  'in-the-uk': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['yes', 'no'],
    validate: 'required'
  }
};
