'use strict';

const _ = require('lodash');

module.exports = superclass => class extends superclass {
  locals(req, res, next) {
    const superLocals = super.locals(req, res, next);
    // hide and show fields as necessary on family claiming asylum summary page
    _.forEach(superLocals.items, i => {
      _.forEach(i.fields, field => {
        if (field.field === 'wouldYourChildrenBePutAtRiskOptions') {
          if (!field.value) {
            field.showInSummary = false;
          }
        }
        if (field.field === 'childrenRiskDifferentReasonDetails') {
          if (!field.value) {
            field.showInSummary = false;
          }
        }
        if (field.field === 'childIdDocuments') {
          if (field.value === 'national-identity-card') {
            field.parsed = 'National identity card';
          } else if (field.value === 'birth-certificate') {
            field.parsed = 'Birth certificate';
          } else {
            field.parsed = _.capitalize(field.value);
          }
          if (Array.isArray(field.value)) {
            field.parsed = field.value.map(a => {
              if (a === 'national-identity-card') {
                return 'National identity card';
              } else if (a === 'birth-certificate') {
                return 'Birth certificate';
              }
              return _.capitalize(a);
            }).join('\n');
          }
          if (!field.value) {
            field.showInSummary = false;
          }
        }
        if (field.field === 'childIdDocumentsDetails') {
          if (!field.value) {
            field.showInSummary = false;
          }
        }
      });
    });

    superLocals.items = superLocals.items.map(item => {
      const immigrationStatus = _.find(item.fields, obj => obj.field === 'ukFamilyMemberImmigrationStatus');

      item.fields = item.fields.map(prop => {
        const mentalHealthField = prop.field === 'ukFamilyMemberHealthCondition';

        if (_.get(immigrationStatus, 'value') !== 'Dependant on your asylum application'
          && mentalHealthField) {
          return null;
        }
        if (mentalHealthField) {
          prop.value = prop.value || 'None';
        }
        prop.field += '.summary-heading';
        return prop;
      });
      return item;
    });

    return superLocals;
  }
};
