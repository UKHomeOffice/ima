'use strict';

module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    if(req.sessionModel.get('family-members') !== undefined) {
      if(req.sessionModel.get('human-rights-claim') === 'no' &&
      req.sessionModel.get('family-members').aggregatedValues.length > 0) {
        req.sessionModel.unset('family-members');
      }
    }
    return super.saveValues(req, res, next);
  }
};
