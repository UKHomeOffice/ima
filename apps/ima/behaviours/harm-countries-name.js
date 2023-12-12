const _ = require("lodash");
module.exports = superclass => class extends superclass {
  // saveValues(req, res, next) {
    
   
   
  //  return super.saveValues(req, res, next);
  // }



    getValues(req,res,next){
     var isUpdate = Object.keys(req.sessionModel.get('update-country')).length !== 0;
      
      if(req.sessionModel.get('harm-country-state') === undefined){
        var countryState = [...req.sessionModel.get('harm-claim-countries')]
        req.sessionModel.set('harm-country-state', countryState);
      }

      //if(isUpdate){
      // var countryName = req.sessionModel.get('harm-country-state')[0];
     //  req.sessionModel.set('country-placeholder', countryName);
     //  req.sessionModel.set('update-country',{});
   //   }else{
        var countryName = req.sessionModel.get('harm-country-state')[0];
        req.sessionModel.set('country-placeholder', countryName);
     // }x
     
      return super.getValues(req,res,next)
    }
}
