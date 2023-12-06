const _ = require("lodash");
module.exports = superclass => class extends superclass {

    getValues(req,res,next){
     
      if(req.sessionModel.get('country-count') === undefined){
        var countryCount = [...req.sessionModel.get('harm-claim-countries')]
        req.sessionModel.set('country-count', countryCount);
      }
     
      var countryName = req.sessionModel.get('country-count')[0];
      req.sessionModel.set('country-placeholder', countryName);
   
      return super.getValues(req,res,next)
    }
}
