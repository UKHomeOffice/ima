'use strict';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    if(req.sessionModel.get('sih-countries') !== undefined) {
      if(req.sessionModel.get('is-serious-and-irreversible') === 'no' &&
      req.sessionModel.get('sih-countries').aggregatedValues.length > 0) {
        req.sessionModel.unset('sih-countries');
      }
    }
    return super.saveValues(req, res, next);
  }
};
