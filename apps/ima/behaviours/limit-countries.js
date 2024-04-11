module.exports = superclass => class extends superclass {
    locals(req, res) {
      const locals = super.locals(req, res);
      const harmClaims = req.sessionModel.get('sih-countries').aggregatedValues;
      const harmClaimLimit = harmClaims.length >= 5;
  
      if (harmClaims && harmClaimLimit) {
        locals.noMoreHarmClaims = true;
        return locals;
      }
  
      return locals;
    }
  };
