'use strict';
const _ = require('lodash');
module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    _.forEach(req.sessionModel.get('sih-countries').aggregatedValues, i => {
      const countryNumber = _.indexOf(req.sessionModel.get('sih-countries').aggregatedValues, i);
      const countryName = req.sessionModel.get('harm-claim-countries');
      req.form.values['country-name'] = countryName[countryNumber];
      i.itemTitle = countryName[countryNumber];
      _.forEach(i.fields, field => {
        if (field.field === 'countryAddNumber') {
          field.value = countryNumber;
          field.parsed = countryNumber;
        }
      });
    });

    const countryArray = [...req.sessionModel.get('harm-country-state')];

    const aggregatedCountriesLength = req.sessionModel.get('sih-countries').aggregatedValues.length;
    const harmCountriesArrayLength = req.sessionModel.get('harm-claim-countries').length;

    req.sessionModel.set('country-placeholder', countryArray[0]);

    const currentState = req.sessionModel.get('harm-country-state').slice(1);

    if (aggregatedCountriesLength < harmCountriesArrayLength) {
      do {
        req.sessionModel.set('harm-country-state', currentState);
        res.redirect('/ima/risk-of-harm');
      }
      while (currentState.length > 0);
    }

    return super.saveValues(req, res, next);
  }
};
