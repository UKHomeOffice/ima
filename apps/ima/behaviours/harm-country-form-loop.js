const _ = require("lodash");
module.exports = superclass => class extends superclass {

    saveValues(req,res,next){

       // var countryArrayLength = req.sessionModel.get('country-count').length;
        var countryArray = [...req.sessionModel.get('harm-claim-countries')];
        console.log("Country Array",countryArray);
        var currentCountry;
        var currentState;
       // req.form.values['country-placeholder'];
       
        var aggregatedCountriesLength = req.sessionModel.get('sih-countries').aggregatedValues.length;
        var harmCountriesArrayLength = req.sessionModel.get('harm-claim-countries').length;
      //  currentState = req.sessionModel.get('country-count').slice(1);
      req.sessionModel.set('country-placeholder',countryArray[0]);
     // currentState = countryArray.slice(1);
        if(aggregatedCountriesLength < harmCountriesArrayLength){
            currentState = countryArray.slice(1);
            do{
                currentState = countryArray.slice(1);
                console.log("Current State", currentState);
              //  req.sessionModel.set('country-placeholder',currentState[0]);
                req.sessionModel.set('country-count',currentState);
                console.log("Country Array", currentState);
                res.redirect('/ima/risk-of-harm');
            }
            while(currentState.length > 0)
            //currentState = countryArray.slice(1);
            

         /////   countryArray.forEach(country => {
             /////   currentCountry = country;
                // currentState = req.sessionModel.get('country-count').slice(1);
                // req.sessionModel.set('country-count',currentState);
                
              /////  currentState = countryArray.slice(1);
              //  req.sessionModel.set('country-placeholder',currentCountry);
            /////    req.sessionModel.set('country-count',currentState);

                // _.forEach(req.sessionModel.get('sih-countries').aggregatedValues, (i) => {
                //     const countryNumber = _.indexOf(req.sessionModel.get('sih-countries').aggregatedValues, i);
                //     var countryName =  req.sessionModel.get('harm-claim-countries');
                //    console.log("COUNTRY NAME" , countryName[countryNumber]);
                //     req.sessionModel.set('country-placeholder', countryName[countryNumber]);

                    // i.itemTitle = countryName[countryNumber]
                    // _.forEach(i.fields, (field) => {
                    //   if (field.field === 'countryAddNumber') {
                    //     field.value = countryNumber
                    //     field.parsed = countryNumber
                    //   }
                    // })
               //})

               

                //res.redirect('/ima/risk-of-harm');
           ///// });
        }
                // while(countryArrayLength > 0) {
                //     currentCountry = req.sessionModel.get('country-count')[0];
                //     currentState = req.sessionModel.get('country-count').slice(1);
                //     req.sessionModel.set('country-count',currentState);
                //     req.sessionModel.set('country-1',currentCountry);
                //     res.redirect('/ima/risk-of-harm');
                //     //req.sessionModel.push(currentCountry);
                //     console.log(req.sessionModel);
                // }
                // console.log(req.sessionModel);

        return super.saveValues(req,res,next)
    }
    
    // getValues(req, res, next) {
    //     super.getValues(req, res, (err, values) => {
    //       const harmClaimCountries = req.sessionModel.get('harm-claim-countries') || [];
    //       harmClaimCountries.array.forEach(country => {
            
    //       });
    
         
    //       next(err, values);
    //     });
    //   }
}
