'use strict';

module.exports = {
  'who-are-you': {
    isPageHeading: true,
    mixin: 'radio-group',
    options: ['claimant', 'has-legal-representative', 'someone-else'],
    validate: 'required'
  }
};
