'use strict';
module.exports = superclass => class extends superclass {
  getValues(req, res, next) {
    if (req.sessionModel.get('harm-country-state') === undefined) {
      const countryState = [...req.sessionModel.get('harm-claim-countries')];
      req.sessionModel.set('harm-country-state', countryState);
    }
    const countryName = req.sessionModel.get('harm-country-state')[0];
    req.sessionModel.set('country-placeholder', countryName);

    return super.getValues(req, res, next);
  }
  saveValues(req, res, next) {
    req.form.values.countryAddNumber = req.sessionModel.get('country-placeholder');
    return super.saveValues(req, res, next);
  }
};
