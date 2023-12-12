const _ = require("lodash");
module.exports = superclass => class extends superclass {

    saveValues(req,res,next){
        _.forEach(req.sessionModel.get('sih-countries').aggregatedValues, (i) => {
            const countryNumber = _.indexOf(req.sessionModel.get('sih-countries').aggregatedValues, i);
            var countryName =  req.sessionModel.get('harm-claim-countries');
            req.form.values['country-name'] = countryName[countryNumber];
            i.itemTitle = countryName[countryNumber]
            _.forEach(i.fields, (field) => {
              if (field.field === 'countryAddNumber') {
                field.value = countryNumber
                field.parsed = countryNumber
              }
            })
          })

       // var countryArray = [...req.sessionModel.get('harm-claim-countries')]
       var countryArray = [...req.sessionModel.get('harm-country-state')]
       var currentState;
        var aggregatedCountriesLength = req.sessionModel.get('sih-countries').aggregatedValues.length;
        var harmCountriesArrayLength = req.sessionModel.get('harm-claim-countries').length;
     
      req.sessionModel.set('country-placeholder',countryArray[0]);
      currentState = req.sessionModel.get('harm-country-state').slice(1);
        
      if(aggregatedCountriesLength < harmCountriesArrayLength){
            do{
                console.log("Current State first", currentState);
                req.sessionModel.set('harm-country-state',currentState);
                console.log("Country Array", currentState);
                res.redirect('/ima/risk-of-harm');
            }
            while(currentState.length > 0)
      currentState = req.sessionModel.get('harm-country-state').slice(1);
        }
       return super.saveValues(req,res,next)
    }
    
    // getValues(req, res, next) {
    //     super.getValues(req, res, (err, values) => {
            
    
         
    //       next(err, values);
    //     });
    //   }
}
