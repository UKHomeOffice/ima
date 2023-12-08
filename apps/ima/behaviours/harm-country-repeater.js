'use strict';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    
    const harmClaimCountry = req.form.values;
    const harmClaimCountries = [harmClaimCountry['country-1'],
                              harmClaimCountry['country-2'],
                              harmClaimCountry['country-3'],
                              harmClaimCountry['country-4'],
                              harmClaimCountry['country-5']]
                              .filter((countryValue) => countryValue !== '')
                              .map(country=>country);
    // req.form.values.harmClaimCountries = [
    //   req.form.values['country-1'],
    //   req.form.values['country-2'],
    //   req.form.values['country-3'],
    //   req.form.values['country-4'],
    //   req.form.values['country-5'],
    // ].filter(Boolean);
    // req.sessionModel.set('harm-claim-countries', req.form.values.harmClaimCountries)
    // req.sessionModel.set('harm-country-state',req.sessionModel.get('harm-claim-countries'))
    req.sessionModel.set('harm-claim-countries', harmClaimCountries)
  req.sessionModel.set('harm-country-state', [...harmClaimCountries]);
  
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
