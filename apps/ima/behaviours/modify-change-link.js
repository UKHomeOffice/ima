'use strict';

const _ = require('lodash');

module.exports = superclass => class extends superclass {
  locals(req, res) {
    const locals = super.locals(req, res);
    // set change link for for family-members field
    if (locals.route === 'final-summary') {
      _.forEach(locals.rows, fields => {
        locals.rows = locals.rows.map(row => {
          if (row.section === 'Human rights') {
            _.forEach(fields, sectionFields => {
              _.forEach(sectionFields, field => {
                if (field.field === 'family-members') {
                  field.changeLink = '/ima/human-rights-family-summary';
                }
              });
            });
            return row;
          }
          return row;
        });
      });
    }
    return locals;
  }
};
