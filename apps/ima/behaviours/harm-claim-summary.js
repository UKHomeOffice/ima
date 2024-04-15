const _ = require('lodash');

module.exports = superclass => class extends superclass {
  configure(req, res, next) {
    if(req.sessionModel.get('sih-countries') && !req.sessionModel.get('sih-countries').aggregatedValues.length) {
      req.form.options.addStep = 'harm-claim';
    }
    super.configure(req, res, next);
  }

  locals(req, res) {
    const locals = super.locals(req, res);
    _.forEach(locals.items, i => {
      const countryNumber = _.indexOf(locals.items, i);
      const countryName = req.sessionModel.get('sih-countries').aggregatedValues;
      _.forEach(i.fields, field => {
        if (field.field === 'is-risk-in-country') {
          if (field.value.includes('yes')) {
            field.parsed = 'Yes';
          } else if (field.value.includes('no')) {
            field.parsed = 'No';
          }
        }
        if (field.field === 'reason-in-sih') {
          field.claimDetails = true;
          if (!field.value) {
            field.showInSummary = false;
          } else {
            field.parsed = 'Details added';
          }
        }
        if (field.field === 'why-not-get-protection') {
          if (!field.value) {
            field.showInSummary = false;
          } else {
            field.parsed = 'Details added';
          }
          switch (countryNumber) {
            case 0:
              locals['country-name-1'] = countryName[0].itemTitle;
              field.field += '.summary-heading1';
              break;
            case 1:
              locals['country-name-2'] = countryName[1].itemTitle;
              field.field += '.summary-heading2';
              break;
            case 2:
              locals['country-name-3'] = countryName[2].itemTitle;
              field.field += '.summary-heading3';
              break;
            case 3:
              locals['country-name-4'] = countryName[3].itemTitle;
              field.field += '.summary-heading4';
              break;
            case 4:
              locals['country-name-5'] = countryName[4].itemTitle;
              field.field += '.summary-heading5';
              break;
            default:
          }
        }
      });
    });
    return locals;
  }
};
