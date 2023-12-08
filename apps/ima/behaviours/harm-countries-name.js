const _ = require("lodash");
module.exports = superclass => class extends superclass {
  saveValues(req, res, next) {
    
   
   
   return super.saveValues(req, res, next);
  }



    getValues(req,res,next){
     
      if(req.sessionModel.get('harm-country-state') === undefined){
        var countryState = [...req.sessionModel.get('harm-claim-countries')]
        req.sessionModel.set('harm-country-state', countryState);
      }
     
      var countryName = req.sessionModel.get('harm-country-state')[0];
      req.sessionModel.set('country-placeholder', countryName);
   
      return super.getValues(req,res,next)
    }
}
