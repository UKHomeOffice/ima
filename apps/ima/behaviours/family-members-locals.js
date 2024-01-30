'use strict';

const _ = require('lodash');

module.exports = superclass => class extends superclass {
  locals(req, res, next) {
    const superLocals = super.locals(req, res, next);
    // hide and show fields as necessary on family summary page
    _.forEach(superLocals.items, i => {
      _.forEach(i.fields, field => {
        if (field.field === 'reference-number-option') {
          if(field.value.includes('do-not-know')) {
            field.parsed = 'I do not know';
          } else {
            field.showInSummary = false;
          }
        }
        if (field.field === 'human-rights-claim-details') {
          field.showInSummary = false;
        }
        if (field.field === 'uan-detail') {
          if(!field.value) {
            field.showInSummary = false;
          } else {
            field.parsed = field.value;
          }
        }
        if (field.field === 'ho-number-detail') {
          if(!field.value) {
            field.showInSummary = false;
          } else {
            field.parsed = field.value;
          }
        }
        if (field.field === 'immigration-status-other') {
          field.showInSummary = false;
        }
      });
    });

    superLocals.items = superLocals.items.map(item => {
      item.fields = item.fields.map(prop => {
        prop.field += '.summary-heading';
        return prop;
      });
      return item;
    });

    return superLocals;
  }
};
