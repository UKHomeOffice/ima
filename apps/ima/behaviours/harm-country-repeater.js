'use strict';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    req.form.values['harm-claim-countries'] = [
      req.form.values['country-1'],
      req.form.values['country-2'],
      req.form.values['country-3'],
      req.form.values['country-4'],
      req.form.values['country-5']
    ].filter(Boolean);
    return super.saveValues(req, res, next);
  }

  getValues(req, res, next) {
    super.getValues(req, res, (err, values) => {
      const harmClaimCountries = req.sessionModel.get('harm-claim-countries') || [];
      values['country-1'] = harmClaimCountries[0] || '';
      values['country-2'] = harmClaimCountries[1] || '';
      values['country-3'] = harmClaimCountries[2] || '';
      values['country-4'] = harmClaimCountries[3] || '';
      values['country-5'] = harmClaimCountries[4] || '';
      next(err, values);
    });
  }
};
