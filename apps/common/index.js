'use strict';

module.exports = {
  name: 'common',
  steps: {
    '/start': {
      next: 'ima/continue-form'
    },
    '/accessibility': {
      template: 'accessibility'
    }
  }
};
